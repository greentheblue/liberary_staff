'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';
import QRCodeGenerator from '@/components/books/qr-code-generator';

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

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/books');
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      const data = await response.json();
      setBooks(data.books || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({
        title: 'Error',
        description: 'Failed to load books',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete book');
      }

      toast({
        title: 'Success',
        description: 'Book deleted successfully',
      });
      
      fetchBooks();
    } catch (error: Error | unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete book',
        variant: 'destructive',
      });
    }
  };
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Books Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all library books
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <QRCodeGenerator books={books} />
          <Button variant="outline" asChild>
            <Link href="/dashboard/books/categories">
              Manage Categories
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/books/add" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Book
            </Link>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Book Inventory</CardTitle>
        </CardHeader>        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">No books found</p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/books/add">Add your first book</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="whitespace-nowrap">Copies</TableHead>
                    <TableHead className="whitespace-nowrap">Available</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="font-medium max-w-[150px] sm:max-w-[200px] md:max-w-none truncate" title={book.title}>
                        {book.title}
                      </TableCell>
                      <TableCell className="max-w-[100px] sm:max-w-[150px] md:max-w-none truncate" title={book.author}>
                        {book.author}
                      </TableCell>
                      <TableCell>{book.category.name}</TableCell>
                      <TableCell>{book.copies}</TableCell>
                      <TableCell>{book.availableCopies}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/books/edit/${book.id}`)}
                            title="Edit book"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(book.id)}
                            title="Delete book"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>      </Card>
    </div>
  );
}