import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Droplets, Activity } from "lucide-react";

// Extend Leaflet types for heatLayer
declare module "leaflet" {
    function heatLayer(latlngs: any[], options?: any): any;
}

// Ganga monitoring stations with coordinates from CSV data
const GANGA_STATIONS = [
    {
        name: "GANGA AT RISHIKESH U/S",
        lat: 30.1031,
        lng: 78.2663,
        temp: 17.2,
        do: 8.7,
        ph: 7.7,
        bod: 1.1,
        nitrate: 0,
        fecal_coliform: 22,
    },
    {
        name: "GANGA AT HARIDWAR D/S",
        lat: 29.9457,
        lng: 78.1642,
        temp: 24.4,
        do: 5.4,
        ph: 7.5,
        bod: 5.3,
        nitrate: 0,
        fecal_coliform: 1600,
    },
    {
        name: "GANGA AT GARHMUKTESHWAR",
        lat: 28.785,
        lng: 78.13,
        temp: 23,
        do: 9,
        ph: 7.4,
        bod: 2.5,
        nitrate: 0.4,
        fecal_coliform: 1268,
    },
    {
        name: "GANGA AT KANPUR U/S",
        lat: 26.4499,
        lng: 80.3319,
        temp: 27,
        do: 7.5,
        ph: 8.2,
        bod: 3.4,
        nitrate: 0.2,
        fecal_coliform: 4856,
    },
    {
        name: "GANGA AT KANPUR D/S",
        lat: 26.4499,
        lng: 80.3319,
        temp: 27,
        do: 6.3,
        ph: 7.7,
        bod: 5.5,
        nitrate: 0.3,
        fecal_coliform: 15889,
    },
    {
        name: "GANGA AT ALLAHABAD",
        lat: 25.4358,
        lng: 81.8463,
        temp: 24.4,
        do: 8.7,
        ph: 8.3,
        bod: 3.6,
        nitrate: 1.7,
        fecal_coliform: 29500,
    },
    {
        name: "GANGA AT VARANASI U/S",
        lat: 25.3176,
        lng: 82.9739,
        temp: 22.5,
        do: 8.3,
        ph: 8.2,
        bod: 2.9,
        nitrate: 0,
        fecal_coliform: 3950,
    },
    {
        name: "GANGA AT VARANASI D/S",
        lat: 25.3176,
        lng: 82.9739,
        temp: 22.5,
        do: 7.8,
        ph: 8.5,
        bod: 4.5,
        nitrate: 0,
        fecal_coliform: 31167,
    },
    {
        name: "GANGA AT PATNA D/S",
        lat: 25.5941,
        lng: 85.1376,
        temp: 24.9,
        do: 7.9,
        ph: 8,
        bod: 2.7,
        nitrate: 0,
        fecal_coliform: 11564,
    },
    {
        name: "GANGA AT BHAGALPUR",
        lat: 25.2425,
        lng: 86.9842,
        temp: 24.4,
        do: 7.7,
        ph: 7.8,
        bod: 2.6,
        nitrate: 0,
        fecal_coliform: 9044,
    },
];

// Other rivers
const OTHER_RIVERS = [
    { name: "Godavari", lat: 17.385, lng: 78.4867 },
    { name: "Krishna", lat: 16.5062, lng: 80.648 },
];

const PARAMETERS = [
    { key: "bod", label: "BOD (mg/L)", max: 10 },
    { key: "do", label: "Dissolved Oxygen (mg/L)", max: 15, reverse: true },
    { key: "fecal_coliform", label: "Fecal Coliform (MPN/100ml)", max: 50000 },
    { key: "nitrate", label: "Nitrate (mg/L)", max: 50 },
    {
        key: "combined",
        label: "Combined Health Index",
        max: 100,
        reverse: true,
    },
];

// Ganga river trail
const GANGA_TRAIL: [number, number][] = [
    [30.3165, 78.0322], // Rishikesh
    [29.964, 77.5552], // Haridwar
    [27.1767, 78.0081], // Agra
    [25.5941, 85.1376], // Patna
    [22.5726, 88.3639], // Kolkata
];

interface MapHeatmapProps {
    selectedLocation?: string;
}

 const calculateHealthIndex = (station: (typeof GANGA_STATIONS)[0]) => {
        let score = 100;
        if (station.do < 4) score -= 30;
        else if (station.do < 6) score -= 15;
        else if (station.do > 8) score -= 10;
        if (station.bod > 5) score -= 25;
        else if (station.bod > 3) score -= 15;
        if (station.ph < 6.5 || station.ph > 8.5) score -= 10;
        if (station.fecal_coliform > 10000) score -= 30;
        else if (station.fecal_coliform > 5000) score -= 20;
        else if (station.fecal_coliform > 1000) score -= 10;
        return Math.max(0, Math.min(100, score));
    };

const MapHeatmapCombined = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const heatLayer = useRef<any>(null);

    const [selectedParameter, setSelectedParameter] = useState("combined");
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<string>("user");

    // Get user location on load
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                },
                (err) => console.warn("Geolocation not allowed", err),
                { enableHighAccuracy: true }
            );
        }
    }, []);

    // Init map
    useEffect(() => {
        if (!mapRef.current) return;

        mapInstance.current = L.map(mapRef.current).setView([26.0, 82.0], 6);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstance.current);

        // Fix Leaflet default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
            iconUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        return () => {
            mapInstance.current?.remove();
            mapInstance.current = null;
        };
    }, []);

    // Handle parameter heatmap update (same as your logic)
    useEffect(() => {
        if (!mapInstance.current) return;
        if (heatLayer.current) mapInstance.current.removeLayer(heatLayer.current);

        const selectedParam = PARAMETERS.find((p) => p.key === selectedParameter);
        if (!selectedParam) return;

        const heatPoints = GANGA_STATIONS.map((station) => {
            let intensity;
            if (selectedParameter === "combined") {
                intensity = calculateHealthIndex(station) / 100;
                if (!selectedParam.reverse) intensity = 1 - intensity;
            } else {
                const value = station[selectedParameter as keyof typeof station] as number;
                intensity = Math.min(value / selectedParam.max, 1);
                if (selectedParam.reverse) intensity = 1 - intensity;
            }
            return [station.lat, station.lng, intensity];
        });

        heatLayer.current = L.heatLayer(heatPoints, {
            radius: 30,
            blur: 20,
            maxZoom: 10,
            max: 1.0,
            gradient: { 0: "#22c55e", 0.5: "#eab308", 1: "#ef4444" },
        }).addTo(mapInstance.current);

        // Add user marker
        if (userLocation) {
            L.marker(userLocation).addTo(mapInstance.current).bindPopup("You are here");
        }

        // Add Ganga stations markers
        GANGA_STATIONS.forEach((station) => {
            const healthIndex = calculateHealthIndex(station);
            let color = "#22c55e";
            if (healthIndex < 80) color = "#eab308";
            if (healthIndex < 50) color = "#ef4444";

            const marker = L.circleMarker([station.lat, station.lng], {
                radius: 8,
                fillColor: color,
                color: "white",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8,
            }).addTo(mapInstance.current!);

            marker.bindPopup(`
              <div class="p-2">
                <h3 class="font-semibold text-sm mb-2">${station.name}</h3>
                <div class="text-xs">Health Index: ${healthIndex.toFixed(1)}</div>
                <div class="text-xs">DO: ${station.do} mg/L</div>
                <div class="text-xs">BOD: ${station.bod} mg/L</div>
                <div class="text-xs">pH: ${station.ph}</div>
                <div class="text-xs">Fecal Coliform: ${station.fecal_coliform.toLocaleString()}</div>
              </div>
            `);
        });

        // Add river trail
        L.polyline(GANGA_TRAIL, { color: "blue", weight: 4 })
            .addTo(mapInstance.current!)
            .bindPopup("Ganga River Trail");
    }, [selectedParameter, userLocation]);

    // Handle location selection change
    useEffect(() => {
        if (!mapInstance.current) return;

        if (selectedLocation === "user" && userLocation) {
            mapInstance.current.setView(userLocation, 10);
        } else {
            const station = GANGA_STATIONS.find((s) => s.name === selectedLocation);
            if (station) mapInstance.current.setView([station.lat, station.lng], 10);
        }
    }, [selectedLocation, userLocation]);

    return (
        <Card className="bg-card border-border shadow-card">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Ganga Pollution & River Map</CardTitle>
                </div>

                {/* Select dropdown for location */}
                <div className="flex items-center gap-4 mt-3">
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select Location" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                            <SelectItem   value="user">📍 My Location</SelectItem>
                            {GANGA_STATIONS.map((station) => (
                                <SelectItem key={station.name} value={station.name}>
                                    {station.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={selectedParameter}
                        onValueChange={setSelectedParameter}
                    >
                        <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select parameter" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                            {PARAMETERS.map((param) => (
                                <SelectItem key={param.key} value={param.key}>
                                    {param.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent>
                <div
                    ref={mapRef}
                    className="w-full h-96 rounded-lg border border-border"
                    style={{ minHeight: "500px" }}
                />
            </CardContent>
        </Card>
    );
};


export default MapHeatmapCombined;
