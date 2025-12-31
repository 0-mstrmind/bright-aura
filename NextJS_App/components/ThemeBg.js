// animated theme background
"use client";
import React, { useEffect } from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, MoonIcon } from "lucide-react";
import { MapBg } from "./MapBg";
import { useTheme } from "@/utils/themeSwitch";

export default function ThemeBg({ ThemeColor }) {
    const { BgVal, isAnimationValid, ChangeBG } = useTheme();
    const [sunRise, setSunRise] = useState(false);
    const [SunisUp, setSunPos] = useState(false);
    const [riseMoon, SetMoonPos] = useState(false);
    useEffect(() => { // react hook to check animation status
        if (SunisUp) {
            setTimeout(() => {
                SetMoonPos(true);
            }, 150);
        }
    }, [BgVal, SunisUp]);

    return (
        <div className="md:absolute md:right-0 md:px-10 relative">
            <div className="w-full flex justify-center pt-10 pb-8">
                <AnimatePresence>
                    {!riseMoon && isAnimationValid ? ( // daytime in animation
                        <motion.div
                            initial={
                                SunisUp
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 80 }
                            }
                            animate={
                                SunisUp
                                    ? { opacity: 0, y: 80 }
                                    : { opacity: 1, y: 0 }
                            }
                            transition={{ duration: 0.2 }}
                            onAnimationComplete={() => {
                                if (!sunRise) {
                                    setSunRise(true);
                                    setTimeout(() => {
                                        setSunPos(true);
                                    }, 2000);
                                }
                            }}
                        >
                            <Sun className="fill-amber-300 text-amber-400 h-16 w-16  md:h-32 md:w-32 animate-[spin_3s_linear_infinite]" />
                        </motion.div>
                    ) : ( //night time in animation
                        <motion.div
                            initial={{ opacity: 0, y: 80 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="relative z-10 md:py-2"
                        >
                            <MoonIcon className="fill-white text-white stroke-none h-16 w-16 md:h-28 md:w-28" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {/* animated map (d3) component used here */}
            <MapBg ThemeColor={ThemeColor} />
        </div>
    );
}
