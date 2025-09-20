import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity, Calendar, TrendingUp } from 'lucide-react';
import { waterQualityService } from '@/services/waterQualityService';
import ChartPage from './ChartPage';

interface WaterQualityDashboardProps {
  location: string;
  parameter: string;
  onParameterChange: (parameter: string) => void;
}

const PARAMETERS = [
  { value: 'DO', label: 'Dissolved Oxygen (mg/L)', unit: 'mg/L' },
  { value: 'BOD', label: 'BOD (mg/L)', unit: 'mg/L' },
  { value: 'NITRATE_N_NITRITE_N', label: 'Nitrate (mg/L)', unit: 'mg/L' },
  { value: 'FECAL_COLIFORM', label: 'Fecal Coliform (MPN/100ml)', unit: 'MPN/100ml' },
];

export const WaterQualityDashboard = ({ location, parameter, onParameterChange }: WaterQualityDashboardProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const chartData = await waterQualityService.getChartData(location, parameter);
        setData(chartData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [location, parameter]);

  const selectedParam = PARAMETERS.find(p => p.value === parameter);

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-card h-[700px]">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Water Quality Trends</h3>
              <p className="text-sm text-muted-foreground">{location}</p>
            </div>
          </div>
          
          
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ChartPage/>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
       
      </div>
    </Card>
  );
};