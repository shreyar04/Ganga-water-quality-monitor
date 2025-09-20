import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { WaterQualityDashboard } from '@/components/WaterQualityDashboard';
import { GangaHealthIndex } from '@/components/GangaHealthIndex';
import { AlertsPanel } from '@/components/AlertsPanel';
import { LocationSelector } from '@/components/LocationSelector';
import { ParameterChart } from '@/components/ParameterChart';
import { Waves, Droplets, Activity, AlertTriangle } from 'lucide-react';
import Map from '@/components/Map'
import ChartPage from '@/components/ChartPage'

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState('Varanasi');
  const [selectedParameter, setSelectedParameter] = useState('DO');
  const [healthIndex, setHealthIndex] = useState(75);

  return (
    <div className="min-h-screen bg-gradient-water">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-card border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Waves className="h-6 w-6 text-white animate-water-flow" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Ganga Water Quality Monitor</h1>
              <p className="text-muted-foreground">Real-time monitoring and forecasting system</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Location Selector */}
          <div className="lg:col-span-12">
            <LocationSelector 
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
            />
          </div>

          {/* Health Index */}
          <div className="lg:col-span-4">
            <GangaHealthIndex 
              score={healthIndex}
              location={selectedLocation}
            />
          </div>

          {/* Map */}
          <div className="lg:col-span-8">
            <Map/>
          </div>

          {/* Alerts Panel */}
          <div className="lg:col-span-8">
            <AlertsPanel location={selectedLocation} />
          </div>

          {/* Water Quality Dashboard */}
          <div className="lg:col-span-8">
            <WaterQualityDashboard 
              location={selectedLocation}
              parameter={selectedParameter}
              onParameterChange={setSelectedParameter}
            />
          </div>

          {/* Parameter Chart */}
          <div className="lg:col-span-4">
            <ParameterChart 
              location={selectedLocation}
              parameter={selectedParameter}
            />
          </div>

         

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t mt-12">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Ganga Monitoring System</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Data updated: {new Date().toLocaleDateString()}</span>
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-safe animate-pulse-glow" />
                <span>System Active</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;