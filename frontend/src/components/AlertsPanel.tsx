import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { waterQualityService, Alert } from '@/services/waterQualityService';

interface AlertsPanelProps {
  location: string;
}

export const AlertsPanel = ({ location }: AlertsPanelProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const alertsData = await waterQualityService.getAlerts(location);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [location]);

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertTriangle;
      case 'warning': return AlertCircle;
      default: return Info;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-card">
      <div className="space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-warning rounded-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Active Alerts</h3>
              <p className="text-sm text-muted-foreground">{location}</p>
            </div>
          </div>
          <Badge variant="outline">
            {alerts.length} active
          </Badge>
        </div>

        {/* Alerts List */}
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-safe" />
              <div>No active alerts</div>
              <div className="text-xs">All parameters within normal range</div>
            </div>
          ) : (
            alerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.severity);
              return (
                <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                  <AlertIcon className={`h-4 w-4 ${
                    alert.severity === 'critical' ? 'text-destructive' : 
                    alert.severity === 'warning' ? 'text-warning' : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{alert.parameter}</span>
                      <Badge variant={getAlertColor(alert.severity) as any} className="text-xs">
                        {alert.severity}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Current: {alert.value} | Threshold: {alert.threshold}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {alert.timestamp}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-destructive">
              {alerts.filter(a => a.severity === 'critical').length}
            </div>
            <div className="text-xs text-muted-foreground">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-warning">
              {alerts.filter(a => a.severity === 'warning').length}
            </div>
            <div className="text-xs text-muted-foreground">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-muted-foreground">
              {alerts.filter(a => a.severity === 'info').length}
            </div>
            <div className="text-xs text-muted-foreground">Info</div>
          </div>
        </div>
      </div>
    </Card>
  );
};