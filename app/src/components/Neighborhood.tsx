import { COLORS } from "../constants";
import { NeighborhoodsContext } from "../contexts/NeighborhoodsContext";
import type { Neighborhood } from "../domains/Neighborhood";
import { useContext, useEffect, useRef, useState } from "react";

type NeighborhoodProps = {
    neighborhood: Neighborhood;
    onHover: (id: number[]) => void;
    offHover: (id: number[]) => void;
    onClick: (name: string) => void;
    debug: boolean;
    toolTipLock: number;
};

export function Neighborhood({ neighborhood, onHover, offHover, onClick, debug = false, toolTipLock }: NeighborhoodProps) {
    // 🔹 typed ref
    const gRef = useRef<SVGGElement | null>(null);

    const { registry, reset_registry } = useContext(NeighborhoodsContext);
    const [enabled, setEnabled] = useState(false);
    const [color, setColor] = useState("lightgrey");
    const [showName, setShowName] = useState(false);
    const [greyedOut, setGreyedOut] = useState(false)
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


    // single subtle bob on hover
    useEffect(() => {
        if (!enabled || !hovered) return;
        wiggle();
    }, [hovered, enabled]);

    function wiggle() {
        const duration = 300;
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
            transform={`translate(0, ${-offset})`}
            style={{
                cursor: enabled ? "pointer" : "auto",
                opacity: greyedOut ? 0.4 : 1,
                transition: "opacity 150ms ease",
            }}
            onPointerEnter={(e) => {
                if (e.pointerType === "touch") return; // optional, see note below

                setHovered(true);

                const el = gRef.current;
                if (el && el.parentNode && el.parentNode.lastChild !== el) {
                    el.parentNode.appendChild(el);
                }

                if (debug) onHover(neighborhood.borders);
                else if (enabled) onHover(neighborhood.name, e.clientX, e.clientY);
            }}
            onPointerLeave={(e) => {
                if (e.pointerType === "touch") return;

                setHovered(false);

                if (debug) offHover(neighborhood.borders);
                else if (enabled) offHover();
            }}
            onPointerDown={(e) => {
                if (e.pointerType === "touch") {
                    if (enabled) {
                        setHovered(true);
                        toolTipLock.current += 1
                        const my_tool_tip_lock = toolTipLock.current
                        if (debug) onHover(neighborhood.borders);
                        else onHover(neighborhood.name, e.clientX, e.clientY);
                        setTimeout(() => {
                            if (my_tool_tip_lock == toolTipLock.current) {
                                if (debug) offHover(neighborhood.borders);
                                else {
                                    offHover();
                                }
                            }
                        }, 2000);
                        setHovered(false);
                    }
                }
            }}
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
        </g>
    );
}