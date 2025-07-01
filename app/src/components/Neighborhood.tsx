import type { Neighborhood } from "../domains/Neighborhood";

type NeighborhoodProps = {
    neighborhood: Neighborhood;
};

export function Neighborhood({ neighborhood }: NeighborhoodProps) {

    return (
        neighborhood.polygons.map((polygon: any[], j: number) => (
            <polygon key={`${neighborhood.id}-${j}`} points={join_polygon(polygon)} fill={neighborhood.enabled ? "lightblue" : "red"} stroke="black">
                <title> {neighborhood.name}</title>
            </polygon>
        ))
    )
}

function join_polygon(polygon) {
    return polygon.map(
        (pair) => pair.join(',')
    ).join(" ")
}