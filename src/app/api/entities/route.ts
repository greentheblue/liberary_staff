import { NextResponse } from "next/server";
import { entityPrisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const searchType = searchParams.get("type") || "name";
    const limit = 10;
    const offset = (page - 1) * limit;

    const where = search
      ? {
          [searchType === "id" ? "id" : "name"]: {
            contains: search,
            mode: "insensitive",
          },
        }
      : {};

    const [entities, total] = await Promise.all([
      entityPrisma.entity.findMany({
        where,
        include: {
          headPerson: true,
          contactPerson: true,
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: "desc",
        },
      }),
      entityPrisma.entity.count({ where }),
    ]);

    return NextResponse.json({
      entities,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching entities:", error);
    return NextResponse.json(
      { error: "Failed to fetch entities" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const entity = await entityPrisma.entity.create({
      data: {
        name: body.entityName,
        address: body.entityAddress,
        type: body.entityType,
        headPerson: {
          create: {
            name: body.headPersonName,
            phone: body.headPersonPhone || null,
            address: body.headPersonAddress || null,
          },
        },
        contactPerson: {
          create: {
            name: body.contactPersonName,
            phone: body.contactPersonPhone,
            address: body.contactPersonAddress,
          },
        },
      },
    });

    return NextResponse.json(entity);
  } catch (error) {
    console.error("Error creating entity:", error);
    return NextResponse.json(
      { error: "Failed to create entity" },
      { status: 500 }
    );
  }
}
