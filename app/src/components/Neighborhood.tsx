import { NeighborhoodsContext } from "../contexts/NeighborhoodsContext";
import type { Neighborhood } from "../domains/Neighborhood";
import { useContext, useEffect, useState } from "react";

type NeighborhoodProps = {
    neighborhoodProp: Neighborhood;
};

export function Neighborhood({ neighborhood }: NeighborhoodProps) {
    const context = useContext(NeighborhoodsContext);
    const [enabled, setEnabled] = useState(false)

    useEffect(() => {
        context.current[neighborhood.id] = { setEnabled };

        return () => {
            delete context.current[neighborhood.id];
        };
    }, []);

    return (

        neighborhood.polygons.map((polygon: any[], j: number) => (
            <polygon key={`${neighborhood.id}-${j}`} points={join_polygon(polygon)} fill={enabled ? "lightblue" : "transparent"} stroke={enabled ? "black" : "transparent"}>
                {enabled ? <title> {neighborhood.name}</title> : null}
            </polygon>
        ))
    )
}

function join_polygon(polygon) {
    return polygon.map(
        (pair) => pair.join(',')
    ).join(" ")
}