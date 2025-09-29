import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { user, session, account, verification } from "./auth-schema"

export const auth = betterAuth({
    emailAndPassword: { 
        enabled: true, 
    }, 
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: false,
        schema: {
            user: user,
            session: session,
            account: account, 
            verification: verification
        }
    }),
})