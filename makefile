fetch-neighborhoods: 
	PYTHONPATH=. python ./scripts/get_neighborhood_data/script.py

generate-node-graph: 
	PYTHONPATH=. python ./scripts/generate_node_graph/script.py

find-shortest-paths: 
	PYTHONPATH=. python ./scripts/find_shortest_paths/script.py

compression: 
	PYTHONPATH=. python ./scripts/compression/script.py

run-all-scripts: 
	PYTHONPATH=. python ./scripts/get_neighborhood_data/script.py
	PYTHONPATH=. python ./scripts/generate_node_graph/script.py
	PYTHONPATH=. python ./scripts/find_shortest_paths/script.py
	PYTHONPATH=. python ./scripts/compression/script.py