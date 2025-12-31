// public- main landing page with animations
"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Header";
import { QrCode, ScanQrCode} from "lucide-react";
import { useTheme } from "@/utils/themeSwitch";
import { AnimatePresence, motion } from "framer-motion";
import ThemeBg from "@/components/ThemeBg";
import Footer from "@/components/Footer";
import { useAlert } from "@/utils/AlertProvider";
import { Scanner } from "@yudiel/react-qr-scanner";

const PublicPortal = () => {
    const { showAlert } = useAlert();
    // Theme states
    const { ChangeBG, isAnimationValid } = useTheme();
    const [fillColor, setFillColor] = useState("#228B22"); // Start with green
    const [textColor, setTextColor] = useState("##708090"); //  Dark Grey with blue tint

    // QR scanner states
    const [showScanner, setShowScanner] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [scanState, setScanState] = useState("");

    // data states
    const [qrData, setQRData] = useState(null); // QR Code data
    const [GeoData, setGeoData] = useState(null); //LocationData
    const [status, setStatus] = useState("0"); // Default to faulty for complaints

    //change map color
    useEffect(() => {
        if (isAnimationValid) {
            const duration = 3000; // total animation duration (ms)
            const steps = 50; // number of steps
            const interval = duration / steps;
            const startRGB = [34, 130, 34]; // #228B22
            const endRGB = [0, 0, 0]; // #000000

            const lerp = (start, end, t) =>
                Math.round(start + (end - start) * t);

            let step = 0;
            const timer = setInterval(() => {
                step++;
                const t = step / steps;
                const r = lerp(startRGB[0], endRGB[0], t);
                const g = lerp(startRGB[1], endRGB[1], t);
                const b = lerp(startRGB[2], endRGB[2], t);
                setFillColor(`rgb(${r},${g},${b})`);

                if (step >= steps) clearInterval(timer);
            }, interval);
            return () => clearInterval(timer);
        } else {
            setFillColor(`rgb(${0},${0},${0})`);
        }
    }, [isAnimationValid]);

    // change text color automatically with respect to bg
    useEffect(() => {
        const duration = 3000;
        const steps = 50;
        const interval = duration / steps;

        const startRGB = [112, 128, 144]; //rgb(112, 128, 144) - Dark Grey with blue tint
        const endRGB = [255, 255, 255]; //white

        const lerp = (start, end, t) => Math.round(start + (end - start) * t);
        let step = 0;

        const timer = setInterval(() => {
            step++;
            const t = step / steps;
            const r = lerp(startRGB[0], endRGB[0], t);
            const g = lerp(startRGB[1], endRGB[1], t);
            const b = lerp(startRGB[2], endRGB[2], t);
            setTextColor(`rgb(${r},${g},${b})`);

            if (step >= steps) clearInterval(timer);
        }, interval);
        return () => clearInterval(timer);
    }, []);


    // // validate scanned qr
    const validateQRData = (data) => {
        try {
            if (data) { 
                const parsedData = JSON.parse(data);
                if (parsedData?.id) {
                    return {
                        id: parsedData.id,
                    };
                }
            }
            throw new Error("Invalid QR Code!");
        } catch (err) {
            showAlert(err?.message ?? err, "error");
            return null;
        }
    };

    // fetch location through geoapify API
    const fetchCity = async (latitude, longitude) => {
        const API_KEY = process.env.NEXT_PUBLIC_Geoapify_Key;
        const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${API_KEY}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.features.length > 0) {
                return data.features[0];
            }
            throw new Error("City not found!");
        } catch (err) {
            return null;
        }
    };

    // Auto-fetch location through browser
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

    const handleScan = async (data) => {
        if (data) {
            try {
                const validatedData = validateQRData(data[0]?.rawValue);
                setScanState("Processing...")
                const location = await fetchLocation();
                const CityData = await fetchCity(
                    location?.latitude,
                    location?.longitude
                );
                if (location && CityData) {
                    const Country = CityData.properties.country;
                    const State = CityData.properties.state;
                    const cityName = CityData.properties.city;
                    setGeoData({
                        Country: Country,
                        State: State,
                        Place: cityName,
                    });
                    const finalData = {
                        geometry: {
                            type: "Point",
                            coordinates: [
                                location.latitude,
                                location.longitude,
                            ],
                        },
                        properties: {
                            id: validatedData?.id,
                            location: cityName,
                        },
                    };
                    setQRData(finalData);
                    showAlert("Scan Successful!", "info");
                    setScanning(false);
                } else {
                    throw new Error("Failed to fetch city information");
                }
            } catch (error) {
                showAlert(error?.message ?? error, "error");
            } finally {
                setScanState("");
            }
        }
    };

    // submit the complaint (for review)
    const submitComplaint = async (e) => {
        try {
            e.preventDefault();
            const complaintData = {
                GeoData,
                state: status == "1" ? "revoked" : "pending",
                data: {
                    ...qrData,
                },
            };
            complaintData.data.properties.status = status;
            const response = await fetch("/api/complaints", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(complaintData),
            });
            const res = await response.json();
            if (response.ok) {
                showAlert(res.message, "success");
                setQRData(null);
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            showAlert(err?.message ?? err, "error");
        }
    };

    return (
        <>
            <AnimatePresence>
                <motion.div
                    key={showScanner}
                    initial={
                        isAnimationValid
                            ? { backgroundColor: "rgba(255,255,255,1)" }
                            : false
                    }
                    animate={
                        isAnimationValid
                            ? { backgroundColor: "rgba(0,0,0,1)" }
                            : {}
                    }
                    transition={
                        !showScanner
                            ? { duration: 3, ease: "easeInOut" }
                            : false
                    }
                    className="min-h-screen w-full relative z-0 flex flex-col overflow-hidden"
                    style={{ color: textColor }}
                    onUpdate={(latest) => {
                        {/* bg transition */ }
                        if (latest.backgroundColor) {
                            ChangeBG(latest.backgroundColor);
                        }
                    }}
                >
                    <Navbar isPublic={true} />
                    <main>
                        {!showScanner && (
                            <div>
                                <div className="-z-10">
                                    <ThemeBg ThemeColor={fillColor} />
                                </div>
                                <div
                                    style={{ color: textColor }}
                                    className="h-full w-full font-semibold flex px-2 justify-center md:justify-start"
                                >
                                    <div className="absolute md:top-[22vh] top-[30vh] flex flex-col gap-y-20">
                                        <div className="md:px-10 w-[90vw] md:w-[50vw] animate-fade-up animate-duration-2000 flex justify-center md:justify-start">
                                            <h1 className="text-[1.4rem] md:text-5xl text-center md:text-left">
                                                {/* <span className="text-[var(--color-primary)] mr-1 md:mr-2">
                                                    LoRa-Based
                                                </span> */}
                                                Smart
                                                <span className="text-[var(--color-primary)] mx-2">
                                                     Streetlight 
                                                </span>
                                                Mapping System
                                            </h1>
                                        </div>
                                        <div className="flex justify-center md:justify-start md:px-40 animate-fade-up animate-duration-2500">
                                            <button
                                                style={{ color: textColor }}
                                                className="h-fit w-fit text-xl md:text-2xl duration-200 text-center bg-transparent border border-(--color-primary) hover:bg-(--color-primary)/90 md:py-2 md:px-3 py-1 px-2 rounded-lg animate-pulse hover:animate-none cursor-pointer"
                                                onClick={() =>
                                                    setShowScanner(true)
                                                }
                                            >
                                                Help Us Report Issues
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showScanner && (
                            <>
                                <div className="relative flex items-center justify-center p-4">
                                    <div className="w-full max-w-lg bg-white/5 rounded-2xl shadow-xl p-6 relative">
                                        {/* Start Screen */}
                                        {!scanning && !qrData && (
                                            <div className="flex flex-col items-center text-center">
                                                <div className="border-4 border-dashed border-gray-300 rounded-xl p-8 mb-6">
                                                    <QrCode
                                                        size={120}
                                                        className="text-gray-300"
                                                    />
                                                </div>
                                                <p className="text-gray-300 mb-6">
                                                    Scan the QR code on the
                                                    faulty light to report an
                                                    issue.
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setScanState("Scanning... Please wait!");
                                                        setScanning(true);
                                                        setQRData(null);
                                                    }
                                                    }
                                                    className="px-6 py-3 rounded-lg bg-(--color-primary)/80 hover:bg-(--color-primary) text-white font-medium flex items-center gap-2 transition"
                                                >
                                                    <ScanQrCode size={20} />{" "}
                                                    Start Scanning
                                                </button>
                                            </div>
                                        )}

                                        {/* Scanning Screen */}
                                        {scanning && !qrData && (
                                            <div className="flex flex-col items-center">
                                                <div className="border-2 rounded">
                                                    <Scanner
                                                        onScan={handleScan}
                                                        styles={{ container: { width: "auto", height: "auto" } }}
                                                        components={{ torch: true, zoom: true }}
                                                        sound={false}
                                                    />
                                                </div>
                                                <p className="text-blue-400 mt-4 flex items-center gap-2 animate-pulse">
                                                    <span className="w-3 h-3 bg-blue-400 rounded-full animate-ping"></span>
                                                    {scanState}
                                                </p>
                                                <button
                                                    onClick={() => { setScanning(false); setQRData(null) }}
                                                    className="mt-4 px-4 py-2 rounded-lg border border-gray-500 text-gray-300 hover:bg-gray-700"
                                                >
                                                    Cancel Scan
                                                </button>
                                            </div>
                                        )}

                                        {/* QR Data Screen */}
                                        {!scanning && qrData && (
                                            <div className="space-y-4">
                                                <h3 className="text-white text-lg font-semibold">
                                                    Complaint Details
                                                </h3>
                                                <div className="bg-gray-700 p-4 rounded-lg space-y-2 text-gray-300">
                                                    <p>
                                                        <span className="font-medium text-xl">
                                                            Street Light
                                                            Location:
                                                        </span>{" "}
                                                        {GeoData.Place +
                                                            ", " +
                                                            GeoData.State +
                                                            ", " +
                                                            GeoData.Country +
                                                            "..."}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block font-medium text-gray-200 mb-2">
                                                        Issue Type
                                                    </label>
                                                    <div className="flex gap-4">
                                                        {[
                                                            {
                                                                label: "Faulty Light",
                                                                value: "0",
                                                            },
                                                            {
                                                                label: "Revoke Complaint",
                                                                value: "1",
                                                            },
                                                        ].map((opt, index) => (
                                                            <label
                                                                key={opt.value}
                                                                className={`flex-1 p-3 border rounded-lg cursor-pointer text-center transition ${status ===
                                                                    opt.value
                                                                    ? index ===
                                                                        0
                                                                        ? "bg-red-500 text-white hover:bg-red-600"
                                                                        : "bg-green-500 text-white hover:bg-green-600"
                                                                    : "bg-gray-600 text-gray-300 hover:bg-gray-700"
                                                                    }`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name="status"
                                                                    value={
                                                                        opt.value
                                                                    }
                                                                    checked={
                                                                        status ===
                                                                        opt.value
                                                                    }
                                                                    onChange={() =>
                                                                        setStatus(
                                                                            opt.value
                                                                        )
                                                                    }
                                                                    className="hidden"
                                                                />
                                                                {opt.label}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex justify-between gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setQRData(null); setScanning(true);
                                                        }
                                                        }
                                                        className="px-4 py-2 border border-gray-500 rounded-lg text-gray-300 hover:bg-gray-700"
                                                    >
                                                        Rescan
                                                    </button>
                                                    <button
                                                        onClick={(e) => submitComplaint(e)}
                                                        className="px-6 py-2 bg-(--color-primary)/80 hover:bg-(--color-primary) text-white rounded-lg"
                                                        type="submit"
                                                    >
                                                        Submit
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </main>
                    <footer>
                        <Footer />
                    </footer>
                </motion.div>
            </AnimatePresence>
        </>
    );
};

export default PublicPortal;
