'use client';

import { useState } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { QrCodeIcon } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  copies: number;
  availableCopies: number;
  category: {
    name: string;
  };
}

interface QRCodeGeneratorProps {
  books: Book[];
}

export default function QRCodeGenerator({ books }: QRCodeGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [option, setOption] = useState<'single' | 'all' | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateSingleQRCode = async (bookId: string) => {
    try {
      setIsGenerating(true);
      const book = books.find(b => b.id === bookId);
      
      if (!book) {
        toast({ 
          title: 'Error', 
          description: 'Book not found', 
          variant: 'destructive' 
        });
        return;
      }
      
      // Create PDF document (A4 size)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(book.id, {
        margin: 1,
        width: 150,
      });
      
      // Add QR code to PDF
      doc.addImage(qrCodeDataURL, 'PNG', 70, 70, 70, 70);
      
      // Add book info
      doc.setFontSize(16);
      doc.text(book.title, 105, 150, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`ID: ${book.id}`, 105, 160, { align: 'center' });
      
      // Add border around QR code
      doc.rect(60, 60, 90, 120);
      
      // Save the PDF
      doc.save(`Book_QRCode_${book.id}.pdf`);
      
      toast({
        title: 'Success',
        description: 'QR code PDF has been downloaded',
      });
      
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code PDF',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setOpen(false);
    }
  };
  
  const generateAllQRCodes = async () => {
    try {
      setIsGenerating(true);
      
      if (books.length === 0) {
        toast({
          title: 'Info',
          description: 'No books available to generate QR codes',
        });
        return;
      }        // Create PDF document (A4 size)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
        // A4 size in mm is 210×297
      const pageWidth = 210;
      const pageHeight = 297;
      
      // Set fixed grid size: 5 columns and 6 rows
      const boxesPerRow = 5;
      const boxesPerCol = 6;
      const boxesPerPage = boxesPerRow * boxesPerCol;
      
      // Calculate box size based on fixed grid
      const margin = 6; // mm - reduced margin further
      const boxSpacing = 0.5; // mm - minimal spacing between boxes
      
      // Calculate maximum possible size for QR code based on grid requirements
      const availableWidthPerBox = (pageWidth - 2 * margin - (boxesPerRow - 1) * boxSpacing) / boxesPerRow;
      const availableHeightPerBox = (pageHeight - 2 * margin - (boxesPerCol - 1) * boxSpacing) / boxesPerCol;
      
      // Ensure box is not too tall (keep some space for text)
      const textAreaHeight = 10; // mm - space for title and ID
      const qrCodeSize = Math.min(availableWidthPerBox - 4, availableHeightPerBox - textAreaHeight - 2);
      
      const boxWidth = qrCodeSize + 4; // Total width of a box
      const boxHeight = qrCodeSize + textAreaHeight; // Total height of a box including text
      
      for (let i = 0; i < books.length; i++) {
        const book = books[i];
        
        // Add a new page if needed
        if (i > 0 && i % boxesPerPage === 0) {
          doc.addPage();
        }
        
        // Calculate position within the current page
        const positionOnPage = i % boxesPerPage;
        const col = positionOnPage % boxesPerRow;
        const row = Math.floor(positionOnPage / boxesPerRow);
        
        // Calculate exact position with minimal spacing
        const xPosition = margin + col * (boxWidth + boxSpacing);
        const yPosition = margin + row * (boxHeight + boxSpacing);
          // Generate QR code
        const qrCodeDataURL = await QRCode.toDataURL(book.id, {
          margin: 1,
          width: 100, // Smaller size for 5x6 grid
        });
        
        // Add QR code to PDF
        doc.addImage(qrCodeDataURL, 'PNG', xPosition, yPosition, qrCodeSize, qrCodeSize);
        
        // Add book info - title in smaller font
        doc.setFontSize(6); // Smaller font for more compact layout
        doc.text(book.title.substring(0, 18) + (book.title.length > 18 ? '...' : ''), 
                xPosition + qrCodeSize/2, yPosition + qrCodeSize + 1.5, { align: 'center' });
        
        // Make book ID bold and slightly smaller
        doc.setFontSize(10); // Reduced from 10
        doc.setFont('helvetica', 'bold'); // Set font to bold for ID
        doc.text(`${book.id}`, xPosition + qrCodeSize/2, yPosition + qrCodeSize + 7, { align: 'center' });
        doc.setFont('helvetica', 'normal'); // Reset font to normal
        
        // Add border around QR code box - smaller height
        doc.rect(xPosition - 1, yPosition - 1, boxWidth, boxHeight);
      }
      
      // Save the PDF
      doc.save('All_Books_QRCodes.pdf');
      
      toast({
        title: 'Success',
        description: 'QR codes PDF has been downloaded',
      });
      
    } catch (error) {
      console.error('Error generating QR codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR codes PDF',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
      setOpen(false);
    }
  };
  
  const handleDownload = async () => {
    if (option === 'single') {
      if (!selectedBookId) {
        toast({
          title: 'Error',
          description: 'Please select a book',
          variant: 'destructive',
        });
        return;
      }
      await generateSingleQRCode(selectedBookId);
    } else if (option === 'all') {
      await generateAllQRCodes();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>      <DialogTrigger asChild>
        <Button variant="outline">
          <QrCodeIcon className="mr-2 h-4 w-4" />
          Generate QR Codes
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate QR Codes</DialogTitle>
          <DialogDescription>
            Generate QR codes for books in the library. You can generate QR codes for a single book or all books.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 my-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant={option === 'single' ? 'default' : 'outline'}
              onClick={() => setOption('single')}
            >
              Single Book
            </Button>
            <Button 
              variant={option === 'all' ? 'default' : 'outline'}
              onClick={() => setOption('all')}
            >
              All Books
            </Button>
          </div>
          
          {option === 'single' && (
            <Select value={selectedBookId} onValueChange={setSelectedBookId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a book" />
              </SelectTrigger>
              <SelectContent>
                {books.map(book => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            disabled={!option || isGenerating || (option === 'single' && !selectedBookId)} 
            onClick={handleDownload}
          >
            {isGenerating ? (
              <>
                <span className="animate-spin mr-2">⊛</span>
                Generating...
              </>
            ) : (
              'Download PDF'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
