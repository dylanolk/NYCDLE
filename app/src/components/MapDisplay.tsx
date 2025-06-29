import { useEffect, useState } from "react";
import { NeighborhoodListSchema } from '../schemas/NeighborhoodSchema'

export function MapDisplay() {
    const [neighborhoods, setNeighborhoods] = useState<any[]>([]);

    useEffect(() => {
        fetchData(setNeighborhoods);
    }, []);

    if (!neighborhoods || neighborhoods.length === 0) {
        return <div>Loading...</div>;
    }

    const polygons = neighborhoods.flatMap((n, i) =>
        n.polygons.map((polygon: any[], j: number) => {
            console.log(polygon)
            const polygon_points = polygon.map(
                (pair) => pair.join(',')
            ).join(" ")
           return (
            <polygon key={`${i}-${j}`} points={polygon_points} fill="lightblue" stroke="black">
                <title> {n.name}</title>
            </polygon>
           )
})
    );

    return (
        <svg width="4000" height= "4000">
            <polygon points = "50,40 40,50" fill="lightblue" stroke="black"/>
            {polygons}
        </svg>
    )
}

async function fetchData(setNeighborhoods: (neighborhoods: any) => void) {
    const response = await fetch('/coords.json');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    const result = NeighborhoodListSchema.safeParse(data);
    if (!result.success) {
        console.error("Schema validation failed", result.error);
        return;
    }

    setNeighborhoods(result.data);
}
