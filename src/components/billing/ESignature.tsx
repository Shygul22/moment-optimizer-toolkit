import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pen, Save, RotateCcw, Heart } from 'lucide-react';

interface ESignatureProps {
  onSignature: (signatureData: string) => void;
  existingSignature?: any;
  isReadOnly?: boolean;
}

export const ESignature = ({ onSignature, existingSignature, isReadOnly = false }: ESignatureProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(!!existingSignature);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isReadOnly) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isReadOnly) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        const pixels = imageData.data;
        let hasDrawing = false;
        
        // Check if there's any non-white pixel
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] !== 255 || pixels[i + 1] !== 255 || pixels[i + 2] !== 255) {
            hasDrawing = true;
            break;
          }
        }
        setHasSignature(hasDrawing || !!existingSignature);
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Reset canvas background to white
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL('image/png');
    onSignature(signatureData);
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Set canvas background to white
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'hsl(var(--trust-navy))'; // Use therapy theme color

      // Load existing signature if available
      if (existingSignature?.data) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          setHasSignature(true);
        };
        img.src = existingSignature.data;
      }
    }
  }, [existingSignature]);

  return (
    <Card className="w-full bg-gradient-to-br from-card to-warm-sage/10 border-calming-green/30 shadow-calming">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-trust-navy">
            <Heart className="h-5 w-5 text-calming-green" />
            Professional E-Signature
          </CardTitle>
          {existingSignature && (
            <Badge variant="outline" className="text-calming-green border-calming-green bg-green-50">
              Signed {new Date(existingSignature.timestamp || existingSignature.date).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-calming-green/40 rounded-lg p-4 bg-warm-sage/20">
          <canvas
            ref={canvasRef}
            width={400}
            height={150}
            className="w-full border-2 border-healing-teal/30 rounded cursor-crosshair bg-white shadow-trust transition-all duration-200 hover:border-healing-teal/60"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {isReadOnly ? 'Professional signature on file' : 'Draw your signature above with care'}
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSignature}
              disabled={!hasSignature}
              className="border-healing-teal text-healing-teal hover:bg-healing-teal hover:text-white transition-all duration-200"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button
              size="sm"
              onClick={saveSignature}
              disabled={!hasSignature}
              className="bg-therapy-gradient hover:opacity-90 text-white shadow-calming transition-all duration-200"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Signature
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
