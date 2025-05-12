'use client';

import BookForm from '@/components/forms/book-form';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddBookPage() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add New Book</CardTitle>
        </CardHeader>
        <BookForm isEditing={false} />
      </Card>
    </div>
  );
}