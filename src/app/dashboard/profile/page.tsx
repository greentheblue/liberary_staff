'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StaffProfileForm } from '@/components/forms/staff-profile-form';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Building,
} from 'lucide-react';

// Define proper types for Staff and Entity
interface Staff {
  id: string;
  name: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

interface Entity {
  id: string;
  name: string;
  address?: string;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Define type for profile update data
interface ProfileUpdateData {
  name?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
}

// Helper function to normalize gender display
const normalizeGender = (gender: string | undefined | null): string => {
  if (!gender) return 'N/A';
  
  const normalizedGender = gender.toUpperCase();
  if (normalizedGender === 'MALE') return 'Male';
  if (normalizedGender === 'FEMALE') return 'Female';
  if (normalizedGender === 'OTHER') return 'Other';
  return 'N/A';
};

// Helper function to check gender type
const isGenderType = (gender: string | undefined | null, type: 'MALE' | 'FEMALE' | 'OTHER'): boolean => {
  if (!gender) return false;
  return gender.toUpperCase() === type;
};

export default function ProfilePage() {
  const [staff, setStaff] = useState<Staff | null>(null);
  const [entity, setEntity] = useState<Entity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch staff details 
  useEffect(() => {
    const fetchStaffDetails = async () => {
      try {
        setLoading(true);          // Fetch staff details - API will identify staff from the session
        const staffResponse = await fetch('/api/staff/profile');
        if (staffResponse.ok) {
          const staffData = await staffResponse.json();
          setStaff(staffData as Staff);
        } else {
          const errorData = await staffResponse.json();
          toast({
            title: 'Error',
            description: errorData.error || 'Failed to fetch staff details',
            variant: 'destructive',
          });
        }
        
        // Fetch entity details
        const entityResponse = await fetch('/api/entity-info');
        if (entityResponse.ok) {
          const entityData = await entityResponse.json();
          setEntity(entityData as Entity);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while loading your profile',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStaffDetails();
  }, []);
  // Handle profile update
  const handleUpdateProfile = async (updatedData: ProfileUpdateData) => {
    try {
      const response = await fetch('/api/staff/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      
      if (response.ok) {
        const updatedStaff = await response.json();
        setStaff(updatedStaff);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    }).format(date);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px] rounded-lg" />
          <Skeleton className="h-[300px] rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <Button 
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Personal Info Card */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{staff?.name || 'N/A'}</p>
              </div>
            </div>              <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                {isGenderType(staff?.gender, 'MALE') ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="10" r="7"></circle>
                    <path d="M12 17v7"></path>
                    <path d="M8 21h8"></path>
                  </svg>
                ) : isGenderType(staff?.gender, 'FEMALE') ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="10" r="7"></circle>
                    <path d="M12 17v7"></path>
                    <path d="M9 24h6"></path>
                    <path d="M12 21v-1"></path>
                  </svg>
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{normalizeGender(staff?.gender)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info Card */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How to reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{staff?.phone || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{staff?.email || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{staff?.address || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card className="col-span-1 md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your library system details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Library</p>
                <p className="font-medium">{entity?.name || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Staff Member Since</p>
                <p className="font-medium">
                  {staff?.createdAt ? formatDate(staff.createdAt) : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>      {/* Edit Profile Dialog */}
      {staff && (
        <StaffProfileForm
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          staffData={staff}
          onUpdate={handleUpdateProfile}
        />
      )}
    </div>
  );
}
