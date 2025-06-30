import json
from scripts.get_neighborhood_data.domain import Neighborhood
from scripts.generate_node_graph.internal_schemas import NeighborhoodSchema
from dataclasses import asdict

data = {}
with open("app/coords.json", "r") as file:
    data = json.load(file)

neighborhoods: list[Neighborhood] = NeighborhoodSchema().load(data, many=True)

graph: dict[int, list[int]] = {
    neighborhood.id: neighborhood.borders for neighborhood in neighborhoods
}


def bfs_shortest_path(neighborhood: Neighborhood, graph: dict[int, list[int]]):
    start = neighborhood.id

    distances = [None] * len(graph.keys())
    distances[start] = 0

    queue = [start]

    visited = set()
    visited.add(start)

    while queue:
        current = queue.pop(0)
        for neighbor in graph[current]:
            if neighbor not in visited:
                visited.add(neighbor)
                distances[neighbor] = distances[current] + 1
                queue.append(neighbor)
    return distances


for neighborhood in neighborhoods:
    neighborhood.distances = bfs_shortest_path(neighborhood, graph)

with open("app\coords.json", "w") as file:
    out_neighborhoods = [asdict(neighborhood) for neighborhood in neighborhoods]
    json.dump(out_neighborhoods, file)
