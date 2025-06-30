import json
from dataclasses import asdict
from scripts.generate_node_graph.internal_schemas import NeighborhoodSchema
from scripts.get_neighborhood_data.domain import Neighborhood

data = {}
with open("app/coords.json", "r") as file:
    data = json.load(file)

neighborhoods: list[Neighborhood] = NeighborhoodSchema().load(data, many=True)
for i, neighborhood in enumerate(neighborhoods):
    neighborhood.id = i

for neighborhood in neighborhoods:
    borders: list[int] = []
    all_coords_a = [
        (coord.lat, coord.lon)
        for group in neighborhood.geometry.coordinates
        for polygon in group
        for coord in polygon
    ]
    for neighborhood_b in neighborhoods:
        if neighborhood_b == neighborhood:
            continue
        all_coords_b = [
            (coord.lat, coord.lon)
            for group in neighborhood_b.geometry.coordinates
            for polygon in group
            for coord in polygon
        ]
        if not set(all_coords_a).isdisjoint(all_coords_b):
            borders.append(neighborhood_b.id)
    neighborhood.borders = borders


with open("app\coords.json", "w") as file:
    out_neighborhoods = [asdict(neighborhood) for neighborhood in neighborhoods]
    json.dump(out_neighborhoods, file)
