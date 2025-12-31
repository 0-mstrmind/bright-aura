// partner login
"use client";
import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Usrauth } from "../../utils/firebaseConfig";
import { IdCardIcon, Eye, EyeClosed } from "lucide-react";
import MiniLoader from "@/components/MiniLoader";
import { useAuth } from "@/utils/AuthContext";
import { useAlert } from "@/utils/AlertProvider";
import Navbar from "@/components/Header";
import { MapBg } from "@/components/MapBg";
import Footer from "@/components/Footer";

const PartnerLogin = () => {
    const { getRole } = useAuth();
    const [usrMailId, setUsrMail] = useState("");
    const [usrPswd, setUsrPaswd] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [isPassVisible, setPassVisitble] = useState(false);
    const { showAlert } = useAlert();
    const [alertInputSatate, setInputAlertState] = useState(false);

    const hostURL = process.env.NEXT_PUBLIC_HOSTURL;

    // set login role automatically to parftner on page load
    useEffect(() => {
        getRole("partners");
    }, [getRole]);

    // handle login on submit
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(
                Usrauth,
                usrMailId.toLowerCase().trim(),
                usrPswd
            );
            if (!userCredential) {
                throw new Error("failed");
            }
        } catch (error) {
            setLoading(false);
            showAlert("Login failed. Check your credentials!", "error", 2500);
        } finally {
            setTimeout(() => {
                setUsrPaswd("");
            }, 2000);
        }
    };

    const resetPassword = async () => {
        try {
            if (usrMailId == "") {
                setInputAlertState(true);
                showAlert("Please enter the email id!", "error");
            } else {
                setInputAlertState(false);
                const res = await fetch("/api/reset-pswd", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: usrMailId, hostURL: hostURL, role: "partners" }),
                });
                const response = await res.json();
                if (!res.ok) {
                    throw new Error(response?.message);
                }
                showAlert("Password reset link sent to your email.", "success");
                return;
            }
        } catch (error) {
            showAlert(error?.message || error || "Error occured, Failed to send reset-password link!", "error");
            return;
        }
    }
    return (
        <div className="w-full h-screen text-white relative overflow-hidden poppins-semibold">
            {/* Header */}
            {/* navbar compnent with pbulic/login routes */}
            <Navbar
                isPublic={true}
                isLoginRequired={true}
                loginRole={"partners"}
            />

            {/* Background map*/}
            <div className="fixed left-0 right-0 pt-[25vh] blur-map">
                <MapBg Markers={true} />
            </div>

            {/* Main */}
            <main className="flex flex-col md:flex-row items-center justify-between px-6 md:px-20 gap-8 z-90 mt-[10vh] relative">
                {/* Text Section */}
                <section className="md:w-1/2 w-full space-y-4 md:space-y-6 z-20 animate-fade-up animate-duration-1500">
                    <h2 className="text-[1.35rem] md:text-5xl font-semibold text-center md:text-left">
                        <span>
                            Login into your
                        </span>
                        <span className="text-[var(--color-primary)] ml-1 md:ml-2">
                            Partner Account!
                        </span>
                    </h2>
                    <p className="text-[0.8rem] line-clamp-2 md:text-[1.5rem] text-center md:text-left md:px-6 mx-auto text-gray-300">
                        Efficiently track, manage streetlights in real time.
                    </p>
                </section>

                {/* Login Card */}
                <section className="bg-white/10 backdrop-blur-md border border-white/50 rounded-2xl p-5 z-10 lg:p-10 shadow-xl w-full max-w-md md:animate-fade animate-fade-down animate-duration-500 mt-6 md:mt-0">
                    <div className="text-center mb-6">
                        <p className="text-2xl lg:text-3xl font-semibold">
                            Welcome!
                        </p>
                        <p className="text-lg py-2 font-semibold">
                            Partner Login
                        </p>
                    </div>
                    <form
                        onSubmit={handleLogin}
                        className="gap-y-5 flex flex-col justify-center text-white"
                    >
                        {/* Email */}
                        <div className="relative">
                            <input
                                type="email"
                                id="userId"
                                name="usr_id"
                                placeholder="Enter Email"
                                required
                                value={usrMailId}
                                onChange={(e) => {
                                    setUsrMail(e.target.value)
                                    if (alertInputSatate) {
                                        setInputAlertState(false)
                                    }
                                }}
                                className="w-full bg-transparent border rounded-lg py-3 px-4 pr-12 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-white"
                                style={{ borderColor: alertInputSatate ? "var(--color-primary)" : "var(--color-gray-300)" }}
                            />
                            <label
                                htmlFor="userId"
                                className="absolute right-3 top-3.5"
                            >
                                <IdCardIcon className="h-6 w-6" />
                            </label>
                        </div>

                        {/* Password */}
                        <div className="relative">
                            <input
                                type={isPassVisible ? "text" : "password"}
                                id="password"
                                name="usr_pswd"
                                placeholder="Enter Password"
                                required
                                value={usrPswd}
                                onChange={(e) => setUsrPaswd(e.target.value)}
                                className="w-full bg-transparent border border-gray-300 rounded-lg py-3 px-4 pr-12 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-white"
                            />
                            <label
                                htmlFor="password"
                                className="absolute right-3 top-3.5"
                            >
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setPassVisitble(!isPassVisible);
                                    }}
                                >
                                    {isPassVisible ? (
                                        <EyeClosed className="h-6 w-6" />
                                    ) : (
                                        <Eye className="h-6 w-6" />
                                    )}
                                </button>
                            </label>
                        </div>

                        {/* Submit */}
                        <div className="">
                            {isLoading ? (
                                <div className="flex justify-center">
                                    <MiniLoader />
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    id="submit_btn"
                                    className="w-full hover:bg-(--color-primary) text-white font-semibold py-3 rounded-lg  transition duration-200 bg-(--color-primary)/90 cursor-pointer"
                                >
                                    Submit
                                </button>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button type="button" onClick={() => resetPassword()} className="font-medium text-gray-300 hover:text-gray-400 transition-colors cursor-pointer">Reset password</button>
                        </div>
                    </form>
                </section>
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
};

export default PartnerLogin;
