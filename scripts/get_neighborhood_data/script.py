from scripts.get_neighborhood_data.nyc_data_schemas import NeighborhoodSchema
from domain import Neighborhood
from requests import get
from math import tan, pi, log, radians
from dataclasses import asdict, replace
import json

data = get("https://data.cityofnewyork.us/resource/9nt8-h7nd.json")

neighborhoods: list[Neighborhood] = NeighborhoodSchema().load(data.json(), many=True)
_NEIGHBORHOODS_TO_MERGE = {
    "Astoria-Ditmars-Steinway-Woodside":["Old Astoria-Hallets Point"] # Old astoria is not really a separate neighborhood
}

def mercator(lon, lat):
    """
    Convert latitude and longitude to Web Mercator (EPSG:3857) coordinates.

    Parameters:
        lat (float): Latitude in degrees.
        lon (float): Longitude in degrees.

    Returns:
        (float, float): Tuple containing x and y in meters.
    """
    RADIUS = 6378137  # Earth's radius in meters (WGS84)

    x = RADIUS * radians(lon)
    y = RADIUS * log(tan(pi / 4 + radians(lat) / 2))

    return x, y


def flatten_coords(coords):
    """
    Neighborhoods are made of multiple polygons.
    Coordinates from NYC data come in as a list of lists of coordinates. (a 3d list)
    Each "sub-list" represents a polygon that is part of that neighborhood.
    """
    polygons = []
    for group in coords:
        for polygon in group:
            polygons.append(polygon)
    return polygons


def populate_polygons(neighborhood: Neighborhood):
    """
    Takes a neighborhood, flattens all coordinates (assuming coordinates is 3d array of coords)
    Projects all coordinates with mercator projection, returns updated neighborhood.
    """
    polygons = flatten_coords(neighborhood.geometry.coordinates)
    projected_polygons = []
    for polygon in polygons:
        projected_polygons.append([mercator(coord.lat, coord.lon) for coord in polygon])
    neighborhood.polygons = projected_polygons
    return neighborhood


def project_polygons_to_screen(neighborhoods: list[Neighborhood], width, height):
    all_coords = [
        coord
        for neighborhood in neighborhoods
        for polygon in neighborhood.polygons
        for coord in polygon
    ]

    xs, ys = zip(*all_coords)

    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)

    x_range = max_x - min_x
    y_range = max_y - min_y

    scale_x = width / x_range
    scale_y = height / y_range
    scale = min(scale_x, scale_y)

    for neighborhood in neighborhoods:
        new_polygons = []
        for polygon in neighborhood.polygons:
            screen_coords = []
            for x, y in polygon:
                sx = (x - min_x) * scale
                sy = height - (y - min_y) * scale
                screen_coords.append((sx, sy))
            new_polygons.append(screen_coords)
        neighborhood.polygons = new_polygons
    return neighborhoods


def merge_like_neighborhoods(neighborhoods: list[Neighborhood]):
    neighborhoods_dict: dict[str:Neighborhood] = {}
    for neighborhood in neighborhoods:
        original_name = neighborhood.name
        if original_name != "Co-op City":  # exception to dash rule
            name_tuple = ()
            for name in original_name.split("-"):
                name = name.removesuffix("(North)")
                name = name.removesuffix("(South)")
                name = name.removesuffix("(East)")
                name = name.removesuffix("(West)")
                name = name.removesuffix("(Central)")
                name = name.strip()
                name_tuple = name_tuple + (name,)

            key = find_dict_entry(
                dict=neighborhoods_dict, tuple=name_tuple, neighborhood=neighborhood
            )
            if key:
                neighborhoods_dict[key].polygons += neighborhood.polygons
                neighborhoods_dict[
                    key
                ].geometry.coordinates += neighborhood.geometry.coordinates
                new_key = key + tuple(name for name in name_tuple if name not in key)
                if key != new_key:
                    neighborhoods_dict[new_key] = neighborhoods_dict[key]
                    del neighborhoods_dict[key]
            else:
                neighborhoods_dict[name_tuple] = neighborhood
    return_dict: dict[str, Neighborhood] = {}
    for k in neighborhoods_dict.keys():
        neighborhoods_dict[k].name = "-".join(k)
        return_dict[neighborhoods_dict[k].name] = neighborhoods_dict[k]
    return return_dict

def manual_merge_neighborhoods(neighborhoods_dict: dict[str,Neighborhood]):
    return_dict: dict[str,Neighborhood] = dict(neighborhoods_dict)
    for neighborhood in neighborhoods_dict.values():
        if neighborhood.name in _NEIGHBORHOODS_TO_MERGE:
            combined_neighborhood = replace(neighborhood)
            new_key = neighborhood.name
            for neighbor_name in _NEIGHBORHOODS_TO_MERGE[neighborhood.name]:
                neighbor=neighborhoods_dict[neighbor_name]
                combined_neighborhood.polygons += neighbor.polygons
                combined_neighborhood.geometry.coordinates += neighbor.geometry.coordinates
                new_key += '-' + neighbor.name
                del return_dict[neighbor.name]
            return_dict[new_key] = combined_neighborhood
            return_dict[new_key].name = new_key
            del return_dict[neighborhood.name]
    return return_dict
            


def find_dict_entry(dict: dict, tuple: tuple, neighborhood: Neighborhood):
    for i in tuple:
        for k, v in dict.items():
            if i in k and neighborhood.boroname == v.boroname:
                return k
    return None


neighborhoods = [populate_polygons(neighborhood) for neighborhood in neighborhoods]

neighborhoods = project_polygons_to_screen(neighborhoods, 1920, 1080)

neighborhoods_dict = merge_like_neighborhoods(neighborhoods)

neighborhoods = manual_merge_neighborhoods(neighborhoods_dict).values()


with open("app/public/coords.json", "w") as file:
    out_neighborhoods = [asdict(neighborhood) for neighborhood in neighborhoods]
    json.dump(out_neighborhoods, file)
