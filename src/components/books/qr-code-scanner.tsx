'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import jsQR from 'jsqr';

interface BookQRCodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (scannedCode: string) => void;
}

export default function BookQRCodeScanner({ open, onClose, onScan }: BookQRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [usingFrontCamera] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const requestAnimationRef = useRef<number | null>(null);
  const isMounted = useRef(true);
  
  // Start camera when dialog opens
  useEffect(() => {
    if (open) {
      startScanning();
    } else {
      stopScanning();
    }
  }, [open]);
  
  const startScanning = async () => {
    setScanError(null);
    setIsScanning(true);
    setScannedCode(null);

    console.log('Starting camera for book QR code scanning...', isScanning);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      // Choose camera based on state
      try {
        stream.current = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: usingFrontCamera ? "user" : { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (initialError) {
        console.log('Failed with selected camera, trying any camera', initialError);
        // Fallback to any camera
        stream.current = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream.current;
        await videoRef.current.play().catch(e => {
          console.error('Error playing video:', e);
          throw new Error("Failed to start video stream");
        });
        scanQRCode();
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
  };

  const scanQRCode = () => {
    if (!isMounted.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      requestAnimationRef.current = requestAnimationFrame(scanQRCode);
      return;
    }
    
    // Only process the frame if the video has enough data and is actually playing
    if (video.readyState !== video.HAVE_ENOUGH_DATA || video.paused || video.ended) {
      requestAnimationRef.current = requestAnimationFrame(scanQRCode);
      return;
    }
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      requestAnimationRef.current = requestAnimationFrame(scanQRCode);
      return;
    }
    
    // Set canvas size to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      // Get the image data for QR code detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Attempt to find a QR code in the image
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth", // Try both normal and inverted colors
      });
      
      // If a QR code is found
      if (code) {
        console.log("Book QR Code detected:", code.data);
        
        // Check if it matches the expected format (5 digit number)
        if (/^\d{5}$/.test(code.data)) {
          // Highlight the QR code on the canvas
          ctx.beginPath();
          ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
          ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
          ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
          ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
          ctx.lineTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
          ctx.lineWidth = 4;
          ctx.strokeStyle = "#00FF00";
          ctx.stroke();
          
          // Set the scanned code state to trigger UI updates
          setScannedCode(code.data);
          
          // Call the callback function with the scanned code immediately
          onScan(code.data);
          stopScanning();
          onClose();
          
          return; // Stop scanning since we found a valid code
        }
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
    }
    
    // Continue scanning if no valid QR code was found
    requestAnimationRef.current = requestAnimationFrame(scanQRCode);
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Book QR Code</DialogTitle>
          <DialogDescription>
            Position the book QR code within the camera view
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
              <div className="relative w-full aspect-square max-w-[300px] mx-auto border-2 border-primary/30 rounded-md overflow-hidden">
                <video 
                  ref={videoRef} 
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  autoPlay 
                  playsInline 
                  muted
                />
                <div className={`absolute inset-0 pointer-events-none ${scannedCode ? 'border-4 border-green-500 rounded-sm' : ''}`}>
                  {/* Targeting box for QR code alignment - only show corners when not scanning */}
                  {!scannedCode && (
                    <>
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500/70"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500/70"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500/70"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500/70"></div>
                    </>
                  )}
                </div>
                <canvas 
                  ref={canvasRef} 
                  className="hidden"
                />
              </div>
              
              <div className="mt-4 text-center text-sm">
                {!scannedCode ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Ready to scan book QR code (5 digits)...</span>
                  </div>
                ) : (
                  <span className="text-green-600 font-medium">Book QR code detected!</span>
                )}
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
