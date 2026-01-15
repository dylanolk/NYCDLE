import { NeighborhoodsContext } from "../contexts/NeighborhoodsContext";
import type { Neighborhood } from "../domains/Neighborhood";
import { useContext, useEffect, useRef, useState } from "react";

type NeighborhoodProps = {
    neighborhood: Neighborhood;
};

export function Neighborhood({ neighborhood }: NeighborhoodProps) {
    // 🔹 typed ref
    const gRef = useRef<SVGGElement | null>(null);

    const context = useContext(NeighborhoodsContext);
    const [enabled, setEnabled] = useState(false);
    const [color, setColor] = useState("lightgray");

    const [hovered, setHovered] = useState(false);
    const [offset, setOffset] = useState(0);

    const [center, setCenter] = useState({ x: 0, y: 0 });

    // 🔹 NEW: text ref + measured size
    const textRef = useRef<SVGTextElement | null>(null);
    const [labelSize, setLabelSize] = useState({ width: 0, height: 0 });

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

    // 🔹 measure label text when it appears
    useEffect(() => {
        if (!hovered || !enabled) return;
        if (!textRef.current) return;

        const box = textRef.current.getBBox();
        setLabelSize({
            width: box.width,
            height: box.height,
        });
    }, [hovered, enabled, neighborhood.name]);

    // single subtle bob on hover
    useEffect(() => {
        if (!enabled || !hovered) return;

        const duration = 400;
        const amplitude = 2;
        let start: number | null = null;

        const animate = (timestamp: number) => {
            if (!start) start = timestamp;
            const t = Math.min((timestamp - start) / duration, 1);
            setOffset(Math.sin(t * Math.PI) * amplitude);
            if (t < 1) requestAnimationFrame(animate);
            else setOffset(0);
        };

        requestAnimationFrame(animate);
    }, [hovered, enabled]);

    return (
        <g
            ref={gRef}
            onMouseEnter={() => {
                setHovered(true);
                const el = gRef.current;
                if (el && el.parentNode && el.parentNode.lastChild !== el) {
                    el.parentNode.appendChild(el); // bring to front
                }
            }}
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

            {/* 🔹 Auto-sized hover label */}
            {hovered && enabled && (
                <g transform={`translate(${center.x}, ${center.y - 14})`}>
                    <rect
                        x={-(labelSize.width / 2) - 8}
                        y={-(labelSize.height / 2) - 6}
                        width={labelSize.width + 16}
                        height={labelSize.height + 12}
                        rx={6}
                        ry={6}
                        fill="white"
                        stroke="#ccc"
                        strokeWidth={0.5}
                        opacity={0.95}
                        style={{
                            filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.2))",
                        }}
                    />
                    <text
                        ref={textRef}
                        x={0}
                        y={0}
                        textAnchor="middle"
                        dominantBaseline="middle"
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
