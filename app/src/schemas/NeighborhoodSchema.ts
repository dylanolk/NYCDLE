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
    distances: z.array(z.number().nullable()),
    polygons: z.array(z.string()),
    enabled: z.boolean().default(false),
    bbox: z.array(z.array(z.number()))
});



export const NeighborhoodListSchema = z.array(NeighborhoodSchema)