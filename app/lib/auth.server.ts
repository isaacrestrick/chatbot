import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db.server";
import { user, session, account, verification } from "./schemas/auth-schema.server.js"

export const auth = betterAuth({
    socialProviders: {
        google: { 
            prompt: "select_account", 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
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