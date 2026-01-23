import json
from dataclasses import asdict
from scripts.generate_node_graph.internal_schemas import NeighborhoodSchema
from scripts.get_neighborhood_data.domain import Neighborhood

data = {}
with open("app/public/coords.json", "r") as file:
    data = json.load(file)

_MANUAL_NEIGHBORHOOD_BORDERS: list[list[str]] = [
    ["Fort Wadsworth", "Fort Hamilton", "Bay Ridge"] # Verrazzano-Narrows Bridge
]



neighborhoods: list[Neighborhood] = NeighborhoodSchema().load(data, many=True)
neighborhood_name_dict: dict[str, Neighborhood] = {}

def get_manual_borders(neighborhood, borders) -> list[int]:
    for border in borders:
        if neighborhood.name in border:
            return [neighborhood_name_dict[name] for name in border if name != neighborhood.name]
    return []

for i, neighborhood in enumerate(neighborhoods):
    neighborhood.id = i
    neighborhood_name_dict[neighborhood.name] = neighborhood.id

for neighborhood in neighborhoods:
    borders: list[int] = get_manual_borders(neighborhood, _MANUAL_NEIGHBORHOOD_BORDERS)
    
    all_coords_a = [
        (round(coord.lat, 5), round(coord.lon, 5))
        for group in neighborhood.geometry.coordinates
        for polygon in group
        for coord in polygon
    ]
    for neighborhood_b in neighborhoods:
        if neighborhood_b == neighborhood:
            continue
        all_coords_b = [
            (round(coord.lat, 5), round(coord.lon, 5))
            for group in neighborhood_b.geometry.coordinates
            for polygon in group
            for coord in polygon
        ]
        if not set(all_coords_a).isdisjoint(all_coords_b):
            borders.append(neighborhood_b.id)
    neighborhood.borders = borders


with open("app/public/coords.json", "w") as file:
    out_neighborhoods = [asdict(neighborhood) for neighborhood in neighborhoods]
    json.dump(out_neighborhoods, file)
