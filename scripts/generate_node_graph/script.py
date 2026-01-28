import json
from dataclasses import asdict
from scripts.generate_node_graph.internal_schemas import NeighborhoodSchema
from scripts.get_neighborhood_data.domain import Neighborhood

data = {}
with open("app/public/coords.json", "r") as file:
    data = json.load(file)

_MANUAL_NEIGHBORHOOD_BORDERS_TO_ADD: list[list[str]] = [
    # Staten Island
    ["Fort Wadsworth", "Fort Hamilton", "Bay Ridge"], # Verrazzano-Narrows Bridge

    # Manhattan
    ['Financial District-Battery Park City', 'Carroll Gardens-Cobble Hill-Gowanus-Red Hook'], # The Battery Tunnel (technically goes thruogh the battery but ehhh)
    ["Chinatown-Two Bridges", "Downtown Brooklyn-DUMBO-Boerum Hill", "Brooklyn Heights"], # Brooklyn + Manhattan Bridges
    ["Lower East Side", "Williamsburg"], # Williamsburg bridge
    ['East Midtown-Turtle Bay', 'Long Island City-Hunters Point', 'Queensbridge-Ravenswood-Dutch Kills'], # Queensboro bridge
    ['Upper East Side-Lenox Hill-Roosevelt Island-Carnegie Hill-Yorkville', 'Queensbridge-Ravenswood-Dutch Kills'], # Queensboro Bridge + Roosevelt Island Bridge
    ['East Harlem', 'Mott Haven-Port Morris'], # Willis Avenue Swing Bridge + Third Avenue Bridge
    ['Concourse-Concourse Village', 'East Harlem'], # Madison Avenue Bridge
    ['Concourse-Concourse Village', 'Harlem'],# 145th Street Bridge
    ['Yankee Stadium-Macombs Dam Park', 'Harlem', 'Concourse-Concourse Village', "Highbridge"], # Macombs Dam Bridge
    ['Washington Heights-Highbridge Park', 'University Heights-Morris Heights-Fordham'],# Washington Bridge + Alexander Hamilton Bridge
    ['Washington Heights-Highbridge Park', 'Highbridge'],# The High Bridge
    ['Inwood', 'University Heights-Morris Heights-Fordham'],# University Heights Bridge
    ['Inwood', 'Inwood Hill Park', 'Kingsbridge-Marble Hill'],# Historic Broadway Lift Bridge
    
    # The Bronx
    ["Randall's Island", "Astoria-Ditmars-Steinway-Woodside-Old Astoria-Hallets Point"],# Robert  F. Kennedy Bridge
    ["Randall's Island", "Mott Haven-Port Morris"],# RFK Bridge Bronx Crossing
    ['Ferry Point Park-St. Raymond Cemetery', 'College Point', 'Whitestone-Beechhurst'],# Whitestone Bridge
    ['Throgs Neck-Schuylerville', 'Bay Terrace-Clearview', 'Fort Totten'],# Throgs Neck Bridge
    ['Longwood', 'Soundview-Bruckner-Bronx River-Clason Point'],# Westchester Ave / Buckner Expy
    ['Bedford Park', 'Bronx Park'],# Just so close
    ['Co-op City', 'Hutchinson Metro Center'],# So close
    ['Tremont', 'Fordham Heights'],# Close

    # Queens/ Brooklyn
    ['Jamaica Bay', 'Spring Creek Park', 'Howard Beach-Lindenwood'], # Cross Bay Veterans Memorial Bridge
    ['Jacob Riis Park-Fort Tilden-Breezy Point Tip', 'Barren Island-Floyd Bennett Field', 'Marine Park-Mill Basin-Bergen Beach-Plumb Island'], # Marine Parkway Bridge
    ['Baisley Park', 'John F. Kennedy International Airport'], # Baisley Pond Park touches the belt where it meets JFK 🤷‍♀️ not loving this one but
    ['Woodhaven', 'Highland Park-Cypress Hills Cemeteries'], # Just very close. 
    ['The Evergreens Cemetery', 'Ridgewood'], # Very Close
    ['Sunnyside', 'Greenpoint', 'Long Island City-Hunters Point'], # Greenpoint Ave, Pulaski Bridge
    ['East Williamsburg', 'Sunnyside'], # Kosciuszko Bridge
    ['Sunset Park-Borough Park', 'Park Slope'], # These border, very close on the map
    ['McGuire Fields', 'Canarsie Park & Pier'], # Paerdegat Basin Bridge
    ['Shirley Chisholm State Park', 'Canarsie Park & Pier'], # Fresh Creek Basin Bridge
    ['Middle Village', 'Ridgewood'], # Very Close
    ['Bushwick', 'Glendale', 'The Evergreens Cemetery'], # All very close, practically border
    ['Bensonhurst', 'Dyker Beach Park'], # Close
    ['Oakland Gardens-Hollis Hills', 'Jamaica Estates-Holliswood'], # Close

]

_MANUAL_NEIGHBORHOOD_BORDERS_TO_REMOVE: list[list[int]] = [
    ['College Point', 'LaGuardia Airport']
]



neighborhoods: list[Neighborhood] = NeighborhoodSchema().load(data, many=True)
neighborhood_name_dict: dict[str, Neighborhood] = {}

def get_manual_borders(neighborhood, borders) -> list[int]:
    return_list = []
    for border in borders:
        if neighborhood.name in border:
            return_list+= [neighborhood_name_dict[name] for name in border if name != neighborhood.name]
    return return_list

for i, neighborhood in enumerate(neighborhoods):
    neighborhood.id = i
    neighborhood_name_dict[neighborhood.name] = neighborhood.id

for neighborhood in neighborhoods:
    borders: list[int] = get_manual_borders(neighborhood, _MANUAL_NEIGHBORHOOD_BORDERS_TO_ADD)
    
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
    ## remove borders 
    borders_to_remove = get_manual_borders(neighborhood, _MANUAL_NEIGHBORHOOD_BORDERS_TO_REMOVE)
    borders = [border for border in borders if border not in borders_to_remove]
    neighborhood.borders = borders




with open("app/public/coords.json", "w") as file:
    out_neighborhoods = [asdict(neighborhood) for neighborhood in neighborhoods]
    json.dump(out_neighborhoods, file)
