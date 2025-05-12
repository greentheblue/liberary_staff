"use client"

import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getSession } from '@/lib/session';
import { Search, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Member = {
  id: string;
  name: string;
  memberType: string;
  gender: string;
  phoneNumber: string;
  address: string;
  class?: string;
  division?: string;
  createdAt: string;
};

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSchool, setIsSchool] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const router = useRouter();
  
  const itemsPerPage = 10;

  useEffect(() => {
    try {
      const session = getSession();
      setIsSchool(session?.entity_type === 'school');
    } catch (error) {
      console.error('Error getting session:', error);
    }
  }, []);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch('/api/members');
        
        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }
        
        const data = await response.json();
        setMembers(data);
        setFilteredMembers(data);
      } catch (error) {
        console.error('Error fetching members:', error);
        toast({
          title: 'Error',
          description: 'Failed to load members. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchMembers();
  }, [toast]);

  useEffect(() => {
    let result = [...members];
    
    if (searchTerm) {
      result = result.filter(
        (member) => 
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.phoneNumber.includes(searchTerm)
      );
    }
    
    if (typeFilter) {
      result = result.filter(
        (member) => member.memberType === typeFilter
      );
    }
    
    setFilteredMembers(result);
    setCurrentPage(1);
  }, [searchTerm, typeFilter, members]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredMembers.length);
  const currentMembers = filteredMembers.slice(startIndex, endIndex);

  const formatMemberType = (type: string) => {
    if (!type) return '';
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  const handleEdit = (memberId: string) => {
    router.push(`/dashboard/members/edit/${memberId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-5 w-[100px]" /></TableHead>
                <TableHead><Skeleton className="h-5 w-[80px]" /></TableHead>
                <TableHead><Skeleton className="h-5 w-[80px]" /></TableHead>
                <TableHead><Skeleton className="h-5 w-[120px]" /></TableHead>
                <TableHead><Skeleton className="h-5 w-[150px]" /></TableHead>
                {isSchool && (
                  <>
                    <TableHead><Skeleton className="h-5 w-[80px]" /></TableHead>
                    <TableHead><Skeleton className="h-5 w-[80px]" /></TableHead>
                  </>
                )}
                <TableHead><Skeleton className="h-5 w-[80px]" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-5 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-[180px]" /></TableCell>
                  {isSchool && (
                    <>
                      <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
                    </>
                  )}
                  <TableCell><Skeleton className="h-5 w-[60px]" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex justify-center mt-4">
          <Skeleton className="h-10 w-[300px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select
          value={typeFilter}
          onValueChange={setTypeFilter}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
            <SelectItem value="YOUTH">Youth</SelectItem>
            <SelectItem value="ADULT">Adult</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              {isSchool && (
                <>
                  <TableHead>Class</TableHead>
                  <TableHead>Division</TableHead>
                </>
              )}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentMembers.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={isSchool ? 8 : 6} 
                  className="text-center py-10 text-muted-foreground"
                >
                  No members found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            ) : (
              currentMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{formatMemberType(member.memberType)}</TableCell>
                  <TableCell>{formatMemberType(member.gender)}</TableCell>
                  <TableCell>{member.phoneNumber}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={member.address}>
                    {member.address}
                  </TableCell>
                  {isSchool && (
                    <>
                      <TableCell>{member.class || "-"}</TableCell>
                      <TableCell>{member.division || "-"}</TableCell>
                    </>
                  )}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(member.id)}
                      title="Edit member"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {filteredMembers.length > 0 && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              
              if (totalPages <= 5 || currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(pageNum)}
                    isActive={currentPage === pageNum}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                aria-disabled={currentPage === totalPages}
                className={`${
                  currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                }`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}