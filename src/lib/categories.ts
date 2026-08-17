import { Landmark, Headset, Cog, Users } from "lucide-react";
import type { CategoryKey } from "./types";
import type { LucideIcon } from "lucide-react";

export interface CategoryMeta {
  key: CategoryKey;
  icon: LucideIcon;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "Finance", icon: Landmark },
  { key: "Customer", icon: Headset },
  { key: "Process/Tech", icon: Cog },
  { key: "People", icon: Users },
];