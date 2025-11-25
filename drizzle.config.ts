import "dotenv/config";

export default {
  out: "./drizzle/migrations", // where migrations will be output
  schema: "./drizzle/schema.ts", // your Drizzle schema
  dialect: "postgresql", // DB dialect
  dbCredentials: {
    url: process.env.DATABASE_URL!, // Neon DB URL
  },
  verbose: true, // optional: logs queries during generation
  strict: true, // ensures strict schema parsing
} as const;
