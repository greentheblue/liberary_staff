'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScanLine } from 'lucide-react';
import jsQR from 'jsqr';

interface QRCodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (scannedCode: string) => void;
}

export default function QRCodeScanner({ open, onClose, onScan }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [lastDetectedCode, setLastDetectedCode] = useState<string | null>(null);
  const [detectionCount, setDetectionCount] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const requestAnimationRef = useRef<number | null>(null);
  const isMounted = useRef(true);

  // Handle mobile device
  const facingMode = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  ) ? { facingMode: "environment" } : true;
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      stopScanning();
    };
  }, []);
  // Start camera when dialog opens
  useEffect(() => {
    if (open) {
      startScanning();
      console.log(isScanning);
    } else {
      stopScanning();
    }
  }, [open]);

  const startScanning = async () => {
    setScanError(null);
    setIsScanning(true);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      stream.current = await navigator.mediaDevices.getUserMedia({
        video: facingMode,
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream.current;
        videoRef.current.play();
        detectQRCode();
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      setScanError('Failed to access camera. Please check camera permissions and try again.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (requestAnimationRef.current) {
      cancelAnimationFrame(requestAnimationRef.current);
      requestAnimationRef.current = null;
    }
    
    if (stream.current) {
      stream.current.getTracks().forEach(track => track.stop());
      stream.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
    setLastDetectedCode(null);
    setDetectionCount(0);
  };

  const detectQRCode = () => {
    if (!isMounted.current) return;
    
    // Request next animation frame
    requestAnimationRef.current = requestAnimationFrame(detectQRCode);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!(video && canvas && video.readyState === video.HAVE_ENOUGH_DATA)) {
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    
    // If QR code is detected
    if (code) {
      // Only process if it's exactly 10 digits (member ID)
      if (/^\d{10}$/.test(code.data)) {
        // Require multiple consistent reads to prevent errors
        if (lastDetectedCode === code.data) {
          setDetectionCount(prev => prev + 1);
          
          // If we detect the same code multiple times, we're confident it's correct
          if (detectionCount >= 3) {
            // Highlight the QR code
            ctx.beginPath();
            ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
            ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
            ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
            ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
            ctx.lineTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#00FF00";
            ctx.stroke();
            
            // Stop scanning and use the code
            if (requestAnimationRef.current) {
              cancelAnimationFrame(requestAnimationRef.current);
              requestAnimationRef.current = null;
              
              // Process the successful scan
              onScan(code.data);
              stopScanning();
              onClose();
            }
          }
        } else {
          // Reset count when a different code is detected
          setLastDetectedCode(code.data);
          setDetectionCount(1);
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Member QR Code</DialogTitle>
          <DialogDescription>
            Position the QR code within the camera view
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative flex flex-col items-center">
          {scanError ? (
            <div className="p-4 text-center text-red-500">
              <p>{scanError}</p>
              <Button 
                variant="outline" 
                onClick={startScanning} 
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="relative w-full aspect-square max-w-[300px] mx-auto border-2 border-dashed rounded-md overflow-hidden">
                <video 
                  ref={videoRef} 
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  autoPlay 
                  playsInline 
                  muted
                />
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 opacity-70 transform -translate-y-1/2 z-10">
                    <ScanLine className="text-red-500 absolute right-0 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>
                <canvas 
                  ref={canvasRef} 
                  className="hidden"
                />
              </div>
              
              <div className="animate-pulse mt-2 text-center text-sm text-muted-foreground">
                Searching for QR code...
              </div>
            </>
          )}
        </div>
        
        <DialogFooter className="flex flex-row justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
