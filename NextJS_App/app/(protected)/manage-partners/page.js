// protected (only admin) - page to manage partners/users
"use client";
import React, { useState, useEffect } from "react";
import { db } from "@/utils/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import {
    checkDuplicate,
    moveUserToTrash,
    restoreUser,
} from "@/utils/firebaseUtils";
import { useAlert } from "@/utils/AlertProvider";
import {
    Mail,
    Phone,
    RefreshCcw,
    Search,
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';
import Navbar from "@/components/Header";
import { generateRandomToken } from "@/utils/tokenGenerator";

export default function ManageUsr() {
    const { showAlert } = useAlert();
    const [FirstName, setFirstName] = useState('');
    const [MiddleName, setMiddleName] = useState('');
    const [LastName, setLastName] = useState('');
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [users, setUsers] = useState([]);
    const [trash, setTrash] = useState([]);
    const [userSearch, setUserSearch] = useState("");
    const [disabled_usr_serach_term, setDisabledUsrSearch] = useState("");
    const [refreshAnimation, setRefreshanimation] = useState("");
    const [roleSelection, setRoleSelection] = useState("partner");
    const hostURL = process.env.NEXT_PUBLIC_HOSTURL;

    const fetchUsers = async () => {
        try {
            // Fetch Active Users
            const usersCollection = collection(db, "partners");
            const usersSnapshot = await getDocs(usersCollection);
            const partners = usersSnapshot.docs.map((doc) => ({
                id: doc.id, // Firestore document ID
                ...doc.data(), // Document data (email, mobile, etc.)
            }));
            // Fetch Trash Users
            const trashCollection = collection(db, "disabled_Usr");
            const trashSnapshot = await getDocs(trashCollection);
            const trashedUsers = trashSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            // Update state
            setUsers(partners);
            setTrash(trashedUsers);
        } catch (error) {
            showAlert("Error fetching partners data: " + error, "error");
        }
    };

    const handleAddUser = async () => {
        if (!FirstName || !email || !mobile) {
            showAlert("All fields are required!", "info");
            return;
        }

        try {
            //duplicate check
            const isDuplicate = await checkDuplicate(email.toLowerCase().trim(), mobile, roleSelection);
            if (isDuplicate) {
                throw new Error("Email or Mobile Number already exists!");
            } else {
                let Name = FirstName + " " + MiddleName;
                Name = Name.trim() + " " + LastName;

                const token = generateRandomToken();

                const res = await fetch("/api/verify-acc", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: email.toLocaleLowerCase().trim(), name: Name, mobile: mobile, role: roleSelection, hostURL: hostURL, token: token }),
                });
                const response = await res.json();
                if (!res.ok) {
                    throw new Error(response?.message);
                }
                // Clear input fields
                setFirstName("");
                setMiddleName("");
                setLastName("")
                setEmail("");
                setMobile("");
                showAlert("User account held for verification successfully!", "success");
            }
        } catch (error) {
            showAlert(error?.message ?? error, "error");
        }
    };

    const handleRemoveUser = async (uid) => {
        try {
            const response = await fetch("/api/disable-partner", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ uid }),
            });

            const res = await response.json();
            if (response.status !== 200) {
                throw new Error("Error Occured: " + res.message);
            } else {
                await moveUserToTrash(uid);
                fetchUsers();
            }
        } catch (error) {
            showAlert(error?.message ?? error, "error");
        }
    };

    const handleRestoreUser = async (uid) => {
        try {
            const response = await fetch("/api/enable-partner", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ uid }),
            });
            const res = await response.json();
            if (response.status !== 200) {
                throw new Error("Error Occured: " + res.message);
            } else {
                await restoreUser(uid);
                fetchUsers();
            }
        } catch (error) {
            showAlert(error?.message ?? error, "error");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const refreshList = async () => {
        setRefreshanimation("animate-spin");
        await fetchUsers();
        setRefreshanimation("");
    };

    const filterUsers = (list, searchTerm) => {
        return list.filter((user) => {
            return user.mobile?.toString().includes(searchTerm); // Compare after converting to string
        });
    };

    return (
        <>
            <Navbar />
            <div className="h-full w-full relative overflow-auto">
                <div className="h-full flex justify-center max-w-[800px] mx-auto">
                    <div className="p-2 w-full">
                        <div className="p-6 h-auto rounded-lg w-full grid grid-cols-1 gap-y-4">
                            <h1 className="text-2xl text-center pb-6 text-white">
                                Manage{" "}
                                <span className="text-(--color-primary)">
                                    Partners
                                </span>
                            </h1>

                            {/* Add User Form */}
                            <div className="bg-white/20 w-full p-8 rounded shadow text-black">
                                <h2 className="text-xl pb-4 text-white">
                                    Add Partner
                                </h2>
                                <div className="grid grid-cols-1 gap-y-3.5">
                                    <div>
                                        <p className="text-xs mb-1 text-white">Name</p>
                                        <div className="text-black grid grid-cols-3 gap-2">
                                            <input
                                                type="text"
                                                placeholder="First Name"
                                                className="p-2 border rounded w-full ml-2 bg-white/80 md:text-sm text-xs"
                                                value={FirstName}
                                                onChange={(e) =>
                                                    setFirstName(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <input
                                                type="text"
                                                placeholder="Middle Name"
                                                className="p-2 border rounded w-full ml-2 bg-white/80 md:text-sm text-xs"
                                                value={MiddleName}
                                                onChange={(e) =>
                                                    setMiddleName(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <input
                                                type="text"
                                                placeholder="Last Name"
                                                className="p-2 border rounded w-full ml-2 bg-white/80 md:text-sm text-xs"
                                                value={LastName}
                                                onChange={(e) =>
                                                    setLastName(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex flex-col z-50">
                                        <label
                                            htmlFor="fullname"
                                            className="text-xs mb-1 text-white"
                                        >
                                            Phone
                                        </label>
                                        <div className="p-[0.2] border rounded w-full ml-2 text-black bg-white/80 text-sm z-10 flex items-center outline outline-transparent focus-within:outline-white">
                                            <PhoneInput
                                                required
                                                enableSearch
                                                international
                                                country={'us'}
                                                value={mobile}
                                                onChange={mobile => setMobile(mobile)}
                                                inputStyle={{ width: "100%", backgroundColor: "transparent", border: "none" }}
                                                buttonStyle={{ backgroundColor: "transparent", borderRight: "1px solid gray" }}
                                                dropdownStyle={{ backgroundColor: "rgba(255, 255, 255)", color: "black", border: "1px solid gray", boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)" }}
                                            />
                                            <span className="relative right-0 mr-1.5">
                                                <Phone size={18} />
                                            </span>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="fullname"
                                            className="text-xs mb-1 text-white"
                                        >
                                            Email
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="johndoe@mail.com"
                                                className="p-2 border rounded w-full ml-2 text-black bg-white/80 text-sm"
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <span className="absolute right-0 top-2">
                                                <Mail size={20} />
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Role Selection section */}
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="flex items-center gap-2 justify-center">
                                        <label className="text-xs text-white" htmlFor="partner-role">Partner</label>
                                        <input type="radio" id="partner-role" name="role" value={roleSelection} onChange={() => setRoleSelection("partner")} defaultChecked />
                                    </div>
                                    <div className="flex items-center justify-center gap-2">
                                        <label className="text-xs text-white" htmlFor="admin-role">Admin</label>
                                        <input type="radio" id="admin-role" name="role" value={roleSelection} onChange={() => setRoleSelection("admin")} />
                                    </div>
                                </div>
                                <div className="flex justify-center pt-4">
                                    <button
                                        type="submit"
                                        onClick={() => handleAddUser()}
                                        className="bg-blue-500 ml-2 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>

                            {/*Active Partners Table */}
                            <div className="bg-white/20 p-4 rounded shadow grid grid-cols-1">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl poppins-semibold mb-4 text-white">
                                        Active Partners
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={async () =>
                                            await refreshList()
                                        }
                                    >
                                        <RefreshCcw
                                            className={`${refreshAnimation} text - white active: scale - [.90]`}
                                        />
                                    </button>
                                </div>
                                <div className="relative mb-4">
                                    <div className="p-[0.2] border rounded w-full text-black bg-white/80 text-sm z-10 flex items-center outline outline-transparent focus-within:outline-white">
                                        <PhoneInput
                                            required
                                            enableSearch
                                            international
                                            country={'us'}
                                            value={userSearch}
                                            onChange={searchval => setUserSearch(searchval)}
                                            inputStyle={{ width: "100%", backgroundColor: "transparent", border: "none" }}
                                            buttonStyle={{ backgroundColor: "transparent", borderRight: "1px solid gray" }}
                                            dropdownStyle={{ backgroundColor: "rgba(255, 255, 255)", color: "black", border: "1px solid gray", boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)" }}
                                        />
                                        <span className="relative right-0 mr-1.5">
                                            <Search size={18} />
                                        </span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-lg border border-gray-300">
                                    <table className="min-w-full border-collapse">
                                        <thead className="bg-gray-200">
                                            <tr>
                                                <th className="border border-gray-300 p-2 text-left text-sm poppins text-gray-700">
                                                    Email
                                                </th>
                                                <th className="border border-gray-300 p-2 text-left text-sm poppins text-gray-700">
                                                    Mobile
                                                </th>
                                                <th className="border border-gray-300 p-2 text-sm poppins text-gray-700 w-24">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 text-white h-fit max-h-48 w-auto overflow-y-auto transparent-scrollbar">
                                            {filterUsers(
                                                users,
                                                userSearch
                                            ).map((user) => (
                                                <tr
                                                    key={`${user.uid} -${user.email} `}
                                                    className="hover:bg-gray-200/80 group"
                                                >
                                                    <td className="border border-gray-300 p-2 text-sm">
                                                        <div className="max-w-[200px] md:max-w-none truncate group-hover:text-gray-800">
                                                            {user.email}
                                                        </div>
                                                    </td>
                                                    <td className="border border-gray-300 p-2 text-sm">
                                                        <div className="max-w-[120px] md:max-w-none truncate group-hover:text-gray-800">
                                                            {user.mobile}
                                                        </div>
                                                    </td>
                                                    <td className="border border-gray-300 p-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveUser(
                                                                    user.uid
                                                                )
                                                            }
                                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 text-xs rounded transition-colors"
                                                            aria-label={`Remove ${user.email} `}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Trash Table */}
                            <div className="bg-white/20 p-4 rounded shadow">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl poppins-semibold mb-4 text-white">
                                        Non-active Partners
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={async () =>
                                            await refreshList()
                                        }
                                    >
                                        <RefreshCcw
                                            className={`${refreshAnimation} active: scale - [.90]`}
                                        />
                                    </button>
                                </div>
                                <div className="relative mb-4">
                                    <div className="p-[0.2] border rounded w-full text-black bg-white/80 text-sm z-10 flex items-center outline outline-transparent focus-within:outline-white">
                                        <PhoneInput
                                            required
                                            enableSearch
                                            international
                                            country={'us'}
                                            value={disabled_usr_serach_term}
                                            onChange={searchval => setDisabledUsrSearch(searchval)}
                                            inputStyle={{ width: "100%", backgroundColor: "transparent", border: "none" }}
                                            buttonStyle={{ backgroundColor: "transparent", borderRight: "1px solid gray" }}
                                            dropdownStyle={{ backgroundColor: "rgba(255, 255, 255)", color: "black", border: "1px solid gray", boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)" }}
                                        />
                                        <span className="relative right-0 mr-1.5">
                                            <Search size={18} />
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto rounded-lg border border-gray-300">
                                    <table className="w-full min-w-max border-collapse">
                                        <thead className="bg-gray-200">
                                            <tr>
                                                <th className="border border-gray-300 p-2 text-left text-sm poppins text-gray-700">
                                                    Email
                                                </th>
                                                <th className="border border-gray-300 p-2 text-left text-sm poppins text-gray-700">
                                                    Mobile
                                                </th>
                                                <th className="border border-gray-300 p-2 text-sm poppins text-gray-700 w-24">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="h-fit max-h-48 overflow-y-auto transparent-scrollbar w-auto text-white">
                                            {filterUsers(
                                                trash,
                                                disabled_usr_serach_term
                                            ).map((user) => (
                                                <tr
                                                    key={`${user.uid} -${user.email} `}
                                                    className="hover:bg-gray-200/80 transition-colors group"
                                                >
                                                    <td className="border border-gray-300 p-2 text-sm group-hover:text-gray-800">
                                                        <div className="max-w-[200px] md:max-w-none truncate">
                                                            {user.email}
                                                        </div>
                                                    </td>
                                                    <td className="border border-gray-300 p-2 text-sm group-hover:text-gray-800">
                                                        <div className="max-w-[200px] md:max-w-none truncate">
                                                            {user.mobile}
                                                        </div>
                                                    </td>
                                                    <td className="border-b border-gray-300 p-2">
                                                        <div className="flex justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRestoreUser(
                                                                        user.uid
                                                                    )
                                                                }
                                                                className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded transition-colors whitespace-nowrap"
                                                            >
                                                                Restore
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
}
