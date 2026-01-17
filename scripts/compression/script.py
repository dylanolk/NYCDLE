import json
from scripts.get_neighborhood_data.domain import Neighborhood
from scripts.generate_node_graph.internal_schemas import NeighborhoodSchema
from dataclasses import asdict
import numpy as np 


data = {}
with open("app/public/coords.json", "r") as file:
    data = json.load(file)

neighborhoods: list[Neighborhood] = NeighborhoodSchema().load(data, many=True)

def bbox(coords):
    x_coords = coords[0:len(coords), 0]
    y_coords = coords[0:len(coords), 1]
    return[[max(x_coords), max(y_coords)], [min(x_coords), min(y_coords)]]

def compress_coords(coords, decimals=2):
    if not coords:
        return ""
    
    compressed = []
    prev_x, prev_y = coords[0]
    compressed.append(f"M{round(prev_x, decimals):g},{round(prev_y, decimals):g}")  # absolute start
    
    for x, y in coords[1:]:
        dx = round(x - prev_x, decimals)
        dy = round(y - prev_y, decimals)
        compressed.append(f"{dx:g},{dy:g}")  # relative
        prev_x, prev_y = x, y
    
    return "l".join(compressed)


print(bbox(np.array(neighborhoods[1].polygons[0])))

for neighborhood in neighborhoods: 
    flat_polygons = [coord for polygon in neighborhood.polygons for coord in polygon]
    coords = np.array(flat_polygons)
    neighborhood.bbox = bbox(coords)


print(neighborhoods[1].bbox)
for neighborhood in neighborhoods: 
    neighborhood.polygons = [compress_coords(polygon) for polygon in neighborhood.polygons]


with open("app/public/coords.json", "w") as file:
    excluded_fields = ["geometry"]
    out_neighborhoods = [
        {k: v for k, v in asdict(neighborhood).items() if k not in excluded_fields}
        for neighborhood in neighborhoods
    ]
    json.dump(out_neighborhoods, file)