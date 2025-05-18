'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { toast } from '@/hooks/use-toast';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface MemberCardProps {
  memberId: string;
}

export default function MemberCardGenerator({ memberId }: MemberCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateMemberCard = async () => {
    try {
      setIsGenerating(true);
      
      // Fetch member data
      const memberResponse = await fetch(`/api/members/${memberId}`);
      if (!memberResponse.ok) {
        throw new Error('Failed to fetch member data');
      }
      const memberData = await memberResponse.json();
      
      // Fetch entity data (library name)
      const entityResponse = await fetch('/api/entity-info');
      if (!entityResponse.ok) {
        throw new Error('Failed to fetch entity data');
      }
      const entityData = await entityResponse.json();      // Create PDF document (ID Card size - Portrait orientation)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [85, 105] // ID card size
      });
      
      // Set background color with gradient effect
      const gradient = {
        startColor: [240, 249, 255],
        endColor: [230, 244, 255]
      };
      
      // Create gradient-like background manually
      for (let i = 0; i < 105; i++) {
        const ratio = i / 105;
        const r = Math.floor(gradient.startColor[0] * (1 - ratio) + gradient.endColor[0] * ratio);
        const g = Math.floor(gradient.startColor[1] * (1 - ratio) + gradient.endColor[1] * ratio);
        const b = Math.floor(gradient.startColor[2] * (1 - ratio) + gradient.endColor[2] * ratio);
        doc.setFillColor(r, g, b);
        doc.rect(0, i, 85, 1, 'F');
      }      // Add decorative border with rounded corners
      doc.setDrawColor(51, 153, 255);
      doc.setLineWidth(0.8);
      doc.roundedRect(1, 1, 83, 103, 4, 4, 'S');
      
      // Add decorative top header bar with gradient
      const headerGradient = {
        startColor: [51, 153, 255],
        endColor: [51, 103, 205]
      };
        // Create header gradient manually
      for (let i = 0; i < 16; i++) {
        const ratio = i / 16;
        const r = Math.floor(headerGradient.startColor[0] * (1 - ratio) + headerGradient.endColor[0] * ratio);
        const g = Math.floor(headerGradient.startColor[1] * (1 - ratio) + headerGradient.endColor[1] * ratio);
        const b = Math.floor(headerGradient.startColor[2] * (1 - ratio) + headerGradient.endColor[2] * ratio);
        doc.setFillColor(r, g, b);
        doc.rect(0, i, 85, 1, 'F');
      }
      
      // Add entity name in header (small text)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('LIBRARY CARD', 42.5, 5, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text(entityData.name.toUpperCase(), 42.5, 13, { align: 'center' });
      
      // Generate QR code with member ID
      const qrCodeDataURL = await QRCode.toDataURL(memberData.id, {
        margin: 1,
        width: 150,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      const startY = 33; // Increased starting position after header to move content down

      // Add profile image on left side if available
      if (memberData.profileImage) {
        try {
          // Fetch the profile image
          const imageResponse = await fetch(memberData.profileImage);
          const imageBlob = await imageResponse.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          
          // Convert the image to base64 for jspdf
          const img = new Image();
          img.src = imageUrl;
          
          await new Promise((resolve) => {
            img.onload = resolve;
          });
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const imageDataUrl = canvas.toDataURL('image/jpeg');
              // Add circular mask for profile image
            const imageSize = 24; // Increased size of profile image
              // Add white background circle with shadow for profile image
            doc.setFillColor(230, 230, 230);
            doc.circle(20, startY, imageSize/2 + 0.5, 'F');
            doc.setFillColor(255, 255, 255);
            doc.circle(19.5, startY - 0.5, imageSize/2 + 0.5, 'F');
            
            // Add the profile image
            doc.addImage(imageDataUrl, 'JPEG', 7.5, startY - 12, imageSize, imageSize);
            
            // Add circle border
            doc.setDrawColor(51, 153, 255);
            doc.setLineWidth(0.5);
            doc.circle(19.5, startY - 0.5, imageSize/2 + 0.5, 'S');
            
            // Clean up object URL
            URL.revokeObjectURL(imageUrl);
          }
        } catch (error) {
          console.error('Error adding profile image:', error);
        }
      } else {        // Draw avatar circle with member initials if no profile image
        const imageSize = 24; // Increased size
        doc.setFillColor(51, 103, 205);
        doc.circle(19.5, startY - 0.5, imageSize/2, 'F');
        
        // Add initials inside circle
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14); // Increased font size
        doc.text(memberData.name.charAt(0).toUpperCase(), 19.5, startY + 1, { align: 'center' });
      }
        // Add QR code to the right
      const qrSize = 26; // Increased QR size
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(45, startY - 13, qrSize, qrSize, 2, 2, 'F');
      doc.setDrawColor(200, 220, 240);
      doc.setLineWidth(0.5);
      doc.roundedRect(45, startY - 13, qrSize, qrSize, 2, 2, 'S');
      
      // Add the QR code
      doc.addImage(qrCodeDataURL, 'PNG', 46, startY - 12, qrSize - 2, qrSize - 2);
        // Add member name with large bold font below header
      doc.setFillColor(240, 245, 255);
      doc.roundedRect(3, startY + 15, 79, 12, 2, 2, 'F');
      doc.setDrawColor(200, 220, 240);
      doc.roundedRect(3, startY + 15, 79, 12, 2, 2, 'S');
      
      doc.setTextColor(51, 51, 153);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      
      // Ensure name fits by reducing font size if needed
      const nameWidth = doc.getStringUnitWidth(memberData.name) * 16 / doc.internal.scaleFactor;
      if (nameWidth > 75) {
        doc.setFontSize(14);
      }
      
      doc.text(memberData.name.toUpperCase(), 42.5, startY + 23, { align: 'center' });      // Start the member info section
      let currentY = startY + 30; // Position after the name
      const rowHeight = 6; // Row height
      const rowSpacing = 0.5; // Spacing between rows
      
      // Member ID field
      doc.setFillColor(245, 248, 255);
      doc.roundedRect(6, currentY, 73, rowHeight, 1, 1, 'F');
      
      doc.setTextColor(50, 70, 150);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Member ID:', 10, currentY + 4);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(memberData.id, 75, currentY + 4, { align: 'right' });
      
      // Type field
      currentY += rowHeight + rowSpacing;
      doc.setFillColor(235, 240, 255);
      doc.roundedRect(6, currentY, 73, rowHeight, 1, 1, 'F');
      
      doc.setTextColor(50, 70, 150);
      doc.setFont('helvetica', 'bold');
      doc.text('Type:', 10, currentY + 4);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(formatMemberType(memberData.memberType), 75, currentY + 4, { align: 'right' });
      
      // Phone field
      currentY += rowHeight + rowSpacing;
      doc.setFillColor(245, 248, 255);
      doc.roundedRect(6, currentY, 73, rowHeight, 1, 1, 'F');
      
      doc.setTextColor(50, 70, 150);
      doc.setFont('helvetica', 'bold');
      doc.text('Phone:', 10, currentY + 4);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(memberData.phoneNumber, 75, currentY + 4, { align: 'right' });
      
      // Class field (if applicable)
      if (memberData.class) {
        currentY += rowHeight + rowSpacing;
        doc.setFillColor(235, 240, 255);
        doc.roundedRect(6, currentY, 73, rowHeight, 1, 1, 'F');
        
        doc.setTextColor(50, 70, 150);
        doc.setFont('helvetica', 'bold');
        doc.text('Class:', 10, currentY + 4);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`${memberData.class}${memberData.division ? ' - ' + memberData.division : ''}`, 75, currentY + 4, { align: 'right' });
      }
      
      // Add address field
      currentY += rowHeight + rowSpacing;
      // Split address into multiple lines if needed
      const addressLines = memberData.address.split('\n');
      
      // Calculate needed height based on lines
      const addressHeight = Math.max(rowHeight, addressLines.length * 4);
      
      doc.setFillColor(245, 248, 255);
      doc.roundedRect(6, currentY, 73, addressHeight, 1, 1, 'F');
      
      doc.setTextColor(50, 70, 150);
      doc.setFont('helvetica', 'bold');
      doc.text('Address:', 10, currentY + 4);
      
      // Add each line of address
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(7);
      
      for (let i = 0; i < addressLines.length; i++) {
        doc.text(addressLines[i], 75, currentY + 3 + (i * 4), { align: 'right' });
      }      currentY += addressHeight + 3;
      
    
      // Add decorative bottom bar with gradient
      const footerGradient = {
        startColor: [51, 103, 205],
        endColor: [51, 153, 255]
      };
      
      // Create footer gradient manually
      for (let i = 0; i < 5; i++) {
        const y = 100 + i;
        const ratio = i / 5;
        const r = Math.floor(footerGradient.startColor[0] * (1 - ratio) + footerGradient.endColor[0] * ratio);
        const g = Math.floor(footerGradient.startColor[1] * (1 - ratio) + footerGradient.endColor[1] * ratio);
        const b = Math.floor(footerGradient.startColor[2] * (1 - ratio) + footerGradient.endColor[2] * ratio);
        doc.setFillColor(r, g, b);
        doc.rect(0, y, 85, 1, 'F');
      }
      
      // Add library website or contact
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.text(entityData.website || 'www.library.org', 42.5, 103, { align: 'center' });
      
      // Save the PDF
      doc.save(`Member_Card_${memberData.id}.pdf`);
      
      toast({
        title: 'Success',
        description: 'Member Card has been downloaded',
      });
    } catch (error) {
      console.error('Error generating member card:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate member card',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Helper function to format member type
  const formatMemberType = (type: string) => {
    if (!type) return "";
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };
    return (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={generateMemberCard}
            disabled={isGenerating}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Download Member ID Card</p>
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}
