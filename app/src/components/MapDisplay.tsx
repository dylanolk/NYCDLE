import { useEffect, useState } from "react";
import { NeighborhoodListSchema } from '../schemas/NeighborhoodSchema'

export function MapDisplay() {
    const [data, setData] = useState(null);

    useEffect(() => { fetchData(setData); }, []);

    const neighborhoods = NeighborhoodListSchema.safeParse(data).data

    console.log("dog")
    const scale = 5;
    const bbox = { minLat: 40, maxLat: 42, minLng: -75, maxLng: -73 };
    const svgSize = { width: 800, height: 600 };
    const offset = 1500;

    if (neighborhoods) {
        const neighborhood = neighborhoods[0]
        console.log(neighborhood)
        const ring = neighborhood.the_geom.coordinates[0][0];
        const maxY = Math.max(...ring.map((coord) => coord.long));
        console.log(maxY)
        return (
            <svg width={1920} height={1080}>
                {
                    neighborhoods.map((neighborhood, i) =>
                        <polygon key={i} points={neighborhood.the_geom.coordinates[0][0].map((coord) =>
                            `${latLngToSvgPixel(coord.lat, coord.long, bbox, svgSize).x * scale - offset}, ${latLngToSvgPixel(coord.lat, coord.long, bbox, svgSize).y * scale - offset}`
                        ).join(" ")} stroke="black" fill="lightblue" >
                            <title>{neighborhood.ntaname}</title>
                        </polygon>
                    )
                }

            </svg>
        );
    }
}

function latLngToSvgPixel(lat, lng, bbox, svgSize) {
    // bbox = { minLat, maxLat, minLng, maxLng }
    // svgSize = { width, height }

    const { minLat, maxLat, minLng, maxLng } = bbox;
    const { width, height } = svgSize;

    // Normalize longitude between 0 and 1
    const xNorm = (lng - minLng) / (maxLng - minLng);

    // Normalize latitude between 0 and 1 (invert Y axis for SVG)
    const yNorm = (maxLat - lat) / (maxLat - minLat);

    // Scale to SVG pixels
    const x = xNorm * width;
    const y = yNorm * height;

    return { x, y };
}

async function fetchData(setData: (data: any) => void) {
    const response = await fetch('https://data.cityofnewyork.us/resource/9nt8-h7nd.json');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    setData(data);
}