import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';

interface LocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

const LOCATIONS = [
  { value: 'Varanasi', label: 'Varanasi', state: 'Uttar Pradesh' },
  { value: 'Kanpur', label: 'Kanpur', state: 'Uttar Pradesh' },
  { value: 'Haridwar', label: 'Haridwar', state: 'Uttarakhand' },
  { value: 'Patna', label: 'Patna', state: 'Bihar' },
];

export const LocationSelector = ({ selectedLocation, onLocationChange }: LocationSelectorProps) => {
  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-card">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-primary rounded-lg">
          <Navigation className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">Select Monitoring Location</h3>
          <Select value={selectedLocation} onValueChange={onLocationChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Choose a location" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((location) => (
                <SelectItem key={location.value} value={location.value}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <div className="font-medium">{location.label}</div>
                      <div className="text-xs text-muted-foreground">{location.state}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>4 stations active</span>
          </div>
        </div>
      </div>
    </Card>
  );
};