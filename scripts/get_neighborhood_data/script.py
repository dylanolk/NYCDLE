from schemas import NeighborhoodSchema
from domain import Neighborhood
from requests import get
from math import tan, pi, log
import json

data = get('https://data.cityofnewyork.us/resource/9nt8-h7nd.json')

neighborhoods:list[Neighborhood]=NeighborhoodSchema().load(data.json(), many=True)

def mercator(lat, lon, height=600, width=600):
    x = (lon+180)*(width/360)
    lat_radians = (lat*pi)/180
    mercN = log(tan((pi/4)+(lat_radians/2)))
    y = (height/2) - (width*mercN/(2*pi))

    return x,y

def polygon_mercator(polygon):
    return [mercator(coordinate.lat, coordinate.lon) for coordinate in polygon]

def polygons_mercator(polygons):
    return [polygon_mercator(polygon) for polygon in polygons]

def coords_mercator(coords):
    return [polygons_mercator(polygons) for polygons in coords]




with open('coords.json', 'w') as file: 
    json.dump(coords_mercator(coords), file )