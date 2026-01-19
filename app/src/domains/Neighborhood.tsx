
export type Neighborhood = {
    id: number;
    borders: number[];
    name: string;
    boroname: string;
    geometry: number[][][];
    polygons: number[][][];
    enabled: boolean;
    bbox: number[][]
};
