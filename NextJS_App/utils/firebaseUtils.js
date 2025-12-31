import { db } from "./firebaseConfig";
import {
    where,
    query,
    collection,
    deleteDoc,
    doc,
    setDoc,
    getDoc,
    getDocs,
} from "firebase/firestore";

//check Duplicate function
export const checkDuplicate = async (email, mobile, role) => {
    try {
        const usersRef = collection(db, `${role}`);

        // Query for matching email or mobile number
        const emailQuery = query(usersRef, where("email", "==", email));
        const mobileQuery = query(usersRef, where("mobile", "==", mobile));

        const [emailSnapshot, mobileSnapshot] = await Promise.all([
            getDocs(emailQuery),
            getDocs(mobileQuery),
        ]);

        // Check if any documents exist
        return !emailSnapshot.empty && !mobileSnapshot.empty;
    } catch (error) {
        return false;
    }
};

export const addIdToVerify = async (name, email, mobile, role, tokenID) => {
    const usersCollection = collection(db, 'pendingVerificationAcc_Logs');
    await setDoc(doc(usersCollection, tokenID), {
        name: name,
        email: email,
        mobile: mobile,
        role: role,
        status: "pending",
        token: tokenID,
    });
};

// Add user to Firestore
export const addUserToFirestore = async (name, email, mobile, role, uid) => {
    const usersCollection = collection(db, `${role}`);
    await setDoc(doc(usersCollection, uid), {
        name: name,
        email: email,
        mobile: mobile,
        uid: uid,
    });
};

// Move user to Trash
export const moveUserToTrash = async (uid) => {
    const userDoc = doc(db, "partners", uid);
    const trashCollection = collection(db, "disabled_Usr");

    // Fetch user data before deletion
    const userSnapshot = await getDoc(userDoc);
    const userData = userSnapshot.data();

    // Add to trash and delete from users
    await setDoc(doc(trashCollection, uid), userData);
    await deleteDoc(userDoc);
};

// Re-add user from Trash
export const restoreUser = async (uid) => {
    const trashDoc = doc(db, "disabled_Usr", uid);
    const usersCollection = collection(db, "partners");

    // Fetch user data
    const trashSnapshot = await getDoc(trashDoc);
    const userData = trashSnapshot.data();

    // Restore user and delete from trash
    await setDoc(doc(usersCollection, uid), userData);
    await deleteDoc(trashDoc);
};

export const VerifyRole = async (uid, role) => {
    if (uid && role) {
        const userDoc = doc(db, role, uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
            const usrData = userSnapshot.data();
            return { state: true, role: role, data: usrData };
        }
    }
    return null;
};
