"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/mock-data";
import type { CategoryKey } from "@/lib/types";

export function AddAdHocTaskForm({
  onSave,
  onCancel,
}: {
  onSave: (data: { desc: string; category: CategoryKey; kpi: string }) => void;
  onCancel: () => void;
}) {
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<CategoryKey>(CATEGORIES[0].key);
  const [kpi, setKpi] = useState("");

  const handleSave = () => {
    if (!desc.trim()) return;
    onSave({ desc: desc.trim(), category, kpi: kpi.trim() || "—" });
    setDesc("");
    setKpi("");
    setCategory(CATEGORIES[0].key);
  };

  return (
    <div className="rounded-xl border border-[#16233F] bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-[#16233F]">New ad-hoc task</h3>
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2]">
            Description
          </Label>
          <Input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What needs to be done?"
          />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2]">
            Category
          </Label>
          <Select value={category} onValueChange={(v) => setCategory(v as CategoryKey)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.key} value={cat.key}>
                  {cat.key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3">
          <Label className="mb-1.5 block text-xs uppercase tracking-wider text-[#9AA3B2]">
            KPI reference (optional)
          </Label>
          <Input
            value={kpi}
            onChange={(e) => setKpi(e.target.value)}
            placeholder="e.g. Ledger Accuracy %"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 text-white">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-[#16233F] hover:bg-[#0F1A30]">
          Save task
        </Button>
      </div>
    </div>
  );
}
