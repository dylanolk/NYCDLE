import { z } from 'zod';

const CoordinateSchema = z.tuple([z.number(), z.number()]).transform(([x, y]) => ({ long: x, lat: y }))

const GeomSchema = z.object({
    type: z.string(),
    coordinates: z.array(z.array(z.array(CoordinateSchema)))
})

const NeighborhoodSchema = z.object({
    ntaname: z.string(),
    boroname: z.string(),
    the_geom: GeomSchema, 
    polygons: z.array(z.string())
});



export const NeighborhoodListSchema = z.array(NeighborhoodSchema)