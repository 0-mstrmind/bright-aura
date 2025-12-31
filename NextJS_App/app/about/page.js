// About page
import React from "react";
import { MapBg } from "@/components/MapBg";
import Navbar from "@/components/Header";
import Footer from "@/components/Footer";

export default function About() {
    return (
        <div className="min-h-screen flex flex-col relative">
            <Navbar />
            {/* Background */}
            <div className="fixed left-0 right-0 pt-[25vh] -z-10 blur-map">
                <MapBg Markers={true} />
            </div>

            <main>
                <div className="fixed left-0 right-0 top-[30vh]">
                    <h2 className="text-2xl md:text-5xl text-center mb-4  mx-auto animate-fade-up">
                        About Us
                    </h2>
                    <p className="text-sm md:text-xl text-justify p-4 md:w-[50vw] font-medium leading-relaxed text-gray-300 mx-auto animate-fade-up">
                        BrightAura is a LoRa-powered streetlight monitoring system designed for smart cities.
                        It enables real-time visibility of streetlight status, helping authorities detect faults, reduce energy waste, and respond faster—using reliable, low-power long-range communication.
                    </p>
                </div>
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}
