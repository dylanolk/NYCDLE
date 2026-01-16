import { useEffect, useRef, useState } from "react";
import { NeighborhoodListSchema } from '../schemas/NeighborhoodSchema'
import { Neighborhood } from "./Neighborhood";
import svgPanZoom from 'svg-pan-zoom';
import * as d3 from 'd3'

type NeighborhoodProps = {
    neighborhoods: [],
    enabled_neighborhoods_ids: number[]
};


export function MapDisplay({ neighborhoods, enabled_neighborhoods_ids }: NeighborhoodProps) {
    const svgRef = useRef(null);
    const gRef = useRef(null);

    const styles = {
        box: {
            border: '2px solid #333',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            height: '40vh',
            width: '100%'
        },
    };
    useEffect(() => {
        if (!enabled_neighborhoods_ids.length) return;
        if (!neighborhoods.length) return;
        const svgEl = svgRef.current;
        const gEl = gRef.current;
        if (!svgEl || !gEl) return;

        const enabled_neighborhoods = neighborhoods.filter((neighborhood) => enabled_neighborhoods_ids.includes(neighborhood.id))
        const svg = d3.select(svgRef.current)
        const g = d3.select(gRef.current)
        const all_points = enabled_neighborhoods.map((neighborhood) => neighborhood.polygons.flat()).flat()
        const x_coords = all_points.map((coord) => coord[0])
        const y_coords = all_points.map((coord) => coord[1])

        const max_y = Math.max(...y_coords)
        const min_y = Math.min(...y_coords)
        const max_x = Math.max(...x_coords)
        const min_x = Math.min(...x_coords)

        const bbox_height = max_y - min_y
        const bbox_width = max_x - min_x

        const svg_height = svg.node().clientHeight;
        const svg_width = svg.node().clientWidth;

        const scale = .9 * Math.min(svg_width / bbox_width, svg_height / bbox_height)
        const translateX = svg_width / 2 - (scale * (min_x + bbox_width / 2))
        const translateY = svg_height / 2 - (scale * (min_y + bbox_height / 2))

        const zoom_behavior = d3.zoom().on('zoom', (event) => {
            g.attr('transform', event.transform);
        });
        svg.call(zoom_behavior);
        const transform = d3.zoomIdentity
            .translate(translateX, translateY)
            .scale(scale);

        svg.transition().call(zoom_behavior.transform, transform);

    }, [neighborhoods, enabled_neighborhoods_ids]);

    if (!neighborhoods || neighborhoods.length === 0) {
        return <div>Loading...</div>;
    }
    return (
        <div style={styles.box}>
            <svg ref={svgRef} style={{ width: '100%', height: '100%' }} >
                <g ref={gRef}>
                    {
                        neighborhoods.map((neighborhood) => <Neighborhood key={neighborhood.id} neighborhood={neighborhood} />)
                    }
                </g>
            </svg>
        </div>

    )
}