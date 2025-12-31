"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore"
import { db } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Usrauth } from "./firebaseConfig";
import { VerifyRole } from "./firebaseUtils";
import { useRouter } from "next/navigation";

const AuthContext = createContext(); // main Auth-context

// AuthProvider component that wraps the application
export const AuthProvider = ({ children }) => {

    const [usrData, setUsrData] = useState({
        usr: null,
        role: null,
        data: null
    });
    const [Temprole, setTempRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const getRole = useCallback((currUsrRole) => { // get role from compoenets login/admin-login page for role verification.
        if (!currUsrRole) return null;
        setTempRole(currUsrRole);
        sessionStorage.setItem("role", currUsrRole)
        return currUsrRole;
    }, []);

    useEffect(() => {
        try {
            const unsubscribe = onAuthStateChanged(Usrauth, async (user) => {
                if (user) {
                    const cachedRole = sessionStorage.getItem("role") ?? Temprole;
                    const userData = await VerifyRole(user?.uid, cachedRole);
                    if (userData) {
                        const idToken = await user.getIdToken();
                        const response = await fetch("/api/session-login", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ idToken }),
                        });
                        await response.json();
                        if (response.ok) {
                            const userDocRef = doc(db, cachedRole, user?.uid);
                            const userDocSnap = await getDoc(userDocRef);
                            if (userDocSnap.exists()) {
                                const userDoc = userDocSnap.data();
                                setUsrData({ usr: user, role: cachedRole, data: userDoc });
                                router.push(sessionStorage.getItem("cached_pathName") ?? "/dashboard");
                            }
                        }
                    }
                }
                else {
                    setUsrData({ usr: null, role: null, data: null });
                    signOut(Usrauth);
                }
                setLoading(false);
            });
            return unsubscribe;
        } catch (error) {
            setUsrData({ usr: null, role: null, data: null })
            setLoading(false);
        }
    }, [Temprole]);

    return (
        <AuthContext.Provider value={{ ...usrData, getRole, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
