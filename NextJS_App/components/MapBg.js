// Map background with dynamic theme on landing page!

/* eslint-disable */
"use client";
import React from "react";
import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";

export const MapBg = ({ ThemeColor, Markers = false }) => {
    const svgRef = useRef(null);
    const [geoData, setGeoData] = useState([]);
    const [fadingOut, setFadingOut] = useState(true);
    const [markerOpacity, setMarkerOpacity] = useState(1.0);
    const [maxWidth, setMaxWidth] = useState(0);
    const [pointvisible, setPointVisible] = useState(false);

    // Random location from world to show on map as reference
    const LOCATIONS = [
        // North America
        { name: "New York", coords: [-74.006, 40.7128] },
        { name: "Chicago", coords: [-87.6298, 41.8781] },
        { name: "Los Angeles", coords: [-118.2437, 34.0522] },
        { name: "Toronto", coords: [-79.3832, 43.6532] },
        { name: "Mexico City", coords: [-99.1332, 19.4326] },

        //  South America
        { name: "São Paulo", coords: [-46.6333, -23.5505] },
        { name: "Buenos Aires", coords: [-58.3816, -34.6037] },
        { name: "Lima", coords: [-77.0428, -12.0464] },
        { name: "Bogotá", coords: [-74.0721, 4.711] },

        //  Europe
        { name: "London", coords: [-0.1276, 51.5072] },
        { name: "Paris", coords: [2.3522, 48.8566] },
        { name: "Berlin", coords: [13.405, 52.52] },
        { name: "Rome", coords: [12.4964, 41.9028] },
        { name: "Madrid", coords: [-3.7038, 40.4168] },
        { name: "Moscow", coords: [37.6173, 55.7558] },

        //  Africa
        { name: "Cairo", coords: [31.2357, 30.0444] },
        { name: "Lagos", coords: [3.3792, 6.5244] },
        { name: "Nairobi", coords: [36.8219, -1.2921] },
        { name: "Cape Town", coords: [18.4241, -33.9249] },
        { name: "Accra", coords: [-0.186964, 5.614818] },

        //  Asia
        { name: "Delhi", coords: [77.1025, 28.7041] },
        { name: "Mumbai", coords: [72.8777, 19.076] },
        { name: "Beijing", coords: [116.4074, 39.9042] },
        { name: "Shanghai", coords: [121.4737, 31.2304] },
        { name: "Tokyo", coords: [139.6917, 35.6895] },
        { name: "Seoul", coords: [126.978, 37.5665] },
        { name: "Bangkok", coords: [100.5018, 13.7563] },
        { name: "Jakarta", coords: [106.8456, -6.2088] },
        { name: "Manila", coords: [120.9842, 14.5995] },

        //  Middle East
        { name: "Dubai", coords: [55.2708, 25.2048] },
        { name: "Riyadh", coords: [46.6753, 24.7136] },
        { name: "Istanbul", coords: [28.9784, 41.0082] },
        { name: "Tehran", coords: [51.389, 35.6892] },

        //  Central Asia
        { name: "Tashkent", coords: [69.2401, 41.2995] },
        { name: "Almaty", coords: [76.886, 43.2389] },

        //  Oceania
        { name: "Sydney", coords: [151.2093, -33.8688] },
        { name: "Melbourne", coords: [144.9631, -37.8136] },
        { name: "Auckland", coords: [174.7633, -36.8485] },
        { name: "Port Moresby", coords: [147.1803, -9.4438] },
    ];

    // url to render map bg src
    const geoUrl =
        "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

    // Automatically fetch max Screen width on load
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setMaxWidth(window.innerWidth);
        }
    }, []);

    // set point/marker visible animation true when dark theme arrived
    useEffect(() => {
        if (ThemeColor == "rgb(0,0,0)") setPointVisible(true);
    }, [ThemeColor]);

    //marker animation
    useEffect(() => {
        if (!pointvisible && !Markers) return;
        const interval = setInterval(() => {
            setMarkerOpacity((prev) => {
                const rounded = Math.round(prev * 10) / 10;

                if (fadingOut) {
                    if (rounded <= 0.2) {
                        setFadingOut(false);
                        return 0.2;
                    }
                    return Math.max(0.2, Math.round((prev - 0.1) * 10) / 10);
                } else {
                    if (rounded >= 1) {
                        setFadingOut(true);
                        return 1;
                    }
                    return Math.min(1, Math.round((prev + 0.1) * 10) / 10);
                }
            });
        }, 100);
        return () => clearInterval(interval);
    }, [pointvisible, Markers, fadingOut]);

    // fetch map from url to render through d3
    useEffect(() => {
        const fetchMap = async () => {
            const res = await d3.json(geoUrl);
            const countries = feature(res, res.objects.countries).features;
            const filtered = countries.filter((d) => {
                const excludedISO = ["Antarctica"]; // Antarctica
                return !excludedISO.includes(d.properties.name);
            });
            setGeoData(filtered);
        };
        fetchMap();
    }, []);

    // update rendered map properties accoding to theme animation
    useEffect(() => {
        if (!geoData.length) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // clear previous map

        const width = 1200;
        const height = 600;

        const projection = d3
            .geoNaturalEarth1()
            .scale(maxWidth > 768 ? 200 : 250)
            .translate(
                maxWidth > 768
                    ? [width / 2, height / 2]
                    : [width / 4, height / 2]
            );
        const path = d3.geoPath().projection(projection);

        // Map
        svg.attr("width", width)
            .attr("height", height)
            .selectAll("path")
            .data(geoData)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", ThemeColor)
            .attr("stroke", "#2F3E46");

        // Markers
        svg.selectAll("circle")
            .data(LOCATIONS)
            .enter()
            .append("circle")
            .attr("cx", (d) => projection(d.coords)[0])
            .attr("cy", (d) => projection(d.coords)[1])
            .attr("r", 3)
            .attr("fill", pointvisible || Markers ? "orange" : "transparent")
            .attr("stroke-width", 0.5)
            .attr("opacity", markerOpacity)
    }, [geoData, ThemeColor, pointvisible, Markers, markerOpacity]);
    return (
        // actual map jsx
        <div className="h-full w-full relative -z-50">
            <div className="flex items-center justify-center blur-[1px]">
                <svg ref={svgRef} />
            </div>
        </div>
    );
};
