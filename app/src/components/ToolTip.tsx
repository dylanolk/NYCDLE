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

    // Track mouse
    useEffect(() => {
        const handleMove = (e: PointerEvent) => {
            if (e.pointerType != "touch") {
                setMousePosition({ x: e.clientX, y: e.clientY });
            }
        };
        document.addEventListener("pointermove", handleMove);
        return () => {
            document.removeEventListener("pointermove", handleMove);
        };
    }, []);

    useEffect(() => {
        setMousePosition(mousePos);
    }, [mousePos]);

    // Measure tooltip size
    useEffect(() => {
        if (!tipRef.current) return;

        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setSize({ w: width, h: height });
        });

        ro.observe(tipRef.current);
        return () => ro.disconnect();
    }, []);


    const margin = 12;

    // Treat x,y as the CENTER of tooltip because of translate(-50%, 0)
    let x = mousePosition.x;
    console.log("x1: ", x)
    console.log("size: ", size)
    let y = mousePosition.y - size.h - 14; // above cursor

    const halfW = size.w / 2;
    const tooltipTop = y;
    const tooltipBottom = y + size.h;

    // ---- HORIZONTAL CLAMP (center-based) ----
    const minCenterX = margin + halfW;
    const maxCenterX = window.innerWidth - margin - halfW;

    x = Math.min(Math.max(x, minCenterX), maxCenterX);
    console.log(x)

    // ---- VERTICAL CLAMP ----
    // If above cursor goes off top → flip below
    if (tooltipTop < margin) {
        y = mousePosition.y + 20;
    }

    // If still off bottom → clamp inside viewport
    if (y + size.h > window.innerHeight - margin) {
        y = window.innerHeight - margin - size.h;
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
        <div
            ref={tipRef}
            style={{
                position: "fixed",
                left: x,
                top: y,
                pointerEvents: "none",
                zIndex: 9999,
                transform: "translateX(-50%)", // ONLY centering, never scaled
            }}
        >
            <div
                style={{
                    opacity: open ? 1 : 0,
                    transform: open ? "translateY(0) scale(1)" : "translateY(-6px) scale(0.96)",
                    transition: "opacity 140ms ease, transform 140ms ease",
                    background: COLORS.lifted_background,
                    border: `2px solid ${COLORS.dark_blue}`,
                    borderRadius: "6px",
                    padding: "4px 14px",
                    whiteSpace: "nowrap",
                    textWrap: "balance",
                    boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
                    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                    fontSize: "clamp(0.9rem, 2.5vw, 1.5rem)"
                }}
            >
                {label}
            </div>
        </div>
    );

}
