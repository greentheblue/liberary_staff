"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Camera, Trash2, Check, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CameraCaptureProps {
  onImageCaptured: (imageUrl: string) => void;
  onCancel: () => void;
  existingImage?: string;
}

export default function CameraCapture({
  onImageCaptured,
  onCancel,
  existingImage
}: CameraCaptureProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(existingImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stream = useRef<MediaStream | null>(null);

  // Detect mobile device
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }
  }, []);

  // Initialize camera when component mounts
  useEffect(() => {
    if (!existingImage && !capturedImage && !showFileUpload) {
      setIsCameraOpen(true);
    }

    return () => {
      stopCamera();
    };
  }, [existingImage, capturedImage, showFileUpload]);

  // Start camera when isCameraOpen is true
  useEffect(() => {
    if (isCameraOpen) {
      startCamera();
    }
  }, [isCameraOpen]);

  const startCamera = async () => {
    setCameraError(null);

    if (!videoRef.current) {
      console.warn("Video element not immediately available, waiting...");
      const startTime = Date.now();
      while (!videoRef.current && Date.now() - startTime < 2000) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (!videoRef.current) {
        console.error("Video element not available after waiting");
        setCameraError("Cannot access camera: Video element not found. Please refresh the page and try again.");
        setShowFileUpload(true);
        setIsCameraOpen(false);
        return;
      }
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      stream.current = await navigator.mediaDevices.getUserMedia({
        video: isMobile ? { facingMode: "environment" } : true
      });

      const videoTracks = stream.current.getVideoTracks();
      if (videoTracks.length === 0) {
        throw new Error("No video tracks found in the stream");
      }

      videoTracks.forEach(track => {
        track.addEventListener('ended', () => {
          setCameraError("Camera disconnected. Please try again.");
          stopCamera();
          setIsCameraOpen(true);
        });
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream.current;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        videoRef.current.controls = false;

        await videoRef.current.play();
        console.log("Camera started successfully");
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      if (stream.current) {
        stream.current.getTracks().forEach(track => track.stop());
        stream.current = null;
      }

      let errorMessage = "Cannot access camera. Please try again or use the upload option.";
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Camera access denied. Please grant permission and try again.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "No camera found. Please check your device or use the upload option.";
        }
      }
      setCameraError(errorMessage);
      setShowFileUpload(true);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (stream.current) {
      stream.current.getTracks().forEach(track => track.stop());
      stream.current = null;
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast({
        title: "Error",
        description: "Camera not ready",
        variant: "destructive"
      });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.scale(-1, 1);
    context.translate(-canvas.width, 0);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    stopCamera();
  };

  const confirmImage = async () => {
    if (!capturedImage) return;

    setIsUploading(true);
    try {
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('image', blob, 'member-photo.jpg');

      console.log("Uploading image to server...", process.env.PHP_PUBLIC_IMAGE_UPLOAD_URL);

      const uploadUrl = process.env.PHP_PUBLIC_IMAGE_UPLOAD_URL || 'https://file.greentheblue.org/upload.php';
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      console.log("Upload response:", uploadResponse);

      if (!uploadResponse.ok) {
        onImageCaptured(capturedImage);
        toast({
          title: "Upload Failed",
          description: "Using local image instead.",
          variant: "destructive"
        });
      } else {
        const data = await uploadResponse.json();
        onImageCaptured(data.imageUrl || capturedImage);
      }
    } catch (error) {
      console.error('Upload error:', error);
      onImageCaptured(capturedImage);
      toast({
        title: "Upload Error",
        description: "Using local image instead.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setCapturedImage(result);
        setShowFileUpload(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (cameraError && showFileUpload) {
    return (
      <Card className="p-4 max-w-md mx-auto">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4">
            <h3 className="font-semibold mb-1">Camera Error</h3>
            <p className="text-sm">{cameraError}</p>
          </div>
          <div className="flex justify-center gap-3 flex-col sm:flex-row">
            <Button onClick={() => fileInputRef.current?.click()} variant="default">
              <Upload className="mr-2 h-4 w-4" /> Upload Image
            </Button>
            <Button
              onClick={() => {
                setCameraError(null);
                setShowFileUpload(false);
                setIsCameraOpen(true);
              }}
              variant="outline"
            >
              <Camera className="mr-2 h-4 w-4" /> Try Camera Again
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 max-w-md mx-auto">
      <div className="flex flex-col items-center">
        <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
          {isCameraOpen ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              controls={false}
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Camera size={48} className="text-gray-400" />
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-3 mt-2 flex-wrap justify-center">
          {isCameraOpen ? (
            <>
              <Button onClick={captureImage} variant="default" className="flex-1">
                <Camera className="mr-2 h-4 w-4" /> Capture
              </Button>
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                <X className="mr-2 h-4 w-4" /> Stop
              </Button>
            </>
          ) : capturedImage ? (
            <>
              <Button onClick={confirmImage} variant="default" disabled={isUploading} className="flex-1">
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {isUploading ? "Uploading..." : "Confirm"}
              </Button>
              <Button onClick={() => { setCapturedImage(null); setIsCameraOpen(true); }} variant="outline" className="flex-1">
                <Trash2 className="mr-2 h-4 w-4" /> Retake
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsCameraOpen(true)} variant="default" className="flex-1">
                <Camera className="mr-2 h-4 w-4" /> Open Camera
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1">
                <Upload className="mr-2 h-4 w-4" /> Upload
              </Button>
            </>
          )}
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          ref={fileInputRef}
          className="hidden"
        />
      </div>
    </Card>
  );
}