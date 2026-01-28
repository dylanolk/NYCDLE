import { useEffect, useRef, useState } from "react";
import { COLORS } from "../constants";

type ToolTipProps = {
    label: string;
    open: boolean;
    mousePos: {};
};

export function ToolTip({ label = "", open = false, mousePos }: ToolTipProps) {
    const [mousePosition, setMousePosition] = useState({ x: mousePos.x, y: mousePos.y });
    const tipRef = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState({ w: 0, h: 0 });
    const prevLabel = useRef("")

    // Track mouse
    useEffect(() => {
        const handleMove = (e: PointerEvent) => {
            if (e.pointerType != "touch") {
                setMousePosition({ x: e.clientX, y: e.clientY });
                prevLabel.current = label
            }
        };

        document.addEventListener("pointermove", handleMove);
        prevLabel.current = label;
        return () => {
            document.removeEventListener("pointermove", handleMove);
        };
    }, [label]);
    useEffect(() => {
        prevLabel.current = label;
    }, [label]);
    useEffect(() => {
        setMousePosition(mousePos);
    }, [mousePos]);

    // Measure tooltip size
    useEffect(() => {
        if (!tipRef.current) return;
        const rect = tipRef.current.getBoundingClientRect();
        setSize({ w: rect.width, h: rect.height });
    }, [label]);

    const margin = 12;
    let x = mousePosition.x;
    let y = mousePosition.y;

    // Default position is above cursor
    y -= size.h + 14;

    // Clamp horizontally
    if (x + size.w / 2 > window.innerWidth - margin) {
        x = window.innerWidth - size.w / 2 - margin;
    }
    if (x - size.w / 2 < margin) {
        x = size.w / 2 + margin;
    }

    // Clamp vertically (flip below cursor if needed)
    if (y < margin) {
        y = mousePosition.y + 20;
    }
    if (y + size.h > window.innerHeight - margin) {
        y = window.innerHeight - size.h - margin;
    }

    const style: React.CSSProperties = {
        position: "fixed",
        left: x,
        top: y,
        transform: open ? "translate(-50%, 0) scale(1)" : "translate(-50%, -6px) scale(0.96)",
        opacity: open ? 1 : 0,
        transition: "opacity 140ms ease, transform 140ms ease",
        pointerEvents: "none",
        zIndex: 9999,
        background: COLORS.lifted_background,
        border: `2px solid ${COLORS.dark_blue}`,
        borderRadius: "6px",
        padding: "4px 14px",
        whiteSpace: "nowrap",
        textWrap: "balance",
        boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        fontSize: "clamp(0.9rem, 2.5vw, 1.5rem)"

    };

    return (
        <div ref={tipRef} style={style}>
            {label}
        </div>
    );
}
