require("dotenv").config();

const { data } = require("./data/data.js");
const WaterQuality = require("./model/ganga");

const express = require("express");
const mongoose = require("mongoose");
 const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 3002;
const url = process.env.MONGO_URL;

const app = express();
app.use(cors());
app.use(bodyParser.json());

// app.get("/add", async (req, res) => {
//     await WaterQuality.insertMany(
//         data.map((item) => ({
//             STATION_CODE: item.STATION_CODE,
//             LOCATIONS: item.LOCATIONS,
//             STATE: item.STATE,
//             TEMP: item.TEMP,
//             DO: item.DO,
//             pH: item.pH,
//             CONDUCTIVITY: item.CONDUCTIVITY,
//             BOD: item.BOD,
//             NITRATE_N_NITRITE_N: item.NITRATE_N_NITRITE_N,
//             FECAL_COLIFORM: item.FECAL_COLIFORM,
//             TOTAL_COLIFORM: item.TOTAL_COLIFORM,
//             DATE: item.DATE,
//         }))
//     );
//     res.send("done");
// });

// MongoDB connection

app.get("/allData", async(req, res) => {
    let allData = await WaterQuality.find({});
    res.json(allData);
});


app.get("/get-latlng", async(req,res) => {
    const {address} = req.query;
    if (!address) return res.status(400).json({ error: "Address is required" });

  try {
    const apiKey = process.env.GOOGLE_API_KEY; // store key in .env
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      { params: { address, key: apiKey } }
    );
    
    console.log(response.data);
    const result = response.data.results[0];
    if (!result) return res.status(404).json({ error: "Location not found" });

    const { lat, lng } = result.geometry.location;
    
    console.log(lat,lng);
    res.json({ lat, lng });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch coordinates" });
  }

})


app.get('/predict', async (req, res) => {
    try {
        // Call Flask API
        const response = await axios.get("http://localhost:5000/predictDB");

        // Send predictions back to client
        res.json({ predictions: response.data.predictions });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to fetch predictions' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log("MongoDB connection error:", err));

// Start server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
