
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import Papa from "papaparse";
import type { Buyer } from "@prisma/client";

interface BuyerFilters {
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
  const filters: BuyerFilters = {
    city: url.searchParams.get("city") ?? undefined,
    propertyType: url.searchParams.get("propertyType") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    timeline: url.searchParams.get("timeline") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
  };

  // Build Prisma where object
  const where: Parameters<typeof prisma.buyer.findMany>[0]["where"] = {};
  if (filters.city) where.city = filters.city;
  if (filters.propertyType) where.propertyType = filters.propertyType;
  if (filters.status) where.status = filters.status;
  if (filters.timeline) where.timeline = filters.timeline;
  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  // Fetch buyers
  const buyers: Buyer[] = await prisma.buyer.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  // Convert to CSV
  const csv = Papa.unparse(
    buyers.map((b) => ({
      fullName: b.fullName,
      email: b.email,
      phone: b.phone,
      city: b.city,
      propertyType: b.propertyType,
      bhk: b.bhk,
      purpose: b.purpose,
      budgetMin: b.budgetMin,
      budgetMax: b.budgetMax,
      timeline: b.timeline,
      source: b.source,
      notes: b.notes,
      tags: b.tags?.join(","),
      status: b.status,
    }))
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=buyers.csv",
    },
  });
}
