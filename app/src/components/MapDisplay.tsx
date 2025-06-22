import { useEffect, useState } from "react";
import { NeighborhoodListSchema } from '../schemas/NeighborhoodSchema'
import { SphericalMercator } from '@mapbox/sphericalmercator';

export function MapDisplay() {
    const [neighborhoods, setNeighborhoods] = useState<any[]>([]);

    useEffect(() => { fetchData(setNeighborhoods); }, []);
 
    let polygons = []

    if(neighborhoods === null) return;

    for (let i = 0; i < neighborhoods.length; i++){
        polygons= polygons.concat(
            neighborhoods[i].polygons.map(
                (polygon_points, j) => {
                    (<polygon key={`${i}-${j}`} points={polygon_points}/>)
                }
            )
        )
    }

    console.log(polygons)

    return (
       <svg>
        {polygons}
       </svg>
    );
}




async function fetchData(setNeighborhoods: (neighborhoods: any) => void) {
    const response = await fetch('/coords.json')
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json()

    const neighborhoods = NeighborhoodListSchema.safeParse(data).data
    setNeighborhoods(neighborhoods)
}