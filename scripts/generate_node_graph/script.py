import json
from scripts.generate_node_graph.internal_schemas import NeighborhoodSchema
from scripts.get_neighborhood_data.domain import Neighborhood

data = {}
with open("app\coords.json", "r") as file:
    data = json.load(file)

neighborhoods: list[Neighborhood] = NeighborhoodSchema().load(data, many=True)
