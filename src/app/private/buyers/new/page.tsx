"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function NewBuyerPage() {
  const [submitting, setSubmitting] = useState(false);
  const [tagsInput, setTagsInput] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<BuyerInput>({
    resolver: zodResolver(buyerInputSchema),
  });

  const propertyType = watch("propertyType");

  const onSubmitHandler = async (data: BuyerInput) => {
    setSubmitting(true);
    try {
      // Split tagsInput into array
      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const payload = { ...data, tags: tagsArray };
      const res = await fetch("/api/buyers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create buyer");

      alert("Buyer created successfully!");
      setTagsInput("");
    } catch (err) {
      console.error(err);
      alert("Error creating buyer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 md:p-10 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center">
          New Buyer Lead
        </h1>
        <form
          onSubmit={handleSubmit(onSubmitHandler)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Full Name */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 dark:text-gray-200">
              Full Name
            </label>
            <Input
              {...register("fullName")}
              className="dark:bg-gray-700 dark:text-gray-100"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 dark:text-gray-200">
              Email
            </label>
            <Input
              type="email"
              {...register("email")}
              className="dark:bg-gray-700 dark:text-gray-100"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 dark:text-gray-200">
              Phone
            </label>
            <Input
              {...register("phone")}
              className="dark:bg-gray-700 dark:text-gray-100"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* City */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 dark:text-gray-200">
              City
            </label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="dark:bg-gray-700 dark:text-gray-100 w-full">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cityEnum.options.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">
                {errors.city.message}
              </p>
            )}
          </div>

          {/* Property Type */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 dark:text-gray-200">
              Property Type
            </label>
            <Controller
              name="propertyType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="dark:bg-gray-700 dark:text-gray-100 w-full">
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
              )}
            />
            {errors.propertyType && (
              <p className="text-red-500 text-sm mt-1">
                {errors.propertyType.message}
              </p>
            )}
          </div>

          {/* BHK conditional */}
          {["Apartment", "Villa"].includes(propertyType || "") && (
            <div className="flex flex-col">
              <label className="mb-1 text-gray-700 dark:text-gray-200">
                BHK
              </label>
              <Controller
                name="bhk"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="dark:bg-gray-700 dark:text-gray-100 w-full">
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
                )}
              />
              {errors.bhk && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.bhk.message}
                </p>
              )}
            </div>
          )}

          {/* Purpose */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 dark:text-gray-200">
              Purpose
            </label>
            <Controller
              name="purpose"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="dark:bg-gray-700 dark:text-gray-100 w-full">
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
              )}
            />
            {errors.purpose && (
              <p className="text-red-500 text-sm mt-1">
                {errors.purpose.message}
              </p>
            )}
          </div>

          {/* Budget Min */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 dark:text-gray-200">
              Budget Min (INR)
            </label>
            <Input
              type="number"
              {...register("budgetMin", { valueAsNumber: true })}
              className="dark:bg-gray-700 dark:text-gray-100"
            />
            {errors.budgetMin && (
              <p className="text-red-500 text-sm mt-1">
                {errors.budgetMin.message}
              </p>
            )}
          </div>

          {/* Budget Max */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 dark:text-gray-200">
              Budget Max (INR)
            </label>
            <Input
              type="number"
              {...register("budgetMax", { valueAsNumber: true })}
              className="dark:bg-gray-700 dark:text-gray-100"
            />
            {errors.budgetMax && (
              <p className="text-red-500 text-sm mt-1">
                {errors.budgetMax.message}
              </p>
            )}
          </div>

          {/* Timeline */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 dark:text-gray-200">
              Timeline
            </label>
            <Controller
              name="timeline"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="dark:bg-gray-700 dark:text-gray-100 w-full">
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
              )}
            />
            {errors.timeline && (
              <p className="text-red-500 text-sm mt-1">
                {errors.timeline.message}
              </p>
            )}
          </div>

          {/* Source */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 dark:text-gray-200">
              Source
            </label>
            <Controller
              name="source"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="dark:bg-gray-700 dark:text-gray-100 w-full">
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
              )}
            />
            {errors.source && (
              <p className="text-red-500 text-sm mt-1">
                {errors.source.message}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-gray-700 dark:text-gray-200">
              Tags (comma separated)
            </label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g., VIP,High Priority,Follow-up"
              className="dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 text-gray-700 dark:text-gray-200">
              Notes
            </label>
            <Textarea
              {...register("notes")}
              className="dark:bg-gray-700 dark:text-gray-100"
            />
            {errors.notes && (
              <p className="text-red-500 text-sm mt-1">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Create Buyer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
