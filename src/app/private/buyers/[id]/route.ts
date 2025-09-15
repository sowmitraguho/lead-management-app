import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { buyerInputSchema, BuyerInput } from "@/lib/validators/buyer";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;
  const body: unknown = await req.json();

  // Validate input
  const parsed = buyerInputSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ errors: parsed.error.format() }, { status: 400 });

  const data: BuyerInput & { updatedAt: string } = parsed.data as any;

  // Fetch current buyer
  const existingBuyer = await prisma.buyer.findUnique({ where: { id } });
  if (!existingBuyer) return NextResponse.json({ error: "Buyer not found" }, { status: 404 });

  // Ownership check
  if (existingBuyer.ownerId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Concurrency check
  if (new Date(existingBuyer.updatedAt).getTime() !== new Date(data.updatedAt).getTime()) {
    return NextResponse.json({ error: "Record has changed. Please refresh." }, { status: 409 });
  }

  // Update buyer
  const updatedBuyer = await prisma.buyer.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });

  // Create buyer_history entry
  const diff: Record<string, any> = {};
  Object.keys(data).forEach(key => {
    if ((existingBuyer as any)[key] !== (data as any)[key]) {
      diff[key] = { from: (existingBuyer as any)[key], to: (data as any)[key] };
    }
  });

  await prisma.buyerHistory.create({
    data: {
      buyerId: id,
      changedBy: user.id,
      changedAt: new Date(),
      diff,
    },
  });

  return NextResponse.json(updatedBuyer);
}