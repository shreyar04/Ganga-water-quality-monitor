import React, { useEffect, useState } from "react";
import { data } from "../data/data";
import axios from "axios";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function ChartPage() {
    const [allData, setAllData] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:1002/allData").then((res) => {
            // console.log(res.data);
            setAllData(res.data);
        });
    }, []);

    console.log(allData);

    const [selectedState, setSelectedState] = useState(""); // state filter
    const [selectedField, setSelectedField] = useState("TEMP"); // parameter filter

    const stateOptions = Array.from(new Set(allData.map((d) => d.STATE)));

    const fieldOptions = [
        { label: "Temperature", value: "TEMP" },
        { label: "DO", value: "DO" },
        { label: "pH", value: "pH" },
        { label: "Fecal Coliform", value: "FECAL_COLIFORM" },
        { label: "BOD", value: "BOD" },
        { label: "Conductivity", value: "CONDUCTIVITY" },
        { label: "Nitrate", value: "NITRATE_N_NITRITE_N" },
    ];

    // Filter data based on selected state
    const filteredData = selectedState
        ? data.filter((d) => d.STATE === selectedState)
        : data;

    // Sort and take last 10 entries
    const sortedData = [...filteredData].sort(
        (a, b) => new Date(a.DATE).getTime() - new Date(b.DATE).getTime()
    );
    const last10Days = sortedData.slice(-10);

    // Chart data
    const chartData = {
        labels: last10Days.map((station) => station.STATION_CODE),
        datasets: [
            {
                label: selectedField,
                data: last10Days.map((station) => station[selectedField]),
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.5)",
            },
        ],
    };

    // Chart options with dynamic axis label
    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Water Quality Data" },
        },
        scales: {
            x: {
                title: { display: true, text: "Station Code" },
            },
            y: {
                title: { display: true, text: selectedField },
            },
        },
    };

    return (
        <div className="container">
            <h1 className="mb-4">
                <b>Last 10 Days Data</b>
            </h1>

            {/* State filter */}
            <div className="row mb-3">
                <div className="col">
                    <label className="mr-2">Select State: </label>
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="">All</option>
                        {stateOptions.map((state) => (
                            <option key={state} value={state}>
                                {state}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Parameter filter */}
            <div className="row mb-3">
                <div className="col">
                    <label className="mr-2">Select Parameter: </label>
                    <select
                        value={selectedField}
                        onChange={(e) => setSelectedField(e.target.value)}
                        className="border rounded px-2 py-1"
                    >
                        {fieldOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Chart */}
            <div className="row">
                <div className="col-6">
                    <Line options={options} data={chartData} />
                </div>
            </div>
        </div>
    );
}

export default ChartPage;
