from scripts.get_neighborhood_data.nyc_data_schemas import NeighborhoodSchema
from domain import Neighborhood
from requests import get
from math import tan, pi, log, radians
from dataclasses import asdict
import json

data = get("https://data.cityofnewyork.us/resource/9nt8-h7nd.json")

neighborhoods: list[Neighborhood] = NeighborhoodSchema().load(data.json(), many=True)


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


neighborhoods = [populate_polygons(neighborhood) for neighborhood in neighborhoods]

neighborhoods = project_polygons_to_screen(neighborhoods, 1920, 1080)


with open("app\coords.json", "w") as file:
    out_neighborhoods = [asdict(neighborhood) for neighborhood in neighborhoods]
    json.dump(out_neighborhoods, file)
