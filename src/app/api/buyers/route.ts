// /app/api/buyers/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { buyerInputSchema, BuyerInput } from "@/lib/validators/buyer";

// ================= POST: create new buyer =================
export async function POST(req: Request): Promise<NextResponse> {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: unknown = await req.json();
    const parsed = buyerInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.format() }, { status: 400 });
    }

    const data: BuyerInput = parsed.data;

    const buyer = await prisma.buyer.create({
      data: { ...data, ownerId: user.id },
    });

    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: user.id,
        changedAt: new Date(),
        diff: { created: data },
      },
    });

    return NextResponse.json(buyer, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ================= GET: list buyers (SSR) =================
interface GetBuyersQuery {
  page?: string;
  pageSize?: string;
  city?: string;
  propertyType?: string;
  status?: string;
  timeline?: string;
  search?: string;
}

export async function GET(req: Request): Promise<NextResponse> {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const query: GetBuyersQuery = Object.fromEntries(url.searchParams.entries());

  const page = parseInt(query.page ?? "1");
  const pageSize = parseInt(query.pageSize ?? "10");
  const { city, propertyType, status, timeline, search } = query;

  const filters: Record<string, string> = {};
  if (city) filters.city = city;
  if (propertyType) filters.propertyType = propertyType;
  if (status) filters.status = status;
  if (timeline) filters.timeline = timeline;

  const searchFilter = search
    ? {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
        ],
      }
    : undefined;

  const buyers = await prisma.buyer.findMany({
    where: { ...filters, ...searchFilter },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const total = await prisma.buyer.count({
    where: { ...filters, ...searchFilter },
  });

  return NextResponse.json({
    buyers,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
