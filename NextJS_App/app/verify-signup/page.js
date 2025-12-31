// VerifySignup Page

/* eslint-disable */
'use client';
import React, { useEffect, useState } from "react";
import { db, Usrauth } from "@/utils/firebaseConfig";
import { getDoc, doc, deleteDoc } from "firebase/firestore";
import { useAlert } from "@/utils/AlertProvider";
import { isSignInWithEmailLink, signInWithEmailLink, updatePassword } from "firebase/auth";
import Forbidden from "@/components/Forbidden";
import { addUserToFirestore } from "@/utils/firebaseUtils";
import { Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import Circles from "@/components/Circles";

const docID = "pendingVerificationAcc_Logs";

const VerifySignup = () => {
    const [userPass, SetUsrPass] = useState('');
    const [userPass2, SetUsrPass2] = useState('');
    const [role, setRole] = useState('partner');
    const [userName, SetUsrName] = useState('');
    const [userMail, SetUsrMail] = useState('');
    const [userMobNo, SetUsrMobNo] = useState('');
    const [err, setisErr] = useState(false);
    const [showPassword, setPasswordVisible] = useState(false);
    const [showPassword2, setPassword2Visible] = useState(false);
    const [Verified, setIsVerified] = useState(false);
    const { showAlert } = useAlert();
    const [counterVal, setCounterVal] = useState(5);
    const [token, setToken] = useState(null);
    const router = useRouter();
    const hostURL = process.env.NEXT_PUBLIC_HOSTURL;

    useEffect(() => {
        let currentURL = "";
        if (typeof window !== 'undefined') {
            currentURL = window.location.href;
        };
        const fetchCreds = async () => {
            const t = String(new URL(currentURL).searchParams.get('token'));
            const r = String(new URL(currentURL).searchParams.get('role'));
            if (!t || !role) setisErr(true);
            const document = doc(db, docID, t); // Search cred in frestore on behlaf of randomly generatede token to shift data from pending to verified collection if available
            const docSnap = await getDoc(document);

            if (!docSnap.exists()) {
                setisErr(true);
            }
            else {
                setisErr(false);
                const credentials = docSnap.data();
                if (r !== credentials.role) {
                    setisErr(true);
                    return;
                }
                setToken(t);
                setRole(credentials.role);
                SetUsrName(credentials.name);
                SetUsrMobNo(credentials.mobile);
                SetUsrMail(credentials.email);
            }
        }
        fetchCreds();
    }, []);

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        if (userPass.length < 8) showAlert("Password must be greater then 8 character", "info");
        else if (userPass !== userPass2) showAlert("Password is not same, please retry!", "error");
        else {
            try {
                if (isSignInWithEmailLink(Usrauth, window.location.href)) {
                    await signInWithEmailLink(Usrauth, userMail, window.location.href);
                    await updatePassword(Usrauth.currentUser, userPass);
                }
                const uid = Usrauth.currentUser.uid;
                const document = doc(db, docID, token);
                const bearer = await Usrauth.currentUser.getIdToken();
                const res = await fetch("/api/verify-acc", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": `Bearer ${bearer}`

                    },
                })
                const response = await res.json();
                if (!res.ok) throw new Error(response?.message);
                await addUserToFirestore(userName, userMail.toLowerCase().trim(), userMobNo.trim(), `${role}s`, uid);
                await deleteDoc(document);
                setIsVerified(true);
            } catch (error) {
                showAlert(error?.message || error, "error");
            }
        }
    }

    useEffect(() => {
        if (Verified) {
            if (counterVal > 0) {
                const timer = setInterval(() => {
                    setCounterVal((prev) => prev - 1);
                }, 1000);

                return () => clearInterval(timer); // cleanup
            }
            router.replace(hostURL);
        }
    }, [Verified, counterVal]);

    if (!err && !userName) return (<Circles />);
    if (Verified) return (<div className="text-center flex justify-center items-center text-white">Account Verified Successfully, Redirecting to home in {counterVal}s</div>);
    if (err) return (<Forbidden />);
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-black text-white p-4">
            {/* Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-xl 
                  rounded-2xl w-full max-w-3xl p-8 flex flex-col items-center">
                <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-center">
                    Verify your account & create your password
                </h1>

                {/* Credentials */}
                <section className="w-full mb-6">
                    <h2 className="text-lg md:text-xl font-medium mb-4">Your Credentials</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                            <label htmlFor="name" className="text-sm opacity-80 mb-1">Name</label>
                            <input
                                disabled
                                value={userName}
                                id="name"
                                className="bg-transparent border border-white/30 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="mobile" className="text-sm opacity-80 mb-1">Mobile No</label>
                            <input
                                disabled
                                value={userMobNo}
                                id="mobile"
                                className="bg-transparent border border-white/30 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="email" className="text-sm opacity-80 mb-1">Email</label>
                            <input
                                disabled
                                value={userMail}
                                id="email"
                                className="bg-transparent border border-white/30 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>
                </section>

                {/* Password Form */}
                <form
                    onSubmit={(e) => handleSubmitPassword(e)}
                    className="w-full flex flex-col gap-6"
                >
                    <div className="flex flex-col gap-4">
                        {/* Password */}
                        <div className="flex flex-col">
                            <label htmlFor="password" className="text-sm opacity-80 mb-1">
                                Create Password
                            </label>
                            <div className="flex items-center gap-2 border border-white/30 rounded-md px-2 py-1">
                                <input
                                    id="password"
                                    className="bg-transparent outline-none flex-1 p-1"
                                    placeholder="Min. 8 characters"
                                    type={showPassword ? "text" : "password"}
                                    value={userPass}
                                    onChange={(e) => SetUsrPass(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="hover:opacity-80 transition"
                                    onClick={() => setPasswordVisible(!showPassword)}
                                >
                                    {showPassword ? <EyeClosed /> : <Eye />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col">
                            <label htmlFor="confirm-password" className="text-sm opacity-80 mb-1">
                                Confirm Password
                            </label>
                            <div className="flex items-center gap-2 border border-white/30 rounded-md px-2 py-1">
                                <input
                                    id="confirm-password"
                                    className="bg-transparent outline-none flex-1 p-1"
                                    placeholder="Re-enter password"
                                    type={showPassword2 ? "text" : "password"}
                                    value={userPass2}
                                    onChange={(e) => SetUsrPass2(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="hover:opacity-80 transition"
                                    onClick={() => setPassword2Visible(!showPassword2)}
                                >
                                    {showPassword2 ? <EyeClosed /> : <Eye />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white 
                   font-medium py-2 px-4 rounded-lg transition shadow-md"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>

    )
};

export default VerifySignup;
