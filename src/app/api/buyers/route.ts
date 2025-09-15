// /app/api/buyers/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { buyerInputSchema, BuyerInput } from "@/lib/validators/buyer";

// ================= POST: create new buyer =================
export async function POST(req: Request): Promise<NextResponse> {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await req.json();
  const parsed = buyerInputSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ errors: parsed.error.format() }, { status: 400 });

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
}

// ================= GET: list buyers (SSR) =================
export async function GET(req: Request): Promise<NextResponse> {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
  const city = url.searchParams.get("city") || undefined;
  const propertyType = url.searchParams.get("propertyType") || undefined;
  const status = url.searchParams.get("status") || undefined;
  const timeline = url.searchParams.get("timeline") || undefined;
  const search = url.searchParams.get("search") || undefined;

  const filters: any = {};
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
    : {};

  const buyers = await prisma.buyer.findMany({
    where: { ...filters, ...searchFilter },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const total = await prisma.buyer.count({ where: { ...filters, ...searchFilter } });

  return NextResponse.json({
    buyers,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}
