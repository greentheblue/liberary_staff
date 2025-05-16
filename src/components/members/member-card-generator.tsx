'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { toast } from '@/hooks/use-toast';
import { FileDown, Loader2, UserRound } from 'lucide-react';
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
      const entityData = await entityResponse.json();        // Create PDF document (ID Card size - Portrait orientation)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [85, 105] // Further reduced height to ensure proper fit
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
      }
        // Add decorative border with rounded corners
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
      
      // Add entity name in header
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('LIBRARY CARD', 42.5, 7, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(entityData.name.toUpperCase(), 42.5, 12, { align: 'center' });
      
      // Title with subtle background
      doc.setFillColor(235, 245, 255);
      doc.rect(10, 20, 65, 12, 'F');
      doc.setDrawColor(200, 220, 240);
      doc.rect(10, 20, 65, 12, 'S');
      
      doc.setTextColor(51, 51, 153);
      doc.setFontSize(14);
      doc.text('MEMBER CARD', 42.5, 28, { align: 'center' });      // Start the member info section closer to the title (no avatar circle)
      const startY = 34; // Further reduced starting position
      const rowHeight = 6; // Minimized row height
      const rowSpacing = 0.5; // Minimized spacing between rows
      
      // Add member information with alternating colored sections
      let currentY = startY;
      
      // Name field
      doc.setFillColor(235, 240, 255);
      doc.roundedRect(6, currentY, 73, rowHeight, 1, 1, 'F');
      
      doc.setFontSize(9);
      doc.setTextColor(50, 70, 150);
      doc.setFont('helvetica', 'bold');
      doc.text('Name:', 10, currentY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(memberData.name, 75, currentY + 5, { align: 'right' });
      
      // Member ID field
      currentY += rowHeight + rowSpacing;
      doc.setFillColor(245, 248, 255);
      doc.roundedRect(6, currentY, 73, rowHeight, 1, 1, 'F');
      
      doc.setTextColor(50, 70, 150);
      doc.setFont('helvetica', 'bold');
      doc.text('Member ID:', 10, currentY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(memberData.id, 75, currentY + 5, { align: 'right' });
      
      // Type field
      currentY += rowHeight + rowSpacing;
      doc.setFillColor(235, 240, 255);
      doc.roundedRect(6, currentY, 73, rowHeight, 1, 1, 'F');
      
      doc.setTextColor(50, 70, 150);
      doc.setFont('helvetica', 'bold');
      doc.text('Type:', 10, currentY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(formatMemberType(memberData.memberType), 75, currentY + 5, { align: 'right' });
      
      // Phone field
      currentY += rowHeight + rowSpacing;
      doc.setFillColor(245, 248, 255);
      doc.roundedRect(6, currentY, 73, rowHeight, 1, 1, 'F');
      
      doc.setTextColor(50, 70, 150);
      doc.setFont('helvetica', 'bold');
      doc.text('Phone:', 10, currentY + 5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(memberData.phoneNumber, 75, currentY + 5, { align: 'right' });
      
      // Class field (if applicable)
      if (memberData.class) {
        currentY += rowHeight + rowSpacing;
        doc.setFillColor(235, 240, 255);
        doc.roundedRect(6, currentY, 73, rowHeight, 1, 1, 'F');
        
        doc.setTextColor(50, 70, 150);
        doc.setFont('helvetica', 'bold');
        doc.text('Class:', 10, currentY + 5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`${memberData.class}${memberData.division ? ' - ' + memberData.division : ''}`, 75, currentY + 5, { align: 'right' });
      }
        // Generate QR code with member ID
      const qrCodeDataURL = await QRCode.toDataURL(memberData.id, {
        margin: 1,
        width: 150,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Add QR code to PDF with border and shadow effect
      currentY += rowHeight + 3;
      const qrSize = 26; // Slightly reduced QR size
      
      // Ensure QR code is fully visible
      if (currentY + qrSize + 5 > 105) {
        currentY = 100 - qrSize - 5; // Make sure QR code fits within card
      }
      
      // QR code white background with shadow effect
      doc.setFillColor(230, 230, 230);
      doc.roundedRect((85 - qrSize) / 2 + 1, currentY + 1, qrSize, qrSize, 2, 2, 'F');
      doc.setFillColor(255, 255, 255);
      doc.roundedRect((85 - qrSize) / 2, currentY, qrSize, qrSize, 2, 2, 'F');
      
      // Add the QR code
      doc.addImage(qrCodeDataURL, 'PNG', (85 - qrSize) / 2 + 1, currentY + 1, qrSize - 2, qrSize - 2);
      
      // Add scan text
      doc.setFontSize(7);
      doc.setTextColor(80, 80, 120);
      doc.text('Scan to verify membership', 42.5, currentY + qrSize + 4, { align: 'center' });
      
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
