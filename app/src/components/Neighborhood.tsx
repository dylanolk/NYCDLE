import { COLORS } from "../constants";
import { NeighborhoodsContext } from "../contexts/NeighborhoodsContext";
import type { Neighborhood } from "../domains/Neighborhood";
import { useContext, useEffect, useRef, useState } from "react";

type NeighborhoodProps = {
    neighborhood: Neighborhood;
    onHover: (id: number[]) => void;
    offHover: (id: number[]) => void;
};

export function Neighborhood({ neighborhood, onHover, offHover }: NeighborhoodProps) {
    // 🔹 typed ref
    const gRef = useRef<SVGGElement | null>(null);

    const {registry, reset_registry} = useContext(NeighborhoodsContext);
    const [enabled, setEnabled] = useState(false);
    const [color, setColor] = useState("lightgrey");
    const [showName, setShowName] = useState(false);
    const [greyedOut, setGreyedOut] =useState(false)
    const [hovered, setHovered] = useState(false);
    const [offset, setOffset] = useState(0);

    const center_x = (neighborhood.bbox[0][0] + neighborhood.bbox[1][0]) / 2
    const top_y = neighborhood.bbox[1][1]
    const [center, setCenter] = useState({ x: center_x, y: top_y });

    // 🔹 NEW: text ref + measured size
    const textRef = useRef<SVGTextElement | null>(null);
    const [labelSize, setLabelSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        registry[neighborhood.id] = {
            setEnabled,
            setColor,
            setShowName,
            setGreyedOut,  
            wiggle, 
        };
        return () => delete registry[neighborhood.id];
    }, []);
    

    useEffect(() => {
        if (neighborhood.polygons.length === 0) return;

        const x_center = (neighborhood.bbox[0][0] + neighborhood.bbox[1][0]) / 2
        const y_top = neighborhood.bbox[1][1]
        setCenter({ x: x_center, y: y_top });
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
    function wiggle(){
        
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
    }
    return (
        <g
            ref={gRef}
            onMouseEnter={() => {
                setHovered(true);
                const el = gRef.current;
                if (el && el.parentNode && el.parentNode.lastChild !== el) {
                    el.parentNode.appendChild(el);
                }
                onHover(neighborhood.borders);
            }}
            onMouseLeave={() => {
                setHovered(false);
                offHover(neighborhood.borders);
            }}
            style={{
                cursor: enabled ? "pointer" : "auto",
                opacity: greyedOut ? 0.4 : 1, 
                transition: "opacity 150ms ease",
            }}
            transform={`translate(0, ${offset})`}
        >
            {neighborhood.polygons.map((polygon: any[], j: number) => (
                <path
                    key={`${neighborhood.id}-${j}-halo`}
                    d={polygon}
                    fill={enabled ? "black" : "transparent"}
                    stroke={enabled ? "black" : "transparent"}
                    strokeWidth="3"
                />
            ))}

            {neighborhood.polygons.map((polygon: any[], j: number) => (
                <path
                    key={`${neighborhood.id}-${j}-fill`}
                    d={polygon}
                    fill={enabled ? color : "transparent"}
                    stroke="transparent"
                />
            ))}

            {/* 🔹 Auto-sized hover label */}
            {hovered && enabled && showName && (
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