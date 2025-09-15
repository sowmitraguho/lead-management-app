import { z } from "zod";

// enums
export const propertyTypeEnum = z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]);
export const bhkEnum = z.enum(["1","2","3","4","Studio"]);
export const purposeEnum = z.enum(["Buy","Rent"]);
export const cityEnum = z.enum(["Chandigarh","Mohali","Zirakpur","Panchkula","Other"]);
export const timelineEnum = z.enum(["0-3m","3-6m",">6m","Exploring"]);
export const sourceEnum = z.enum(["Website","Referral","Walk-in","Call","Other"]);
export const statusEnum = z.enum(["New","Qualified","Contacted","Visited","Negotiation","Converted","Dropped"]);

export const buyerInputSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\d{10,15}$/),
  city: cityEnum,
  propertyType: propertyTypeEnum,
  bhk: bhkEnum.optional(),
  purpose: purposeEnum,
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
  timeline: timelineEnum,
  source: sourceEnum,
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  status: statusEnum.optional()
}).superRefine((data, ctx) => {
  // bhk required for Apartment/Villa
  if ((data.propertyType === "Apartment" || data.propertyType === "Villa") && !data.bhk) {
    ctx.addIssue({
      path: ["bhk"],
      code: z.ZodIssueCode.custom,
      message: "BHK is required for Apartment or Villa"
    });
  }
  // budgetMax >= budgetMin
  if (data.budgetMin && data.budgetMax && data.budgetMax < data.budgetMin) {
    ctx.addIssue({
      path: ["budgetMax"],
      code: z.ZodIssueCode.custom,
      message: "budgetMax must be >= budgetMin"
    });
  }
});

export type BuyerInput = z.infer<typeof buyerInputSchema>;