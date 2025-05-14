import { Metadata } from 'next';
import MemberForm from '@/components/forms/member-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Add Member - Member Management System',
  description: 'Add a new member to the organization',
};

export default function AddMemberPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/dashboard/members">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Members
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8">Add New Member</h1>
        <MemberForm />
      </div>
    </div>
  );
}