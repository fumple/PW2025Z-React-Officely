import { create } from "zustand";
import { apiFetchRel } from "../api/client";

export type ApiFilterGroup = {
  key: string;
  label: string;
  elements: ApiFilterElement[];
};

export type ApiFilterElement =
  | {
      key: string;
      label: string;
      type: "flags";
      flags: { key: string; label: string }[];
    }
  | {
      key: string;
      label: string;
      type: "integer";
      min: number;
      max: number;
    };

type FiltersState = {
  filterGroups: ApiFilterGroup[];
  loading: boolean;
  error: string | null;

  loadFilters: () => Promise<void>;
};

export const useFiltersStore = create<FiltersState>((set) => ({
  filterGroups: [],
  loading: false,
  error: null,

  loadFilters: async () => {
    set({ loading: true, error: null });

    try {
      const res = await apiFetchRel("/filters", {
        method: "GET",
      });
      const groups = Array.isArray(res?.filters) ? res.filters : [];
      set({ filterGroups: groups, loading: false });
    } catch (e: any) {
      set({
        loading: false,
        error: e?.body?.message ?? "Failed to load filters",
      });
    }
  },
}));
