"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import useDebounce from "@/lib/hooks/useDebounce"; 
import { cityEnum, propertyTypeEnum, statusEnum, timelineEnum } from "@/lib/validators/buyer";

interface Buyer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  city: string;
  propertyType: string;
  budgetMin?: number;
  budgetMax?: number;
  timeline: string;
  status: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ city: "", propertyType: "", status: "", timeline: "" });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [loading, setLoading] = useState(false);

  const fetchBuyers = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: pagination.page.toString(),
      pageSize: pagination.pageSize.toString(),
      ...filters,
      search: debouncedSearch,
    });
    const res = await fetch(`/api/buyers?${params}`);
    const data = await res.json();
    setBuyers(data.buyers);
    setPagination(data.pagination);
    setLoading(false);
  };

  useEffect(() => {
    fetchBuyers();
  }, [filters, pagination.page, debouncedSearch]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <Input
          placeholder="Search by name, email, or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 dark:bg-gray-700 dark:text-gray-100"
        />
        <Select onValueChange={(val) => setFilters(f => ({ ...f, city: val }))}>
          <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
          <SelectContent>{cityEnum.options.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select onValueChange={(val) => setFilters(f => ({ ...f, propertyType: val }))}>
          <SelectTrigger><SelectValue placeholder="Property Type" /></SelectTrigger>
          <SelectContent>{propertyTypeEnum.options.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
        <Select onValueChange={(val) => setFilters(f => ({ ...f, status: val }))}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>{statusEnum.options.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select onValueChange={(val) => setFilters(f => ({ ...f, timeline: val }))}>
          <SelectTrigger><SelectValue placeholder="Timeline" /></SelectTrigger>
          <SelectContent>{timelineEnum.options.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={() => setPagination(p => ({ ...p, page: 1 }))}>Filter</Button>
      </div>

      {loading ? (
        <p>Loading buyers...</p>
      ) : buyers.length === 0 ? (
        <p>No buyers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Phone</th>
                <th className="border px-2 py-1">City</th>
                <th className="border px-2 py-1">Property</th>
                <th className="border px-2 py-1">Budget (min–max)</th>
                <th className="border px-2 py-1">Timeline</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Updated At</th>
                <th className="border px-2 py-1">Action</th>
              </tr>
            </thead>
            <tbody>
              {buyers.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="border px-2 py-1">{b.fullName}</td>
                  <td className="border px-2 py-1">{b.phone}</td>
                  <td className="border px-2 py-1">{b.city}</td>
                  <td className="border px-2 py-1">{b.propertyType}</td>
                  <td className="border px-2 py-1">{b.budgetMin ?? "-"} – {b.budgetMax ?? "-"}</td>
                  <td className="border px-2 py-1">{b.timeline}</td>
                  <td className="border px-2 py-1">{b.status}</td>
                  <td className="border px-2 py-1">{new Date(b.updatedAt).toLocaleString()}</td>
                  <td className="border px-2 py-1">
                    <Link href={`/buyers/${b.id}`} className="text-blue-600 dark:text-blue-400">View / Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center space-x-2 mt-4">
        <Button
          disabled={pagination.page <= 1}
          onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
        >
          Prev
        </Button>
        <span className="flex items-center">{pagination.page} / {pagination.totalPages}</span>
        <Button
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
