import { useEffect, useRef } from "react";
import { Neighborhood } from "./Neighborhood";
import * as d3 from 'd3';
import { COLORS } from "../constants";

type NeighborhoodProps = {
    neighborhoods: any[],
    enabled_neighborhoods_ids: number[],
    onHover: (id: number[]) => void;
    offHover: (id: number[]) => void;
};

export function MapDisplay({
    neighborhoods,
    enabled_neighborhoods_ids,
    onHover = () => null,
    offHover = () => null,
}: NeighborhoodProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const gRef = useRef<SVGGElement | null>(null);

    // Tracks first render to avoid transition
    const firstRender = useRef(true);

    const styles = {
        box: {
            border: `2px solid ${COLORS.dark_blue}`,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.52)',
            aspectRatio: '4/3',
            boxSizing: 'border-box',
            width: '100%',
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
            });

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
                svg.call(zoom_behavior.transform, transform);
                firstRender.current = false;
            } else {
                svg.transition().duration(750).call(zoom_behavior.transform, transform);
            }
        }

    }, [neighborhoods, enabled_neighborhoods_ids]);

    if (!neighborhoods || neighborhoods.length === 0) {
        return <div style={styles.box}>Loading...</div>;
    }

    return (
        <div style={styles.box}>
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
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
}
