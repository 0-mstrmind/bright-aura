// Actual map component
/* eslint-disable */
"use client";
import React, { useEffect, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import useSWR from "swr";
import Link from "next/link";
import { CircleChevronDown, SearchIcon, Locate, Edit, BellRingIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert } from "@/utils/AlertProvider";

export default function Map() {
    const [map, setMap] = useState(0);
    const [LocationVal, setLocationIn] = useState("");
    const [locationData, setLocationData] = useState({});
    const [slowMode, setSlowMode] = useState(false);
    const [res, setResponse] = useState(null);
    const [awaitPulse, setAwaitPulse] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [selectedCoordinates, setSelectedCoordinates] = useState("");
    const [isAutoMarkhhoverd, setAutoMarkHoverState] = useState(false);
    const [isEditMarkhhoverd, setEditMarkHoverState] = useState(false);
    const [ComplaintData, setComplaintData] = useState([]);
    const [complaintDataVisible, setComplaintDataVisible] = useState(false);
    const [complantNotifyBtnHovered, setNotifyBtnHovered] = useState(false);
    const { showAlert } = useAlert();
    const TilerKey = process.env.NEXT_PUBLIC_MAP_TILER_API_Key;

    const ZoomValue = 18; // Zoom level on Streetlights in map!

    //fetcher function called by useSWR on specific interval
    const fetcher = async (url) => {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                data: JSON.stringify({ Country: locationData.country, State: locationData.state, Place: locationData.place }),
                key: "0986",
            },
        });
        const res = response.status !== 204 ? await response.json() : response
        if (!response.ok) {
            const error = new Error(res.message || "Unknown error occured!");
            error.status = response.status;
            throw error;
        }

        sessionStorage.setItem("cached_data", JSON.stringify({ "searched_location": locationData })); // save location meta-data in cache
        return { data: res?.data ?? null, status: response?.status };
    }

    const { data, error, isLoading, mutate } = useSWR((locationData?.country && locationData?.state && locationData?.place) ? "/api/data" : null, fetcher,
        {
            refreshInterval: slowMode ? 600000 : 60000, // Auto refresh interval 60s (default) if notification- no streetlights currently installed then 10mins for rate limit
            revalidateOnFocus: false,
        }
    );

    //Function to Fetch Location via browser
    const fetchLocation = () => {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => resolve(position.coords),
                    () => reject("Location permission denied or unavailable")
                );
            } else {
                reject("Geolocation is not supported by this browser");
            }
        });
    };

    // UseEffect hook for init map on startup
    useEffect(() => {
        if (map) return;
        // Fetch current location and open map else on default global coordinates (0,0) on first instance of map!
        const initFetch = async (retry = 0) => {
            const cachedLocation = JSON.parse(sessionStorage.getItem("cached_data"))?.searched_location;
            let location = null;
            if (!cachedLocation || retry > 0) {
                try {
                    location = JSON.parse(sessionStorage.getItem("cached_data"))?.searched_location;
                    if (!location) {
                        location = await fetchLocation();
                        sessionStorage.setItem("cached_data", JSON.stringify({ "searched_location": location }));
                    }
                } catch (e) {
                    location = null;
                    showAlert("Error Fetching Cached Location! Please Reload the webpage...", "error");
                }
            }
            else {
                location = cachedLocation?.coordinates;
            }
            if (location) {
                setLocationData({ country: cachedLocation?.country, state: cachedLocation?.state, place: cachedLocation?.place, coordinates: [location?.longitude ?? location[0], location?.latitude ?? location[1]] });

                const mapInstance = new maplibregl.Map({
                    container: "map",
                    style: `https://api.maptiler.com/maps/openstreetmap/style.json?key=${TilerKey}`,
                    center: [
                        location?.longitude ?? location[0],
                        location?.latitude ?? location[1]
                    ],
                    zoom: location ? locationData?.country ? ZoomValue : 3 : 1,
                    attributionControl: false,
                    renderWorldCopies: false,
                });

                const fullscreenControl = new maplibregl.FullscreenControl();
                mapInstance.addControl(fullscreenControl);
                setMap(mapInstance);
                return () => {
                    if (mapInstance) mapInstance.remove(); // clean up
                }
            } else {
                initFetch(1); //retry once
            }
        };
        initFetch();
    }, []);

    // UseEffect hook for Refetch data on valid input change
    useEffect(() => {
        if (!locationData) return;
        mutate();
    }, [locationData])

    // UseEffect hook for auto Info-alert on no streetlight found on searched location.
    useEffect(() => {
        if (data?.status == 200) {
            setResponse(data?.data);
            setSlowMode(false);
        } else if (data?.status == 204) {
            setSlowMode(true);
            if (map) {
                map.flyTo({ center: locationData.coordinates, zoom: 12, essential: true });
            }
        }
    }, [data, map])
    useEffect(() => { if (slowMode) showAlert("No street lights are currently installed in this area, Slow-mode activated!", "info") }, [slowMode, locationData]);

    // UseEffect hook for Toggle popup switch
    useEffect(() => {
        if (selectedPoint) {
            setComplaintDataVisible(false);
        }
    }, [selectedPoint]);

    // UseEffect hook for auto show comaplaint received flag
    useEffect(() => {
        if (complaintDataVisible && ComplaintData.length > 0) {
            setSelectedPoint(null);
        }
    }, [complaintDataVisible, ComplaintData]);

    //UseEffect hook for showing error log from endpoint and auto rollback! 
    useEffect(() => {
        if (error) {
            showAlert("Error: " + error?.message ?? error ?? "Something went wrong!", "error");
            setLocationData((prev) => prev);
        }
    }, [error]);

    // UseEffect hook for auto-update layers in map on search
    useEffect(() => {
        if (!map || !res) return;

        setComplaintData([]);
        const mark = () => {
            try {
                if (!Array.isArray(res?.features)) {
                    throw new Error("Data is not in the expected array format");
                }
                const geojson = {
                    type: "FeatureCollection",
                    features: res.features.map((item) => {
                        const properties = item.properties ?? {};
                        return {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: [
                                    item.geometry.coordinates[1],
                                    item.geometry.coordinates[0],
                                ],
                            },
                            properties: {
                                id: properties.id ?? "Unknown",
                                statusPriority: properties.statusPriority ?? "0",
                                status: properties.status ?? "unknown",
                                location: properties.location ?? "Unknown Location",
                                coordinates: [
                                    item.geometry.coordinates[0],
                                    item.geometry.coordinates[1],
                                ],
                            },
                        };
                    }),
                };

                const filtered = geojson.features.filter((f) => f.properties.status === "0" && f.properties.statusPriority === "1");

                setComplaintData(filtered);
                setComplaintDataVisible(true);

                if (!map.getSource("street-light-src")) {
                    // Add the new source
                    map.addSource("street-light-src", {
                        type: "geojson",
                        data: geojson,
                    });

                    map.addLayer({
                        id: "street-lights",
                        type: "circle",
                        source: "street-light-src",
                        paint: {
                            "circle-radius": [
                                "case",
                                ["all", ["==", ["get", "status"], "0"], ["==", ["get", "statusPriority"], "1"]],
                                6, // high-priority faulty
                                4,
                            ],
                            "circle-color": [
                                "case",
                                ["all", ["==", ["get", "status"], "0"], ["==", ["get", "statusPriority"], "1"]],
                                "red", // high-priority fault
                                ["all", ["==", ["get", "status"], "0"], ["==", ["get", "statusPriority"], "0"]],
                                "red", // normal fault
                                ["==", ["get", "status"], "1"], "green", // working
                                ["==", ["get", "status"], "2"], "#F09643", // day
                                "gray" // default
                            ],
                            "circle-stroke-width": [
                                "case",
                                ["all", ["==", ["get", "status"], "0"], ["==", ["get", "statusPriority"], "1"]],
                                3, // high-priority fault
                                2,
                            ],
                            "circle-stroke-color": [
                                "case",
                                ["all", ["==", ["get", "status"], "0"], ["==", ["get", "statusPriority"], "1"]],
                                "blue", // high-priority fault
                                "#000",
                            ],
                        }
                    });

                    map.on("click", "street-lights", (e) => {
                        const features = map.queryRenderedFeatures(e.point, {
                            layers: ["street-lights"],
                        });

                        if (features.length > 0) {
                            const feature = features[0];
                            setSelectedPoint(feature.properties);
                            setSelectedCoordinates(feature.geometry.coordinates);
                        }
                    });

                    map.on("mouseenter", "street-lights", () => {
                        map.getCanvas().style.cursor = "pointer";
                    });
                    map.on("mouseleave", "street-lights", () => {
                        map.getCanvas().style.cursor = "";
                    });

                    // optional layer-cleanup
                    map.getStyle().layers
                        .filter(l => l.type === "symbol")
                        .forEach(l => map.removeLayer(l.id));

                } else {
                    map.getSource("street-light-src")?.setData(geojson);
                }

                const mid = Math.floor(geojson.features.length - 1 / 2);
                const centerCoordinates = geojson.features[mid]?.geometry?.coordinates;

                if (res && centerCoordinates && !error) {
                    map.flyTo({ center: centerCoordinates, zoom: ZoomValue, essential: true });
                }
            } catch (err) {
                showAlert(err?.message ?? err, "error");
            }
        }
        const handleMark = () => {
            if (!map.isStyleLoaded()) {
                return;
            }
            mark();
        };

        if (map.isStyleLoaded()) {
            handleMark();
        } else {
            map.once("load", handleMark);
        }
        return () => {
            map.off("load", handleMark);
        };
    }, [map, res, error, isLoading]);

    // function to find location based on input via geoapfy API
    const FetchCoordinates = async (location) => {
        const API_KEY = process.env.NEXT_PUBLIC_Geoapify_Key;
        const url = `https://api.geoapify.com/v1/geocode/search?text=${location}&apiKey=${API_KEY}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.features.length > 0) {
                const locationData = data.features[0];
                const properties = locationData.properties;
                setLocationData({
                    country: properties?.country,
                    state: properties?.state,
                    place: isNaN(location) ? String(location).trim() : properties.city ?? properties.county,
                    coordinates: locationData.geometry.coordinates
                })
                setSlowMode(false);
            } else {
                setLocationIn("");
                throw new Error("Invalid Input Or Failed Fetching Location!");
            }
        } catch (err) {
            setLocationData((prev) => prev);
            showAlert(err?.message ?? err, "error");
        }
    };

    // Auto Location Function
    const AutoLocate = async (event) => {
        event.preventDefault();
        try {
            setAwaitPulse(true);
            const location = await fetchLocation();
            if (location) {
                const API_KEY = process.env.NEXT_PUBLIC_Geoapify_Key;
                const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${location.latitude}&lon=${location.longitude}&apiKey=${API_KEY}`;
                const resposne = await fetch(url);
                const res = await resposne.json();
                if (res.features.length > 0) {
                    const Data = res?.features[0]?.properties?.city;
                    await FetchCoordinates(Data);
                }
            } else {
                throw new Error(
                    "Can't Fetch The Location Please Check The Permission!!"
                );
            }
        } catch (error) {
            showAlert(error?.message ?? error, "error");
        } finally {
            setAwaitPulse(false);
        }
    };

    //Hnadle entered location query
    const handleInput = async (event) => {
        event.preventDefault();
        setSlowMode(false);
        await FetchCoordinates(LocationVal);
    };

    return (
        <>
            <div className="relative bg-gray-50 h-full w-full">
                <main className="h-full w-full min-h-1/2">
                    <div className="bg-black relative min-h-1/2 h-full w-full">
                        <div className="overflow-hidden bg-black min-h-1/2 h-full w-full">
                            <div
                                id="map"
                                className="relative min-h-1/2 h-full w-full"
                            >
                                {/* Search Bar*/}
                                <div className="absolute z-20 top-auto ml-2 md:ml-2.5 md:pt-2 pt-1">
                                    <form
                                        onSubmit={handleInput}
                                        className="md:w-sm w-full"
                                    >
                                        <div className="rounded-full shadow-sm shadow-black/60 bg-white text-gray-600">
                                            <div className="h-fit w-full p-1 flex justify-between items-center relative">
                                                <input
                                                    type="text"
                                                    id="locationIn"
                                                    name="input_box"
                                                    className="md:text-xl text-sm w-full focus:outline-none placeholder-gray-400 px-1 rounded-full"
                                                    placeholder="Search on Map"
                                                    required
                                                    value={LocationVal}
                                                    onChange={(e) =>
                                                        setLocationIn(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <button
                                                    type="submit"
                                                    className="text-gray-600 p-1.5"
                                                >
                                                    <SearchIcon className="md:h-6 md:w-6 h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <AnimatePresence>
                                    {/* ON Screen Custom Features */}
                                    <div key={'buttons'} className="fixed z-30 gap-6 grid grid-cols-1 items-center bottom-0 right-0 mr-2 mb-4">
                                        {ComplaintData.length > 0 && !complaintDataVisible && (<button
                                            key={"complaint-notifyBtn"}
                                            type="button"
                                            onClick={() => { setComplaintDataVisible(true); setNotifyBtnHovered(false) }}
                                        >
                                            <div className="relative h-fit w-fit">
                                                <motion.div
                                                    className="bg-black p-2 rounded-full group"
                                                    initial={false}
                                                    animate={false}
                                                    exit={{ opacity: 0 }}
                                                    onHoverStart={() =>
                                                        setNotifyBtnHovered(
                                                            true
                                                        )
                                                    }
                                                    onHoverEnd={() =>
                                                        setNotifyBtnHovered(
                                                            false
                                                        )
                                                    }
                                                    transition={{
                                                        duration: 0.5,
                                                    }}
                                                >
                                                    <div className="relative flex items-center justify-center">
                                                        <span className="absolute -top-3 -right-1.5 z-50 h-3 w-3 rounded-full bg-red-500 shadow-md animate-pulse duration-1000" />
                                                        <BellRingIcon
                                                            className="h-5 w-5 animate-wiggle animate-infinite transition-transform duration-300 group-hover:scale-110 drop-shadow"
                                                        />
                                                    </div>

                                                </motion.div>

                                                {complantNotifyBtnHovered && (
                                                    <motion.p
                                                        initial={{
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.2,
                                                        }}
                                                        onHoverStart={() =>
                                                            setNotifyBtnHovered(
                                                                false
                                                            )
                                                        }
                                                        onHoverEnd={() =>
                                                            setNotifyBtnHovered(
                                                                true
                                                            )
                                                        }
                                                        className="fixed bg-black text-white/75 border-white border font-normal text-xs rounded mt-1 w-20 right-2 p-1"
                                                    >
                                                        Complaints
                                                    </motion.p>
                                                )}
                                            </div>
                                        </button>)}


                                        {/* Auto Locate Button */}
                                        <button
                                            key={"autoTrackBtn"}
                                            type="button"
                                            onClick={(e) => AutoLocate(e)}
                                        >
                                            <div className="relative h-fit w-fit">
                                                <motion.div
                                                    className="bg-black p-2 rounded-full group"
                                                    onHoverStart={() =>
                                                        setAutoMarkHoverState(
                                                            true
                                                        )
                                                    }
                                                    onHoverEnd={() =>
                                                        setAutoMarkHoverState(
                                                            false
                                                        )
                                                    }
                                                    transition={{
                                                        duration: 0.5,
                                                    }}
                                                >
                                                    <div className={`${awaitPulse ? "animate-spin" : "animate-none"} animate-duration-1200`}>
                                                        <Locate
                                                            key={awaitPulse}
                                                            className={`h-5 w-auto group-hover:scale-105 transition-transform ${awaitPulse
                                                                ? "animate-pulse"
                                                                : "animate-none"
                                                                }`}
                                                        />
                                                    </div>
                                                </motion.div>

                                                {isAutoMarkhhoverd && (
                                                    <motion.p
                                                        initial={{
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.2,
                                                        }}
                                                        onHoverStart={() =>
                                                            setAutoMarkHoverState(
                                                                true
                                                            )
                                                        }
                                                        onHoverEnd={() =>
                                                            setAutoMarkHoverState(
                                                                false
                                                            )
                                                        }
                                                        className="fixed bg-black text-white/75 border-white border font-normal text-xs rounded mt-1 w-20 right-2 p-1"
                                                    >
                                                        Auto Locate
                                                    </motion.p>
                                                )}
                                            </div>
                                        </button>

                                        {/* Edit map page redirect Element */}
                                        <Link
                                            href="/edit-map"
                                            key={"editMap"}
                                            className="bg-black p-2 rounded-full"
                                        >
                                            <div className="relative h-fit w-fit">
                                                <motion.div
                                                    onHoverStart={() =>
                                                        setEditMarkHoverState(
                                                            true
                                                        )
                                                    }
                                                    onHoverEnd={() =>
                                                        setEditMarkHoverState(
                                                            false
                                                        )
                                                    }
                                                    transition={{
                                                        duration: 0.5,
                                                    }}
                                                    className="group"
                                                >
                                                    <Edit
                                                        className="h-5 w-auto group-hover:scale-105 transition-transform"
                                                        id="edit_btn"
                                                    />
                                                </motion.div>

                                                {isEditMarkhhoverd && (
                                                    <motion.p
                                                        initial={{
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.2,
                                                        }}
                                                        onHoverStart={() =>
                                                            setEditMarkHoverState(
                                                                true
                                                            )
                                                        }
                                                        onHoverEnd={() =>
                                                            setEditMarkHoverState(
                                                                false
                                                            )
                                                        }
                                                        className="fixed bg-black text-white/75 border-white border font-normal text-xs rounded mt-1 w-20 right-2 p-1"
                                                    >
                                                        Add Lamp
                                                    </motion.p>
                                                )}
                                            </div>
                                        </Link>
                                    </div>

                                    <div key={"lamp-list"}>
                                        {/* Lamp List */}
                                        {selectedPoint && (
                                            <motion.div
                                                key={selectedPoint}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                                transition={{ duration: 0.5 }}
                                                className="fixed bottom-0 mb-2 left-0 md:ml-4 ml-2 md:w-[220px] w-[200px] h-56 text-sm shadow-lg z-50 overflow-hidden"
                                            >
                                                <p className="text-md font-semibold w-full bg-gray-800 border-white/80 px-3 py-2.5 flex items-center justify-between cursor-pointer rounded-t-md">
                                                    Lamp Details
                                                    <span>
                                                        <CircleChevronDown
                                                            onClick={() =>
                                                                setSelectedPoint(
                                                                    null
                                                                )
                                                            }
                                                            size={18}
                                                        />
                                                    </span>
                                                </p>
                                                <div className="px-3 py-2.5 flex flex-col gap-2.5 bg-gray-700">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-medium">
                                                            Lamp ID:
                                                        </span>
                                                        <span className="text-xs font-semibold">
                                                            {selectedPoint.id}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-medium">
                                                            State:
                                                        </span>
                                                        <span
                                                            className={`text-xs font-semibold capitalize ${selectedPoint.status ===
                                                                "0" && selectedPoint.statusPriority == 1
                                                                ? "text-yellow-300"
                                                                : selectedPoint.status === "0"
                                                                    ? "text-red-400"
                                                                    : selectedPoint.status === "1"
                                                                        ? "text-green-500"
                                                                        : "text-orange-400"
                                                                }`}
                                                        >
                                                            {
                                                                selectedPoint.status === "0" && selectedPoint.statusPriority == 1
                                                                    ? "Faulty (Got Complaint)"
                                                                    : selectedPoint.status === "0"
                                                                        ? "Faulty"
                                                                        : selectedPoint.status === "1"
                                                                            ? "Working"
                                                                            : "Day Time"
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-xs font-medium">
                                                            Location:
                                                        </span>
                                                        <span className="text-xs text-right max-w-[120px]">
                                                            {
                                                                selectedPoint.location
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="pt-2 mt-2 border-t border-gray-100">
                                                        <p className="text-xs font-medium mb-1">
                                                            Coordinates:
                                                        </p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <p className="text-[10px]">
                                                                    Latitude
                                                                </p>
                                                                <p className="text-xs font-mono break-words">
                                                                    {
                                                                        selectedCoordinates[1]
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px]">
                                                                    Longitude
                                                                </p>
                                                                <p className="text-xs font-mono break-words">
                                                                    {
                                                                        selectedCoordinates[0]
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                    <div key={"complaints-list"}>
                                        {/* Lamp List */}
                                        {ComplaintData.length > 0 && complaintDataVisible && (
                                            <motion.div
                                                key={ComplaintData}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                                transition={{ duration: 0.5 }}
                                                className="fixed bottom-0 mb-2 left-0 md:ml-4 ml-2 md:w-[220px] w-[200px] h-56 text-sm shadow-lg z-50 overflow-hidden"
                                            >
                                                <p className="text-[16px] font-semibold w-full bg-gray-800 border-white/80 px-3 py-2.5 flex items-center justify-between cursor-pointer rounded-t-md">
                                                    <span className="animate-pulse text-yellow-300 text-center">Complaints Received!</span>
                                                    <span>
                                                        <CircleChevronDown
                                                            onClick={() =>
                                                                setComplaintDataVisible(false)
                                                            }
                                                            size={18}
                                                        />
                                                    </span>
                                                </p>
                                                <div className="p-1 flex flex-col gap-2.5 bg-gray-700 text-white h-[200]">
                                                    {ComplaintData.map((item, idx) => (
                                                        <div key={idx} className="grid grid-cols-1 gap-2">
                                                            <button type="button" onClick={() => setSelectedCoordinates(item.properties.coordinates)} className="text-sm text-justify grid grid-cols-1 gap-1 w-full rounded-md hover:bg-gray-400/50 p-1 bg-gray-600 transition-all">{idx + 1}{"."}{" "}Lamp ID: {item.properties.id}{" "}
                                                                <p className="mx-2">
                                                                    Location: {item.properties.location}
                                                                </p>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>



                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
