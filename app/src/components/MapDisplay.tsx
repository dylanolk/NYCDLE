import { useEffect, useRef, useState } from "react";
import { Neighborhood } from "./Neighborhood";
import * as d3 from 'd3';
import { COLORS } from "../constants";
import { Settings, RotateCcw } from "lucide-react";
import { reset } from "svg-pan-zoom";

type NeighborhoodProps = {
    neighborhoods: any[],
    enabled_neighborhoods_ids: number[],
    onHover: (id: number[]) => void;
    offHover: (id: number[]) => void;
    showPracticeSettings: () => void;
    practice: boolean;
    onClick: (name: string) => void;
};

export function MapDisplay({
    neighborhoods,
    enabled_neighborhoods_ids,
    onHover = () => null,
    offHover = () => null,
    showPracticeSettings = () => null,
    practice = false,
    onClick = () => null,
}: NeighborhoodProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const gRef = useRef<SVGGElement | null>(null);
    const [resetCounter, setResetCounter] = useState(0)
    const [screenMoved, setScreenMoved] = useState(false)
    const firstRender = useRef(true);
    const programaticZoom = useRef(false);

    const styles = {
        box: {
            border: `2px solid ${COLORS.dark_blue}`,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.52)',
            aspectRatio: '4/3',
            boxSizing: 'border-box',
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
        },
    };

    useEffect(() => {
        if (!svgRef.current || !gRef.current) return;

        const svg = d3.select(svgRef.current);
        const g = d3.select(gRef.current);
        const zoom_behavior = d3.zoom<SVGSVGElement, unknown>()
            .filter((event) => {
                if (event.type === 'wheel' || event.type === 'mousedown') return true;
                if (event.type.startsWith('touch')) {
                    return event.touches && event.touches.length === 2;
                }
                return false;
            })
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
                if (!event.sourceEvent) return;
                setScreenMoved(true);
            })

        svg.call(zoom_behavior);
        if (enabled_neighborhoods_ids.length && neighborhoods.length) {
            const enabled_neighborhoods = neighborhoods.filter((n) =>
                enabled_neighborhoods_ids.includes(n.id)
            );

            const all_points = enabled_neighborhoods.map((n) => n.bbox).flat();
            const x_coords = all_points.map((coord) => coord[0]);
            const y_coords = all_points.map((coord) => coord[1]);

            const max_y = Math.max(...y_coords);
            const min_y = Math.min(...y_coords);
            const max_x = Math.max(...x_coords);
            const min_x = Math.min(...x_coords);

            const bbox_width = max_x - min_x;
            const bbox_height = max_y - min_y;

            const svg_width = svgRef.current.clientWidth;
            const svg_height = svgRef.current.clientHeight;

            const scale = 0.9 * Math.min(svg_width / bbox_width, svg_height / bbox_height);
            const translateX = svg_width / 2 - (scale * (min_x + bbox_width / 2));
            const translateY = svg_height / 2 - (scale * (min_y + bbox_height / 2));

            const transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);

            if (firstRender.current) {

                svg.call(zoom_behavior.transform, transform).on('end');
                firstRender.current = false;
                setScreenMoved(false);
            } else {

                svg.transition().duration(750).call(zoom_behavior.transform, transform).on('end');
                setScreenMoved(false);
            }
        }

    }, [neighborhoods, enabled_neighborhoods_ids, resetCounter]);

    if (!neighborhoods || neighborhoods.length === 0) {
        return <div style={styles.box}>Loading...</div>;
    }

    return (

        <div style={styles.box}>
            {practice && (
                <div
                    onClick={showPracticeSettings}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: 'rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(6px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: '18px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                    }}
                    title="Practice settings"
                >
                    <Settings size={18} strokeWidth={2} />

                </div>
            )}
            {screenMoved && <div
                onClick={() => {
                    setResetCounter(resetCounter + 1)
                    setScreenMoved(false);
                }}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff',
                    fontSize: '18px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                }}
                title="Practice settings"
            >

                <RotateCcw size={18} strokeWidth={2} />

            </div>}

            <svg
                ref={svgRef}
                style={{ width: '100%', height: '100%', background: COLORS.lifted_background }}
            >
                <g ref={gRef}>
                    {neighborhoods.map((neighborhood) => (
                        <Neighborhood
                            key={neighborhood.id}
                            neighborhood={neighborhood}
                            onHover={onHover}
                            offHover={offHover}
                            onClick={onClick}
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
}
