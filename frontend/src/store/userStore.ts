import { create } from "zustand";

interface UserState {
  id: number;
  username: string;
  token: string;
  avatar: string;
  is_login: boolean;
  createTime: string;
}

interface UserStore extends UserState {
  login: (
    id: number,
    username: string,
    token: string,
    avatar: string,
    is_login: boolean,
    createTime: string,
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
  createTime: "",
  // Actions
  login: (id, username, token, avatar, is_login, createTime) =>
    set({ id, username, token, avatar, is_login, createTime }),
  logout: () =>
    set({ id: 0, username: "", token: "", avatar: "", is_login: false, createTime: "" }),
  updateUser: (updates) => set((state) => ({ ...state, ...updates })),
}));

export default useUserStore;
