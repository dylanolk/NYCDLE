from dataclasses import dataclass

@dataclass
class Coordinate:
    lat: int
    lon: int

@dataclass
class Geometry: 
    type: str
    coordinates: list[Coordinate]

@dataclass
class Neighborhood:
    name: str 
    boroname: str
    geometry: Geometry
    polygons: list[str]