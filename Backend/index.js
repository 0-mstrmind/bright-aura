//Backend Endpoint for gateway requests
import express from "express";
import { db } from "./utils/firebase.js";
import cors from "cors";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "key"],
  })
);

const HeaderCheck = (req) => {
  const AuthKey = req.headers["key"] || 1230;
  const DataHeader = req.headers["data"];
  if (AuthKey !== process.env.GATEWAY_AUTH_KEY) return null;
  if (!DataHeader) return null;
  let { Country, State, Place } = JSON.parse(DataHeader);
  Country = Country.trim().toUpperCase();
  State = State.trim().toUpperCase();
  Place = Place.trim().toUpperCase();
  return { Country, State, Place };
};

const GeoDocID = "GeoData";

app.get("/data", async (req, res) => {
  try {
    const GeoData = HeaderCheck(req);
    if (GeoData) {
      const { Country, State, Place } = GeoData;
      const docRef = db
        .collection(GeoDocID)
        .doc(Country)
        .collection(State)
        .doc(Place);
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        return res.status(204).json(null); // No street light on the specific area
      }
      return res.status(200).json(docSnap.data());
    }
    return res.status(404).json({ message: "Invalid or missing data header!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.post("/data", async (req, res) => {
  try {
    const GeoData = HeaderCheck(req);
    const reqData = await req.body;
    if (GeoData) {
      const { Country, State, Place } = GeoData;
      const geojson = reqData; //Data from GateWay
      const docRef = db
        .collection(GeoDocID.trim())
        .doc(Country.trim())
        .collection(State.trim())
        .doc(Place.trim());
      const docSnap = await docRef.get();
      let data = docSnap.exists;
      if (geojson != null) {
        if (data) {
          data = docSnap.data();
          // Getting POST req from GateWay!
          if ("features" in geojson) {
            const geoDataMap = {}; //Store Temporary Data from Firestore
            for (const f of data.features || []) {
              if (f.properties?.id) {
                geoDataMap[f.properties.id] = f.properties;
              }
            }

            let IsData_Changed = false; // data update flag

            for (const feature of geojson.features) {
              const id = feature.properties?.id;
              if (id && geoDataMap[id]) {
                if (feature.properties.status !== geoDataMap[id].status) {
                  geoDataMap[id].status = feature.properties.status;
                  await docRef.update(geojson);
                  IsData_Changed = true
                }
              }
            }
            if (IsData_Changed) {
              return res.status(201).json({ message: "Data Updated!" });
            }
            return res.status(200).json({ message: "No Updates Yet!" });
          }
          return res.status(403).json({ message: "Forbidden!" });
        } else {
          // add New Location in collection
          const initJson = { type: "FeatureCollection", "features": geojson?.features };
          await docRef.set(initJson);
          return res.status(201).json({ message: "Initial Data Added!" });
        }
      }
      return res.status(400).json({ message: "Null Value Received!!" });
    }
    return res.status(404).json({ message: "Invalid or missing required headers!" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

