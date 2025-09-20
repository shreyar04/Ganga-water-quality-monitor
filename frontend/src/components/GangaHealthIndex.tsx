import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Droplets, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { waterQualityService } from '@/services/waterQualityService';

interface GangaHealthIndexProps {
  score: number;
  location: string;
}

export const GangaHealthIndex = ({ score: initialScore, location }: GangaHealthIndexProps) => {
  const [score, setScore] = useState(initialScore);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHealthIndex = async () => {
      setLoading(true);
      try {
        const data = await waterQualityService.getLocationData(location);
        setScore(data.healthIndex);
      } catch (error) {
        console.error('Error fetching health index:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthIndex();
  }, [location]);

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Safe', color: 'bg-gradient-safe', textColor: 'text-safe', icon: TrendingUp };
    if (score >= 50) return { label: 'Moderate', color: 'bg-gradient-warning', textColor: 'text-warning', icon: Minus };
    return { label: 'Unsafe', color: 'bg-gradient-danger', textColor: 'text-destructive', icon: TrendingDown };
  };

  const status = getHealthStatus(score);
  const StatusIcon = status.icon;

  return (
    <Card className="p-6 bg-white/90 backdrop-blur-sm shadow-elegant">
      <div className="space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Droplets className="h-5 w-5 text-white animate-water-flow" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Ganga Health Index</h3>
              <p className="text-sm text-muted-foreground">{location}</p>
            </div>
          </div>
          <Badge variant="outline" className={`${status.textColor} border-current`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>

        {/* Score Display */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-foreground">{score}</div>
          <div className="text-sm text-muted-foreground">out of 100</div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={score} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 rounded-lg bg-gradient-danger/10">
            <div className="font-medium text-destructive">0-49</div>
            <div className="text-muted-foreground">Unsafe</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-gradient-warning/10">
            <div className="font-medium text-warning">50-79</div>
            <div className="text-muted-foreground">Moderate</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-gradient-safe/10">
            <div className="font-medium text-safe">80-100</div>
            <div className="text-muted-foreground">Safe</div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </Card>
  );
};