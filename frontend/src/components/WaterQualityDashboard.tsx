import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity, Calendar, TrendingUp } from 'lucide-react';
import { waterQualityService } from '@/services/waterQualityService';
import ChartPage from './ChartPage';
import { useTranslation } from 'react-i18next';



interface WaterQualityDashboardProps {
  location: string;
  parameter: string;
  onParameterChange: (parameter: string) => void;
}

const PARAMETERS = [
  { value: 'DO', key: 'DO', unit: 'mg/L' },
  { value: 'BOD', key: 'BOD', unit: 'mg/L' },
  { value: 'NITRATE_N_NITRITE_N', key: 'NITRATE_N_NITRITE_N', unit: 'mg/L' },
  { value: 'FECAL_COLIFORM', key: 'FECAL_COLIFORM', unit: 'MPN/100ml' },
];

export const WaterQualityDashboard = ({ location, parameter, onParameterChange }: WaterQualityDashboardProps) => {
    const { t } = useTranslation();


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
              <h3 className="text-lg font-semibold">{t('waterQuality.title')}</h3>

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