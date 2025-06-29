import { z } from 'zod';

const CoordinateSchema = z.object({
    lat: z.number(),
    lon: z.number()
})

const GeomSchema = z.object({
    type: z.string(),
    coordinates: z.array(z.array(z.array(CoordinateSchema)))
})

const NeighborhoodSchema = z.object({
    name: z.string(),
    boroname: z.string(),
    geometry: GeomSchema, 
    polygons: z.array(z.array(z.array((z.number()))))
});



export const NeighborhoodListSchema = z.array(NeighborhoodSchema)