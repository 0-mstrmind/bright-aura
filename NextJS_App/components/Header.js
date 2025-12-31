// dynamic Navbar 

/* eslint-disable */
"use client";
import { ChevronRight, Handshake, IdCard, LogOut, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb } from "lucide-react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { Usrauth } from "@/utils/firebaseConfig";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/utils/AuthContext";
import { useTheme } from "@/utils/themeSwitch";
import Logo from "./Logo";

const Navbar = ({
    showHamburger = false,
    isPublic = false,
    isLoginRequired = false,
    loginRole = "partners", //default role Partner
}) => {
    const pathname = usePathname();
    const { BgVal } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);
    const router = useRouter();
    const [dropAnimation, setDropAnimation] = useState(false);
    const { usr, role } = useAuth();
    const [BG, setBg] = useState("#fff");
    const [textColor, setTextColor] = useState("#000");

    // function to convert rgba=>hex
    function rgbaToHex(rgba) {
        const match = rgba.match(
            /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d\.]+)?\)/
        );

        if (!match) return null;

        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        const a =
            match[4] !== undefined
                ? Math.round(parseFloat(match[4]) * 255)
                : 255;

        const hex = (n) => n.toString(16).padStart(2, "0");

        return `#${hex(r)}${hex(g)}${hex(b)}${hex(a)}`;
    }

    // function to invert the rgba values
    function invertRgba(rgba) {
        const match = rgba.match(
            /rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d\.]+)?\)/
        );

        if (!match) return rgba; // fallback if invalid

        const r = 255 - parseInt(match[1]);
        const g = 255 - parseInt(match[2]);
        const b = 255 - parseInt(match[3]);
        const a = match[4] !== undefined ? parseFloat(match[4]) : 1;

        return rgbaToHex(`rgba(${r},${g},${b},${a})`);
    }

    useEffect(() => { // cache clear if no user logged in!
        if (!usr) {
            sessionStorage.removeItem("cached_data");
            sessionStorage.removeItem("cached_pathName", pathname);
        }
    }, [usr]);

    // useEffect hook to change color vallues according to bg value from themecontext
    useEffect(() => {
        const currentBg = BgVal.current.replace(/\s/g, "");
        setBg(currentBg);
        setTextColor(invertRgba(currentBg));
    }, [BgVal.current]);

    // menu dropdown animation
    const menu = () => {
        setMenuOpen((prev) => !prev);
        if (menuOpen) {
            setDropAnimation(true);
        } else {
            setDropAnimation(false);
        }
    };

    // logout user on click
    const logout = async () => {
        await signOut(Usrauth);
        return null;
    };

    return (
        <header>
            <nav className="h-auto w-full shadow-md z-50 relative border-b border-b-white/60 shrink-0" >
                <div className="flex justify-between flex-col items-center p-3.5 mx-auto lg:text-xl text-[0.8rem]">
                    {isPublic ? ( //public page
                        !isLoginRequired ? (
                            <div
                                className="flex items-center justify-between w-full " style={{ color: textColor, backgroundColor: BG }}
                            >
                                <div className="poppins-bold  flex gap-2 items-center">
                                    <Lightbulb /> <span>Bright</span>
                                    <span className="text-(--color-primary) -ml-1.5">
                                        Aura
                                    </span>
                                </div>
                                <div className="flex items-center gap-x-4">
                                    <Link
                                        href={"/login"}
                                        className="px-2 py-1 flex items-center justify-center border border-(--color-primary) rounded-md group active:border-(--color-primary) active:scale-[.95]"
                                    >
                                        <span>Login</span>
                                    </Link>
                                    <Link
                                        href={"/about"}
                                        className="px-2 py-1 flex items-center justify-center border border-(--color-primary) rounded-md group active:border-(--color-primary) active:scale-[.95]"
                                    >
                                        <span>About</span>
                                    </Link>
                                </div>
                            </div>
                        ) : ( //login page (public)
                            <>
                                <div className="flex items-center w-full justify-between bg-black">
                                    <Logo />
                                    <div className="flex gap-x-4 items-center">
                                        <span>
                                            <Link
                                                href="/"
                                                className="transition duration-200 text-white hover:text-(--color-primary)"
                                            >
                                                Home
                                            </Link>
                                        </span>
                                        <span className="md:w-40 w-26 border border-(--color-primary) transition duration-200 py-1 flex justify-center hover:bg-(--color-primary) hover:text-black rounded-md text-white">
                                            <Link href={
                                                loginRole === "admins" ? "/login" : "/admin-login"}
                                            >
                                                {loginRole === "admins" ? "Partner Login" : "Admin Login"}
                                            </Link>
                                        </span>
                                    </div>
                                </div>
                            </>
                        )
                    ) : ( //Protected pages (login compulsory to view options)
                        <>
                            <div className="flex justify-between w-full bg-black">
                                <Logo />
                                <div>
                                    {showHamburger ? ( // hammburger menu for other options and logout button in dashboard-page
                                        <div
                                            role="button"
                                            className="relative"
                                            onClick={() => menu()}
                                        >
                                            <div className="py-1 px-2 rounded-lg space-y-1 hover:bg-white hover:text-black duration-200 cursor-pointer">
                                                <Menu />
                                            </div>
                                            <AnimatePresence>
                                                {dropAnimation && (
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            y: 0,
                                                        }}
                                                        animate={{
                                                            opacity: 100,
                                                            y: 1,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            y: 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.2,
                                                        }}
                                                        className="fixed top-2 right-0 bg-black rounded-lg shadow-lg h-fit w-fit mt-10 m-4 z-50 border space-y-2 p-2 flex justify-center"
                                                    >
                                                        <div className="w-fit h-full grid grid-cols-1 justify-center text-white">
                                                            <Link href={"/profile"}>
                                                                <div className="group flex w-full h-full hover:bg-white hover:text-black rounded-lg items-center p-2 duration-200">
                                                                    <IdCard className="h-5 w-auto" />
                                                                    <p className="pl-2">
                                                                        Profile
                                                                    </p>
                                                                </div>
                                                            </Link>
                                                            {role === "admins" && (
                                                                <Link
                                                                    href={
                                                                        "/manage-partners"
                                                                    }
                                                                >
                                                                    <div className="group flex w-full h-full hover:bg-white hover:text-black rounded-lg items-center p-2 duration-200">
                                                                        <Handshake className="h-5 w-auto" />
                                                                        <p className="pl-2">
                                                                            Manage
                                                                            Partners
                                                                        </p>
                                                                    </div>
                                                                </Link>
                                                            )}
                                                            <button
                                                                className="group flex w-full h-full hover:bg-white hover:text-black rounded-lg items-center p-2 duration-200"
                                                                onClick={logout}
                                                            >
                                                                <LogOut className="h-5 w-auto" />
                                                                <p className="pl-2">
                                                                    Logout
                                                                </p>
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ) : ( // other protected pages instead of dashboard
                                        <div>
                                            <button
                                                className="px-2 py-1 flex items-center justify-center border rounded-md group border-(--color-primary) hover:text-(--color-primary)"
                                                onClick={() => router.back()}
                                            >
                                                <span>Back</span>
                                                <ChevronRight size={22} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </nav>
        </header>

    );
};

export default Navbar;
