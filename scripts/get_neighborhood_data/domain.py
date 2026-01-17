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
    polygons: list[list[float]]
    geometry: Geometry | None = None
    borders: list[str] | None = None
    id: int | None = None
    distances: list[int] | None = None
    bbox: dict[str, int] | None = None
