"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  buyerInputSchema,
  BuyerInput,
  cityEnum,
  propertyTypeEnum,
  bhkEnum,
  purposeEnum,
  timelineEnum,
  sourceEnum,
} from "@/lib/validators/buyer";

interface BuyerHistoryEntry {
  id: string;
  changedBy: string;
  changedAt: string;
  diff: Record<string, any>;
}

interface BuyerWithMeta extends BuyerInput {
  updatedAt: string;
  tags?: string[];
}

export default function BuyerDetailPage() {
  const { id } = useParams() as { id: string };
  const [buyer, setBuyer] = useState<BuyerWithMeta | null>(null);
  const [history, setHistory] = useState<BuyerHistoryEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [tagsInput, setTagsInput] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BuyerInput>({
    resolver: zodResolver(buyerInputSchema),
  });

  const propertyType = watch("propertyType");

  // Fetch buyer and last 5 history entries
  const fetchBuyer = async () => {
    try {
      const res = await fetch(`/api/buyers/${id}`);
      if (!res.ok) throw new Error("Failed to fetch buyer");
      const data = await res.json();
      setBuyer(data.buyer);
      setTagsInput(data.buyer.tags?.join(",") || "");

      // Populate form fields
      Object.entries(data.buyer).forEach(([key, value]) => {
        setValue(key as keyof BuyerInput, value);
      });

      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch buyer data");
    }
  };

  useEffect(() => {
    if (id) fetchBuyer();
  }, [id]);

  const onSubmit: SubmitHandler<BuyerInput> = async (formData) => {
    if (!buyer) return;
    setSubmitting(true);
    try {
      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = { ...formData, tags: tagsArray, updatedAt: buyer.updatedAt };

      const res = await fetch(`/api/buyers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 409) alert("Record changed by someone else. Please refresh.");
        else alert(result.error || "Error updating buyer");
      } else {
        alert("Buyer updated successfully!");
        fetchBuyer();
      }
    } catch (err) {
      console.error(err);
      alert("Error updating buyer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">View / Edit Buyer</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div>
          <label>Full Name</label>
          <Input {...register("fullName")} />
          {errors.fullName && <p className="text-red-500">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label>Email</label>
          <Input type="email" {...register("email")} />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label>Phone</label>
          <Input {...register("phone")} />
          {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
        </div>

        {/* City */}
        <div>
          <label>City</label>
          <Select {...register("city")}>
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {cityEnum.options.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && <p className="text-red-500">{errors.city.message}</p>}
        </div>

        {/* Property Type */}
        <div>
          <label>Property Type</label>
          <Select {...register("propertyType")}>
            <SelectTrigger>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypeEnum.options.map((pt) => (
                <SelectItem key={pt} value={pt}>
                  {pt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.propertyType && <p className="text-red-500">{errors.propertyType.message}</p>}
        </div>

        {/* BHK (conditional) */}
        {["Apartment", "Villa"].includes(propertyType || "") && (
          <div>
            <label>BHK</label>
            <Select {...register("bhk")}>
              <SelectTrigger>
                <SelectValue placeholder="Select BHK" />
              </SelectTrigger>
              <SelectContent>
                {bhkEnum.options.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bhk && <p className="text-red-500">{errors.bhk.message}</p>}
          </div>
        )}

        {/* Purpose */}
        <div>
          <label>Purpose</label>
          <Select {...register("purpose")}>
            <SelectTrigger>
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              {purposeEnum.options.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.purpose && <p className="text-red-500">{errors.purpose.message}</p>}
        </div>

        {/* Budget Min */}
        <div>
          <label>Budget Min (INR)</label>
          <Input type="number" {...register("budgetMin", { valueAsNumber: true })} />
          {errors.budgetMin && <p className="text-red-500">{errors.budgetMin.message}</p>}
        </div>

        {/* Budget Max */}
        <div>
          <label>Budget Max (INR)</label>
          <Input type="number" {...register("budgetMax", { valueAsNumber: true })} />
          {errors.budgetMax && <p className="text-red-500">{errors.budgetMax.message}</p>}
        </div>

        {/* Timeline */}
        <div>
          <label>Timeline</label>
          <Select {...register("timeline")}>
            <SelectTrigger>
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              {timelineEnum.options.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.timeline && <p className="text-red-500">{errors.timeline.message}</p>}
        </div>

        {/* Source */}
        <div>
          <label>Source</label>
          <Select {...register("source")}>
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {sourceEnum.options.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.source && <p className="text-red-500">{errors.source.message}</p>}
        </div>

        {/* Tags */}
        <div>
          <label>Tags (comma separated)</label>
          <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
        </div>

        {/* Notes */}
        <div>
          <label>Notes</label>
          <Textarea {...register("notes")} />
          {errors.notes && <p className="text-red-500">{errors.notes.message}</p>}
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      {/* Buyer History */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Last 5 Changes</h2>
        {history.length === 0 ? (
          <p>No changes yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="p-2 border rounded dark:border-gray-600">
                <div>
                  <strong>{new Date(h.changedAt).toLocaleString()}</strong> by {h.changedBy}
                </div>
                <pre className="text-sm">{JSON.stringify(h.diff, null, 2)}</pre>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
