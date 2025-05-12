'use client';

import { useState, useEffect } from 'react';
import BookForm from '@/components/forms/book-form';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';

interface BookData {
  id: string;
  title: string;
  author: string;
  copies: number;
  categoryId: string;
}

export default function EditBookPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [book, setBook] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/books/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch book');
        }
        
        const data = await response.json();
        setBook(data);
      } catch (error) {
        console.error('Error fetching book:', error);
        toast({
          title: 'Error',
          description: 'Failed to load book details',
          variant: 'destructive',
        });
        router.push('/dashboard/books');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, router]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Book</CardTitle>
          </CardHeader>
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Book Not Found</CardTitle>
          </CardHeader>
          <div className="p-6 text-center">
            <p>The book you are looking for does not exist or you don&apos;t have permission to edit it.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Book: {book.title}</CardTitle>
        </CardHeader>
        <BookForm
          initialData={{
            id: book.id,
            title: book.title,
            author: book.author,
            copies: book.copies,
            categoryId: book.categoryId,
          }}
          isEditing={true}
        />
      </Card>
    </div>
  );
}