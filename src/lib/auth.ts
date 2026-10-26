import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error(
    "MONGODB_URI is not set. Add it to .env.local (mongod or Atlas connection string).",
  );
}

const client = new MongoClient(mongoUri);
/** Shared auth app database ("wanderlust"). Server code only. */
export const db = client.db("wanderlust");

export const auth = betterAuth({  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,

  database: mongodbAdapter(db, {
    client,
    // Standalone local MongoDB can't run multi-document transactions; flip
    // this to true if you point MONGODB_URI at a replica set or Atlas.
    transaction: false,
  }),

  // Email + password signup/signin. Social OAuth providers can be added
  // here (socialProviders) once app credentials exist.
  emailAndPassword: {
    enabled: true,
  },
});
