## Schemas to read from nyc-data api (https://data.cityofnewyork.us/resource/9nt8-h7nd.json)

from marshmallow import Schema, fields, EXCLUDE, post_load
from domain import Coordinate, Geometry, Neighborhood


class BaseSchema(Schema):
    class Meta:
        unknown = EXCLUDE


class CoordinateSchema(BaseSchema):
    lat = fields.Float()
    lon = fields.Float()

    def load(self, data, **kwargs):
        formatted_data = {"lat": data[0], "lon": data[1]}
        return super().load(formatted_data)

    @post_load
    def make_coordinate(self, data, **kwargs):
        return Coordinate(**data)


class GeometrySchema(BaseSchema):
    type = fields.String()
    coordinates = fields.List(fields.List(fields.List(fields.Nested(CoordinateSchema))))

    @post_load
    def make_geometry(self, data, **kwargs):
        return Geometry(**data)


class NeighborhoodSchema(BaseSchema):
    ntaname = fields.String(attribute="name")
    boroname = fields.String()
    the_geom = fields.Nested(GeometrySchema, attribute="geometry")

    @post_load
    def make_neighborhood(self, data, **kwargs):
        return Neighborhood(**data, polygons=[])
