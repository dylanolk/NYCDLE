from marshmallow import Schema, fields, EXCLUDE, post_load
from scripts.get_neighborhood_data.domain import Coordinate, Geometry, Neighborhood


class BaseSchema(Schema):
    class Meta:
        unknown = EXCLUDE


class CoordinateSchema(BaseSchema):
    lat = fields.Float()
    lon = fields.Float()

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
    id = fields.Integer(allow_none=True)
    name = fields.String()
    boroname = fields.String()
    geometry = fields.Nested(GeometrySchema)
    polygons = fields.List(fields.List(fields.List(fields.Float())))
    borders = fields.List(fields.Integer(), allow_none=True)

    @post_load
    def make_neighborhood(self, data, **kwargs):
        return Neighborhood(**data)
