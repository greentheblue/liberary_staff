'use client';

import MemberForm from '@/components/forms/member-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function EditMemberPage() {
  const params = useParams();
  const id = params.id as string;
  
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
        <h1 className="text-3xl font-bold mb-8">Edit Member</h1>
        <MemberForm memberId={id} />
      </div>
    </div>
  );
}