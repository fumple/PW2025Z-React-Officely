// store.ts
import { create } from "zustand";
import { combine } from "zustand/middleware";

interface User {
  name: string;
}

// Define types for state & actions
interface StoreState {
  user: User | null;
}
interface StoreActions {
  logIn: () => void;
  logOut: () => void;
}
type Store = StoreState & StoreActions;

// Create store using the curried form of `create`
export const useStore = create<Store>()(
  combine(
    {
      user: null,
    } as StoreState,
    (set) => ({
      logIn: () => set({ user: { name: "Example User" } }),
      logOut: () => set({ user: null }),
    }),
  ),
);
