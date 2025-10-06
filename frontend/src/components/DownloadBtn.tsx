import React, { useState } from 'react';
import { Download, FileDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { downloadGraphData, generateFilename, type DownloadFormat, type GraphData } from '@/utils/downloadUtils';
import { toast } from '@/hooks/use-toast';

interface DownloadButtonProps {
  data: GraphData[];
  filename?: string;
  graphType?: string;
  showMultipleFormats?: boolean;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  data,
  filename,
  graphType = 'graph',
  showMultipleFormats = true,
  className,
  size = 'default'
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [lastDownloaded, setLastDownloaded] = useState<string | null>(null);

  const baseFilename = filename || generateFilename(graphType);

  const handleDownload = async (format: DownloadFormat) => {
    if (data.length === 0) {
      toast({
        title: "No data available",
        description: "There's no data to download for this graph.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    
    try {
      downloadGraphData(data, baseFilename, format);
      
      setLastDownloaded(format);
      setTimeout(() => setLastDownloaded(null), 2000);
      
      toast({
        title: "Download successful",
        description: `Graph data downloaded as ${format.toUpperCase()} format.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (showMultipleFormats) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
  variant="secondary" 
  size={size}
  className={className}
  disabled={isDownloading}
>
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Data
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            onClick={() => handleDownload('csv')}
            className="cursor-pointer"
          >
            <FileDown className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span>CSV Format</span>
              <span className="text-xs text-muted-foreground">Excel compatible</span>
            </div>
            {lastDownloaded === 'csv' && <Check className="ml-auto h-4 w-4 text-success" />}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleDownload('json')}
            className="cursor-pointer"
          >
            <FileDown className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span>JSON Format</span>
              <span className="text-xs text-muted-foreground">Developer friendly</span>
            </div>
            {lastDownloaded === 'json' && <Check className="ml-auto h-4 w-4 text-success" />}
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleDownload('excel')}
            className="cursor-pointer"
          >
            <FileDown className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span>Excel Format</span>
              <span className="text-xs text-muted-foreground">UTF-8 encoded</span>
            </div>
            {lastDownloaded === 'excel' && <Check className="ml-auto h-4 w-4 text-success" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button 
      variant="secondary" 
      size={size}
      className={className}
      onClick={() => handleDownload('csv')}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download CSV
        </>
      )}
    </Button>
  );
};

export default DownloadButton;