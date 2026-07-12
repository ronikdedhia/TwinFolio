import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";

// One row per Clerk user — the customer's current wealth-planning profile.
export const profiles = sqliteTable("profiles", {
  userId: text("user_id").primaryKey(), // Clerk user id
  currentSavings: real("current_savings").notNull().default(0),
  monthlyContribution: real("monthly_contribution").notNull().default(0),
  years: integer("years").notNull().default(10),
  goalAmount: real("goal_amount").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
