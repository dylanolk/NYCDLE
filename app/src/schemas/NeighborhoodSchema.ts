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
    id: z.number(),
    borders: z.array(z.number()),
    name: z.string(),
    boroname: z.string(),
    geometry: GeomSchema,
    polygons: z.array(z.array(z.array((z.number())))),
    enabled: z.boolean().default(true)
});



export const NeighborhoodListSchema = z.array(NeighborhoodSchema)