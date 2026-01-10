import { NeighborhoodsContext } from "../contexts/NeighborhoodsContext";
import type { Neighborhood } from "../domains/Neighborhood";
import { useContext, useEffect, useState } from "react";

type NeighborhoodProps = {
    neighborhoodProp: Neighborhood;
};

export function Neighborhood({ neighborhood }: NeighborhoodProps) {
    const context = useContext(NeighborhoodsContext);
    const [enabled, setEnabled] = useState(false)
    const [color, setColor] = useState("lightgray")

    useEffect(() => {
        context.current[neighborhood.id] = { setEnabled, setColor };

        return () => {
            delete context.current[neighborhood.id];
        };
    }, []);

    return (
        <g>
            {
                neighborhood.polygons.map((polygon: any[], j: number) => (
                    <polygon key={`${neighborhood.id}-${j}-halo`} points={join_polygon(polygon)} fill={enabled ? "black" : 'transparent'} stroke={enabled ? "black" : "transparent"} strokeWidth="3">
                        {enabled ? <title> {neighborhood.name}</title> : null}
                    </polygon>
                ))
            }
            {
                neighborhood.polygons.map((polygon: any[], j: number) => (
                    <polygon key={`${neighborhood.id}-${j}-fill`} points={join_polygon(polygon)} fill={enabled ? color : "transparent"} stroke={"transparent"}>
                        {enabled ? <title> {neighborhood.name}</title> : null}
                    </polygon>
                ))
            }
        </g>
    )
}

function join_polygon(polygon) {
    return polygon.map(
        (pair) => pair.join(',')
    ).join(" ")
}