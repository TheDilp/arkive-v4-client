import { createContext } from "react";

export const AuthContext = createContext<{ tokens: null | { access: string; refresh: string } }>({ tokens: null });
