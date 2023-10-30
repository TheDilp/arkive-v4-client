import { StytchUIClient } from "@stytch/vanilla-js";

export const authClient = new StytchUIClient(import.meta.env.VITE_STYTCH_TOKEN);
