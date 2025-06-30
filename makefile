fetch-neighborhoods: 
	PYTHONPATH=. python ./scripts/get_neighborhood_data/script.py

generate-node-graph: 
	PYTHONPATH=. python ./scripts/generate_node_graph/script.py

find-shortest-paths: 
	PYTHONPATH=. python ./scripts/find_shortest_paths/script.py