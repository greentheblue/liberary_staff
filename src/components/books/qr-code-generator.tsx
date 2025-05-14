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
      doc.text(`Author: ${book.author}`, 105, 170, { align: 'center' });
      
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
      }
      
      // Create PDF document (A4 size)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
        const qrCodeSize = 45; // mm
      const margin = 10; // mm
      const boxSpacing = 5; // mm
      const boxesPerRow = 3;
      const boxesPerCol = 4;
      
      for (let i = 0; i < books.length; i++) {
        const book = books[i];
        const boxIndex = i % (boxesPerRow * boxesPerCol);
          // Add a new page if needed
        if (boxIndex === 0 && i > 0) {
          doc.addPage();
        }
        
        const col = boxIndex % boxesPerRow;
        const row = Math.floor(boxIndex / boxesPerRow);
        
        // Calculate position
        const xPosition = margin + col * (qrCodeSize + boxSpacing + 25);
        const yPosition = margin + row * (qrCodeSize + boxSpacing + 30);
        
        // Generate QR code
        const qrCodeDataURL = await QRCode.toDataURL(book.id, {
          margin: 1,
          width: 150,
        });
        
        // Add QR code to PDF
        doc.addImage(qrCodeDataURL, 'PNG', xPosition, yPosition, qrCodeSize, qrCodeSize);
        
        // Add book info
        doc.setFontSize(8);
        doc.text(book.title.substring(0, 20) + (book.title.length > 20 ? '...' : ''), 
                xPosition + qrCodeSize/2, yPosition + qrCodeSize + 10, { align: 'center' });
        doc.setFontSize(7);
        doc.text(`ID: ${book.id}`, xPosition + qrCodeSize/2, yPosition + qrCodeSize + 15, { align: 'center' });
        
        // Add border around QR code box
        doc.rect(xPosition - 2, yPosition - 2, qrCodeSize + 4, qrCodeSize + 20);
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
