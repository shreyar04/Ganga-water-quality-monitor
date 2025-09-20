require("dotenv").config();

const { data } = require("./data/data.js");
const WaterQuality = require("./model/ganga");

const express = require("express");
const mongoose = require("mongoose");
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
