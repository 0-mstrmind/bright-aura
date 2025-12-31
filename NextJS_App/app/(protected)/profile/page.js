// protected - user profile view page
"use client";
import React from "react";
import { User } from "lucide-react";
import Navbar from "@/components/Header";
import { useAuth } from "@/utils/AuthContext";
import { useAlert } from "@/utils/AlertProvider";
import Circles from "@/components/Circles";

export default function Profile() {
    const { role, data } = useAuth();
    const { showAlert } = useAlert();
    const hostURL = process.env.NEXT_PUBLIC_HOSTURL;

    const resetPassword = async () => {
        try {
            const res = await fetch("/api/reset-pswd", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: data.email, hostURL: hostURL, role: role }),
            });
            const response = await res.json();
            if (!res.ok) {
                throw new Error(response?.message);
            }
            showAlert("Password reset link sent to your email.", "success");
            return;
        } catch (error) {
            showAlert(error?.code || error.message || error, "error");
            return;
        }
    }

    if (!data) { //optional loader
        return <Circles />;
    }
    return (
        <div>
            <Navbar isPublic={false} />
            <div className="max-w-3xl mx-auto p-4 mt-30 poppins">
                <div className="bg-white/50 rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    {/* Profile header */}
                    <div className="p-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                            <User size={40} className="text-gray-400" />
                        </div>

                        <div className="text-center sm:text-left">
                            <h2 className="text-xl poppins-semibold">
                                {data.name}
                            </h2>
                            <p className="text-gray-200 mt-1">
                                {role === "admins" ? "Admin" : "Partner"}
                            </p>
                        </div>
                    </div>

                    {/* Profile details */}
                    <div className="px-6 pb-6 text-white">
                        <div className="space-y-4">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span>Phone</span>
                                <span className="text-right">
                                    {"+" + data.mobile}
                                </span>
                            </div>

                            <div className="flex justify-between py-2">
                                <span>Email</span>
                                <span className="text-right break-all">
                                    {data.email}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-white flex justify-end h-fit text-sm font-medium underline hover:text-gray-300 m-6">
                        <button onClick={() => resetPassword()} className="cursor-pointer">Reset Password</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
