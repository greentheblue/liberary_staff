import { NextRequest, NextResponse } from "next/server";
import { entityPrisma } from "@/lib/db";
import { auth } from "@/auth";
import { hash } from "bcryptjs";

// Define the Staff type since we're using a custom Prisma client
type Staff = {
  id: string;
  name: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  entityId: string;
  createdAt: Date;
  updatedAt: Date;
  pasword?: string | null;
};

type StaffWithoutPassword = Omit<Staff, 'pasword'> & {
  gender: string;
};

// Helper function to normalize staff data
function normalizeStaffData(staff: Staff): StaffWithoutPassword {
  // Destructure and omit the password from the staff data
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pasword, ...staffWithoutPassword } = staff;
  
  // Ensure gender is always in uppercase format for consistency
  return {
    ...staffWithoutPassword,
    gender: staffWithoutPassword.gender?.toUpperCase() || 'MALE'
  };
}

// Get current staff profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the staff ID from the auth session
    const staffId = session.user.id;

    // Find staff with matching ID from the session
    const staff = await entityPrisma.staff.findFirst({
      where: {
        id: staffId,
        entityId: session.user.entityId as string,
      },
    });    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Return normalized staff details
    return NextResponse.json(normalizeStaffData(staff));
  } catch (error) {
    console.error("Error fetching staff profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff profile" },
      { status: 500 }
    );
  }
}

// Update current staff profile
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the staff ID from the auth session
    const staffId = session.user.id;
    const body = await req.json();

    // Validate that the staff exists
    const existingStaff = await entityPrisma.staff.findFirst({
      where: {
        id: staffId,
        entityId: session.user.entityId as string,
      },
    });    if (!existingStaff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }
    
    // Prepare update data
    type StaffUpdateData = {
      name?: string;
      gender?: string;
      phone?: string;
      email?: string;
      address?: string;
      pasword?: string;
    };
    
    const updateData: StaffUpdateData = {};
      // Only update fields that are provided
    if (body.name !== undefined) updateData.name = body.name;
    if (body.gender !== undefined) updateData.gender = body.gender.toUpperCase();
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.address !== undefined) updateData.address = body.address;
    
    // Hash password if provided
    if (body.password && body.password.trim() !== "") {
      updateData.pasword = await hash(body.password, 10);
    }
    
    // Update staff
    const updatedStaff = await entityPrisma.staff.update({
      where: { id: staffId },
      data: updateData,
    });

    // Return normalized staff details
    return NextResponse.json(normalizeStaffData(updatedStaff));
  } catch (error) {
    console.error("Error updating staff profile:", error);
    return NextResponse.json(
      { error: "Failed to update staff profile" },
      { status: 500 }
    );
  }
}
