import { create } from "zustand";

interface UserState {
  id: number;
  username: string;
  token: string;
  avatar: string;
  is_login: boolean;
}

interface UserStore extends UserState {
  login: (
    id: number,
    username: string,
    token: string,
    avatar: string,
    is_login: boolean,
  ) => void;
  logout: () => void;
  updateUser: (updates: Partial<UserState>) => void;
}

const useUserStore = create<UserStore>()((set) => ({
  // initial state
  id: 0,
  username: "",
  token: "",
  avatar: "",
  is_login: false,

  // Actions
  login: (id, username, token, avatar, is_login) =>
    set({ id, username, token, avatar, is_login }),
  logout: () =>
    set({ id: 0, username: "", token: "", avatar: "", is_login: false }),
  updateUser: (updates) => set((state) => ({ ...state, ...updates })),
}));

export default useUserStore;
