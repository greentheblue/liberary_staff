// src/components/forms/book-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface BookFormProps {
  initialData?: {
    id: string;
    title: string;
    author: string;
    copies: number;
    categoryId: string;
  };
  isEditing: boolean;
}

export default function BookForm({ initialData, isEditing }: BookFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    author: initialData?.author || '',
    copies: initialData?.copies || 1,
    categoryId: initialData?.categoryId || '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        author: initialData.author,
        copies: initialData.copies,
        categoryId: initialData.categoryId,
      });
    }
  }, [initialData]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/book-categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load book categories',
        variant: 'destructive',
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'copies' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast({ title: 'Error', description: 'Title is required', variant: 'destructive' });
      return;
    }
    
    if (!formData.author.trim()) {
      toast({ title: 'Error', description: 'Author is required', variant: 'destructive' });
      return;
    }
    
    if (formData.copies < 1) {
      toast({ title: 'Error', description: 'Copies must be at least 1', variant: 'destructive' });
      return;
    }
    
    if (!formData.categoryId) {
      toast({ title: 'Error', description: 'Please select a category', variant: 'destructive' });
      return;
    }
    
    try {
      setLoading(true);
      
      const url = isEditing 
        ? `/api/books/${initialData?.id}`
        : '/api/books';
        
      const method = isEditing ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save book');
      }
      
      toast({
        title: 'Success',
        description: `Book ${isEditing ? 'updated' : 'added'} successfully`,
      });
      
      router.push('/dashboard/books');
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Error',
        description: errorMessage || `Failed to ${isEditing ? 'update' : 'add'} book`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const noCategoriesAvailable = categories.length === 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/books">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Books
            </Link>
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Book Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter book title"
              value={formData.title}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              name="author"
              placeholder="Enter author name"
              value={formData.author}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="copies">Number of Copies</Label>
            <Input
              id="copies"
              name="copies"
              type="number"
              min="1"
              placeholder="Enter number of copies"
              value={formData.copies}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Category</Label>
            {noCategoriesAvailable ? (
              <div className="p-2 border rounded-md">
                <p className="text-sm text-muted-foreground mb-2">
                  No categories available. Please add a category first.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/books/categories">Add Categories</Link>
                </Button>
              </div>
            ) : (
              <select
                name="categoryId"
                className="w-full h-9 rounded-md border border-input px-3 py-2 text-sm"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <Button type="submit" disabled={loading || noCategoriesAvailable}>
            {loading ? (
              <>
                <span className="animate-spin mr-2">⊛</span>
                {isEditing ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              isEditing ? 'Update Book' : 'Add Book'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}