import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerUser } from "@/lib/auth";
import { buyerInputSchema, BuyerInput } from "@/lib/validators/buyer";
import Papa from "papaparse";

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const text = await file.text();

  const parsed = Papa.parse<Partial<BuyerInput>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.data.length > 200)
    return NextResponse.json({ error: "Max 200 rows allowed" }, { status: 400 });

  const errors: { row: number; message: string }[] = [];
  const validRows: BuyerInput[] = [];

  parsed.data.forEach((row, idx) => {
    const result = buyerInputSchema.safeParse(row);
    if (!result.success) {
      errors.push({ row: idx + 2, message: JSON.stringify(result.error.format()) }); // +2 for header
    } else {
      validRows.push(result.data);
    }
  });

  if (validRows.length === 0)
    return NextResponse.json({ error: "No valid rows", errors }, { status: 400 });

  // Insert valid rows in a transaction
  try {
    await prisma.$transaction(async (tx) => {
      for (const row of validRows) {
        const buyer = await tx.buyer.create({
          data: { ...row, ownerId: user.id },
        });
        await tx.buyerHistory.create({
          data: {
            buyerId: buyer.id,
            changedBy: user.id,
            changedAt: new Date(),
            diff: { created: row },
          },
        });
      }
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to insert rows", details: err }, { status: 500 });
  }

  return NextResponse.json({ inserted: validRows.length, errors });
}
