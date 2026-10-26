import { createAuthClient } from "better-auth/react";

// No baseURL needed on the client — the browser infers it from the current
// origin, which matches BETTER_AUTH_URL in development.
export const authClient = createAuthClient();
