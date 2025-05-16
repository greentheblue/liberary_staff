'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

// This is a sample component to test the member card layout
export default function TestMemberCard() {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  
  useEffect(() => {
    // Create an SVG QR code (just for visualization)
    const svgQrCode = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect x="10" y="10" width="80" height="80" fill="white" stroke="black" stroke-width="1" />
      <rect x="20" y="20" width="10" height="10" fill="black" />
      <rect x="30" y="20" width="10" height="10" fill="black" />
      <rect x="40" y="20" width="10" height="10" fill="black" />
      <rect x="20" y="30" width="10" height="10" fill="black" />
      <rect x="40" y="30" width="10" height="10" fill="black" />
      <rect x="20" y="40" width="10" height="10" fill="black" />
      <rect x="70" y="40" width="10" height="10" fill="black" />
      <rect x="20" y="70" width="10" height="10" fill="black" />
    </svg>
    `;
    
    // Convert SVG to data URL
    const svgBase64 = btoa(svgQrCode);
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;
    setDataUrl(dataUrl);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-sm">
        {/* Member Card Preview */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white text-center py-3">
            <h2 className="text-lg font-bold">Green The Red Library</h2>
          </div>
          
          {/* Card Title */}
          <div className="text-center py-3 border-b">
            <h3 className="text-xl font-bold">MEMBER CARD</h3>
          </div>
          
          {/* Member Info */}
          <div className="p-4 space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Name:</span>
              <span>John Smith</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Member ID:</span>
              <span>MS001</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Type:</span>
              <span>Student</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Phone:</span>
              <span>9876543210</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Class:</span>
              <span>10 - A</span>
            </div>
          </div>
          
          {/* QR Code */}
          <div className="p-4 flex flex-col items-center">
            {dataUrl && (
              <img 
                src={dataUrl} 
                alt="QR Code" 
                className="w-32 h-32 border border-gray-200"
              />
            )}
            <p className="text-xs text-gray-500 mt-2">Scan to verify membership</p>
          </div>
          
          {/* Footer */}
          <div className="bg-blue-600 h-5"></div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-4">
            This is a preview of how the member card will look when downloaded as PDF.
          </p>
          <Button>Download Real Card</Button>
        </div>
      </div>
    </div>
  );
}
