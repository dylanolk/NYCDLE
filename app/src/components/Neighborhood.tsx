import { NeighborhoodsContext } from "../contexts/NeighborhoodsContext";
import type { Neighborhood } from "../domains/Neighborhood";
import { useContext, useEffect, useState } from "react";

type NeighborhoodProps = {
    neighborhood: Neighborhood;
};

export function Neighborhood({ neighborhood }: NeighborhoodProps) {
    const context = useContext(NeighborhoodsContext);
    const [enabled, setEnabled] = useState(false);
    const [color, setColor] = useState("lightgray");

    const [hovered, setHovered] = useState(false);
    const [offset, setOffset] = useState(0);

    const [center, setCenter] = useState({ x: 0, y: 0 });

    useEffect(() => {
        context.current[neighborhood.id] = { setEnabled, setColor };
        return () => delete context.current[neighborhood.id];
    }, []);

    useEffect(() => {
        if (neighborhood.polygons.length === 0) return;

        let sumX = 0,
            sumY = 0,
            count = 0;
        neighborhood.polygons.forEach((poly) =>
            poly.forEach(([x, y]) => {
                sumX += x;
                sumY += y;
                count++;
            })
        );
        setCenter({ x: sumX / count, y: sumY / count });
    }, [neighborhood]);

    // single subtle bob on hover
    useEffect(() => {
        if (!enabled || !hovered) return;

        const duration = 400; // ms
        const amplitude = 2; // subtle bob
        let start: number | null = null;

        const animate = (timestamp: number) => {
            if (!start) start = timestamp;
            const t = Math.min((timestamp - start) / duration, 1);
            setOffset(Math.sin(t * Math.PI) * amplitude); // smooth bob
            if (t < 1) requestAnimationFrame(animate);
            else setOffset(0); // return to rest
        };

        requestAnimationFrame(animate);
    }, [hovered, enabled]);

    return (
        <g
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{ cursor: "pointer" }}
            transform={`translate(0, ${offset})`}
        >
            {neighborhood.polygons.map((polygon: any[], j: number) => (
                <polygon
                    key={`${neighborhood.id}-${j}-halo`}
                    points={join_polygon(polygon)}
                    fill={enabled ? "black" : "transparent"}
                    stroke={enabled ? "black" : "transparent"}
                    strokeWidth="3"
                />
            ))}

            {neighborhood.polygons.map((polygon: any[], j: number) => (
                <polygon
                    key={`${neighborhood.id}-${j}-fill`}
                    points={join_polygon(polygon)}
                    fill={enabled ? color : "transparent"}
                    stroke="transparent"
                />
            ))}

            {/* Hover name tag (modern, floating above all) */}
            {hovered && enabled && (
                <g transform={`translate(${center.x}, ${center.y - 14})`}>
                    <rect
                        x={-40}
                        y={-16}
                        width={80}
                        height={20}
                        rx={6}
                        ry={6}
                        fill="white"
                        stroke="#ccc"
                        strokeWidth={0.5}
                        opacity={0.95}
                        style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.2))" }}
                    />
                    <text
                        x={0}
                        y={-5}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        style={{
                            fontSize: "10px",
                            fontWeight: 500,
                            fill: "#333",
                            pointerEvents: "none",
                            fontFamily: "sans-serif",
                        }}
                    >
                        {neighborhood.name}
                    </text>
                </g>
            )}
        </g>
    );
}

function join_polygon(polygon: [number, number][]) {
    return polygon.map((pair) => pair.join(",")).join(" ");
}
