import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebaseConfig";
import { NextResponse } from "next/server";

const docId = "GeoData";

export async function GET(req) {
    try {
        const DataHeader = await req.headers.get("data");
        if (!DataHeader)
            return NextResponse.json(
                { message: "Invalid Request Data!" },
                { status: 400 }
            );
        const { Country, State, Place } = JSON.parse(DataHeader);
        const country = String(Country).toUpperCase().trim();
        const StateName = String(State || Country).toUpperCase().trim();
        const PlaceName = String(Place || Country).toUpperCase().trim();
        const docRef = doc(db, docId, country, StateName, PlaceName);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || !docSnap.data()) {
            return new NextResponse(null, { status: 204 });
        }

        return NextResponse.json({ data: docSnap.data() }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    //Getting Post req From FrontEnd
    const reqHeader = await req.headers.get("data");
    try {
        if (!reqHeader)
            return NextResponse.json(
                { message: "Invalid Request header!" },
                { status: 400 }
            );
        const reqData = await req.json();
        let { Country, State, Place } = JSON.parse(reqHeader);
        if (!Country || !State || !Place)
            return NextResponse.json(
                { message: "Inavlid Location Data!!" },
                { status: 400 }
            );

        const geojson = await reqData?.data;
        const docRef = doc(db, docId, Country.toUpperCase().trim(), State.toUpperCase().trim(), Place.toUpperCase().trim());
        const document = await getDoc(docRef);
        let geodata = document.exists();
        if (geojson != null) {
            if (geodata) {
                geodata = document.data();
                const id = geojson?.properties?.id;
                const status = geojson?.properties?.status;
                let Added = true;
                let IsResolved = false;
                let changeDetected = false;
                geodata.features = geodata.features.map((f) => {
                    if (f.properties?.id === id) {
                        if (f.properties.status !== status) {
                            f.properties.status = status;
                            // if (f.properties.status = !status && status == '1') IsResolved = true; // functionlity due ahead
                            changeDetected = true;
                        }
                        Added = false;
                    }
                    return f;
                });

                if (Added) {
                    // Add New Streetlight in location
                    geodata.features.push(geojson);
                    await setDoc(docRef, geodata);
                    return NextResponse.json(
                        { message: "New Data Added!" },
                        { status: 201 }
                    );
                } else {
                    // Update exisiting streetlight state in chain
                    if (changeDetected) {
                        await updateDoc(docRef, geodata);
                        return NextResponse.json(
                            { message: "Data Updated!" },
                            { status: 201 }
                        );
                    }
                    return NextResponse.json(
                        { message: "ID already exists!" },
                        { status: 202 }
                    );
                }
            } else {
                // New Location
                const features = [geojson];
                const initJson = { type: "FeatureCollection", features };
                await setDoc(docRef, initJson);
                return NextResponse.json(
                    { message: "Initial Data Added!" },
                    { status: 201 }
                );
            }
        }
        return NextResponse.json(
            { message: "Null Value Received!!" },
            { status: 400 }
        );
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
