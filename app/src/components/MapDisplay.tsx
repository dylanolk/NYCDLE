import { useEffect, useState } from "react";
import { NeighborhoodListSchema } from '../schemas/NeighborhoodSchema'
import svgPanZoom from 'svg-pan-zoom';

type NeighborhoodProps = {
    neighborhoods: [];
};


export function MapDisplay({ neighborhoods }: NeighborhoodProps) {
    ;
    const styles = {
        box: {
            border: '2px solid #333',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            height: '80vh',
            width: '60vw'
        },
    };

    useEffect(() => {
        if (!neighborhoods || neighborhoods.length === 0) return;

        const panZoom = svgPanZoom('#my-svg', {
            fit: true,
            center: true,
            zoomScaleSensitivity: 1.5,
            minZoom: .9,
        });

        return () => panZoom.destroy(); // cleanup
    }, [neighborhoods]);

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

    if (!neighborhoods || neighborhoods.length === 0) {
        return <div>Loading...</div>;
    }
    return (
        <div style={styles.box}>
            <svg id="my-svg" viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }} >
                <polygon points="50,40 40,50" fill="lightblue" stroke="black" />
                {polygons}
            </svg>
        </div>

    )
}