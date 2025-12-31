import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebaseConfig";
import { NextResponse } from "next/server";
import admin from "@/utils/firebaseAdmin";

const docid_1 = "GeoData";


const docid_2 = "Complaint_Logs";

export async function POST(req) {
    try {
        const reqData = await req.json();
        const geojson = reqData; //receiving data via POST req
        let { Country, State, Place } = geojson?.GeoData;

        // return NextResponse.json(geojson, { status: 200 });
        if (!Country || !State || !Place) {
            return NextResponse.json(
                { message: "Invalid Data!" },
                { status: 400 }
            );
        }
        // Fetch GeoData document from fireStore
        const docRef = doc(db, docid_1, Country.toUpperCase().trim(), State.toUpperCase().trim(), Place.toUpperCase().trim());
        const document = await getDoc(docRef);

        if (!document.exists()) {
            return NextResponse.json(
                { message: "No record found, Complaint Rejected!" },
                { status: 404 }
            );
        }
        const geodata = document.data(); //data from firestore

        // Formatting incoming data..
        geojson.createdAt = admin.firestore.Timestamp.now().toDate();

        // Incoming data - Streetlight ID and status
        const id = geojson?.data?.properties?.id;
        const state = geojson?.state;
        const status = geojson?.data?.properties?.status

        let ID_Exist = false;
        for (const f of geodata?.features ?? []) {
            if (f.properties?.id === id) {
                ID_Exist = true;
                break;
            }
        }

        // Streetlight with given ID not found!
        if (!ID_Exist) {
            return NextResponse.json(
                {
                    message:
                        "Sorry, Streetlight Isn't Registered!!, Complaint Rejected",
                },
                { status: 404 }
            );
        }

        // Fetch complaints data from doc
        const ComplaintdocRef = doc(db, docid_2, "complaints");
        const document2 = await getDoc(ComplaintdocRef);

        //first (new) complaint received!
        if (document2.exists()) {
            const complaintData = document2.data();

            if (complaintData.complaints?.length < 1) {
                if (status != 1) {
                    const newComplaint = {
                        complaints: [{ GeoData: geojson?.GeoData, id, createdAt: geojson?.createdAt, state: geojson?.state, ...geojson?.data }],
                    };
                    setDoc(ComplaintdocRef, newComplaint);
                } else {
                    return NextResponse.json(
                        { message: "No Complaints to be registered!" },
                        { status: 200 }
                    );
                }
            }
            else { //complaint already exixts in "complaints" collection
                let NewComplaintReceieved = false;
                let complaintSateChanged = false;

                complaintData.complaints = complaintData?.complaints?.map(
                    (c) => {
                        if (c?.id === id) {
                            complaintSateChanged = true
                            return {
                                ...c,
                                properties: {
                                    ...c.properties,
                                    status
                                },
                                state
                            };
                        }
                        NewComplaintReceieved = true; //else: new complaint received flag
                        return c;
                    }
                );

                // registering new complaint
                if (NewComplaintReceieved) {
                    complaintData.complaints?.push({ GeoData: geojson?.GeoData, id, createdAt: geojson?.createdAt, state: geojson?.state, ...geojson?.data });
                    updateDoc(ComplaintdocRef, complaintData);
                }

                // revoking already registered complaint
                if (complaintSateChanged) {
                    updateDoc(ComplaintdocRef, complaintData);
                    if (status == 1 && geojson.state == "revoked") {
                        return NextResponse.json(
                            { message: "Complaint Revoked!" },
                            { status: 200 }
                        );
                    }
                } else { // spam protection 1 time complaint registration 24 hr timeout!
                    return NextResponse.json(
                        {
                            message:
                                "Complaint already registered, PLease wait for few days!",
                        },
                        { status: 400 }
                    );
                }
            }
            return NextResponse.json(
                {
                    message:
                        "Complaint registration succesfull, Held for review!",
                },
                { status: 201 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { message: error?.message || "Invalid Data!" },
            { status: 400 }
        );
    }
}
