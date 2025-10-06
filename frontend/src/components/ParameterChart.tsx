import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Droplets, Thermometer, Activity, AlertTriangle } from 'lucide-react';
import { waterQualityService, PARAMETER_THRESHOLDS } from '@/services/waterQualityService';
import { useTranslation } from 'react-i18next';



interface ParameterChartProps {
  location: string;
  parameter: string;
}

interface ParameterData {
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'safe' | 'warning' | 'critical';
  icon: any;
}

export const ParameterChart = ({ location, parameter }: ParameterChartProps) => {
    const { t } = useTranslation();


  const [parameters, setParameters] = useState<ParameterData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchParameterData = async () => {
      setLoading(true);
      try {
        const data = await waterQualityService.getLocationData(location);
        
        const parameterList: ParameterData[] = [
          {
            name: 'Dissolved Oxygen',
            value: data.parameters.DO,
            unit: 'mg/L',
            threshold: PARAMETER_THRESHOLDS.DO.min,
            status: data.parameters.DO >= PARAMETER_THRESHOLDS.DO.min ? 'safe' : 'critical',
            icon: Droplets
          },
          {
            name: 'BOD',
            value: data.parameters.BOD,
            unit: 'mg/L',
            threshold: PARAMETER_THRESHOLDS.BOD.max,
            status: data.parameters.BOD <= PARAMETER_THRESHOLDS.BOD.max ? 'safe' : 
                   data.parameters.BOD <= PARAMETER_THRESHOLDS.BOD.critical ? 'warning' : 'critical',
            icon: Activity
          },
          {
            name: 'Temperature',
            value: data.parameters.TEMP,
            unit: '°C',
            threshold: PARAMETER_THRESHOLDS.TEMP.max,
            status: data.parameters.TEMP <= PARAMETER_THRESHOLDS.TEMP.max ? 'safe' : 'warning',
            icon: Thermometer
          },
          {
            name: 'pH',
            value: data.parameters.pH,
            unit: '',
            threshold: PARAMETER_THRESHOLDS.pH.max,
            status: data.parameters.pH >= PARAMETER_THRESHOLDS.pH.min && 
                   data.parameters.pH <= PARAMETER_THRESHOLDS.pH.max ? 'safe' : 'warning',
            icon: Activity
          }
        ];

        setParameters(parameterList);
      } catch (error) {
        console.error('Error fetching parameter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParameterData();
  }, [location]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-safe';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'safe': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getProgressValue = (value: number, threshold: number) => {
    return Math.min((value / threshold) * 100, 100);
  };

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-card">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t('parameterChart.title')}</h3>

            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
        </div>

        {/* Parameters List */}
        <div className="space-y-4">
          {parameters.map((param, index) => {
            const Icon = param.icon;
            const progressValue = getProgressValue(param.value, param.threshold);
            
            return (
              <div key={index} className="space-y-2">
                
                {/* Parameter Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${getStatusColor(param.status)}`} />
                    <span className="font-medium text-sm">{param.name}</span>
                  </div>
                  <Badge variant={getStatusBadge(param.status) as any} className="text-xs">
                                       {t(`healthIndex.${param.status}`)}


                  </Badge>
                </div>
                
                {/* Value and Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold">
                      {param.value} {param.unit}
                    </span>
                    <span className="text-muted-foreground">
                      Limit: {param.threshold} {param.unit}
                    </span>
                  </div>
                  <Progress 
                    value={progressValue} 
                    className={`h-2 ${
                      param.status === 'critical' ? '[&>div]:bg-destructive' :
                      param.status === 'warning' ? '[&>div]:bg-warning' :
                      '[&>div]:bg-safe'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-safe">
                {parameters.filter(p => p.status === 'safe').length}
              </div>
              <div className="text-xs text-muted-foreground">{t('healthIndex.safe')}</div>
            </div>
            <div>
              <div className="text-lg font-bold text-warning">
                {parameters.filter(p => p.status === 'warning').length}
              </div>
              <div className="text-xs text-muted-foreground">{t('alerts.warning')}</div>
            </div>
            <div>
              <div className="text-lg font-bold text-destructive">
                {parameters.filter(p => p.status === 'critical').length}
              </div>
              <div className="text-xs text-muted-foreground">{t('alerts.critical')}</div>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center">
          Last reading: {new Date().toLocaleString()}
        </div>
      </div>
    </Card>
  );
};