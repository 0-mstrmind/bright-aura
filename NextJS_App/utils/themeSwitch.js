"use client";
import React, { createContext, useContext, useState, useRef } from "react";

const ThemeContext = createContext();
export const ThemeHandler = ({ children }) => {
    const BgVal = useRef("#fff");
    const [isAnimationValid, setAnimation] = useState(true);

    const ChangeBG = (rgba) => {
        if (rgba == "rgba(0,0,0,1)") setAnimation(false);
        if (BgVal.current != rgba) {
            BgVal.current = rgba;
        }
    };
    return (
        <ThemeContext.Provider value={{ BgVal, ChangeBG, isAnimationValid }}>
            {children}
        </ThemeContext.Provider>
    );
};

export function useTheme() {
    return useContext(ThemeContext);
}
