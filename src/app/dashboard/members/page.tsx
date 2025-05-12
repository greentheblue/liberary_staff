import { Metadata } from 'next';
import Link from 'next/link';
import MemberList from '@/components/members/member-list';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Members - Member Management System',
  description: 'View and manage organization members',
};

export default function MembersPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all organization members
          </p>
        </div>
        
        <Link href="/members/add">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add New Member
          </Button>
        </Link>
      </div>
      
      <MemberList />
    </div>
  );
}