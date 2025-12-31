// root layout
import { Roboto, Poppins } from "next/font/google";
import AuthProvider from "@/utils/AuthContext";
import { ThemeHandler } from "@/utils/themeSwitch";
import AlertProvider from "@/utils/AlertProvider";
import "./globals.css";

const roboto = Roboto({
    variable: "--font-roboto",
    weight: ["400", "700"],
    subsets: ["latin"],
});

const poppins = Poppins({
    variable: "--font-poppins",
    weight: ["400", "700"],
    subsets: ["latin"],
});

export const metadata = {
    title: "Bright Aura",
    description:
        "Monitor street lights using LoraWan technology for efficient maintenance and management.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${poppins.variable} ${roboto.variable} poppins-semibold antialiased bg-black text-white`}
            >
                <AuthProvider>
                    <ThemeHandler>
                        <AlertProvider>
                            {children}
                        </AlertProvider>
                    </ThemeHandler>
                </AuthProvider>
            </body>
        </html>
    );
}
