import { z } from "zod";
import { planSchema } from "./plan";

/**
 * Subscription status schema
 * Tracks the state of an organization's subscription
 */
export const subscriptionStatusSchema = z.enum(["active", "canceled", "past_due"]);

export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

/**
 * Subscription schema
 * Links organizations to their subscription plans
 */
export const subscriptionSchema = z.object({
	id: z.string(),
	organizationId: z.string(),
	plan: planSchema,
	status: subscriptionStatusSchema,
	athleteCount: z.number(),
	athleteLimit: z.number(), // denormalized from plan for convenience
	currentPeriodStart: z.string(),
	currentPeriodEnd: z.string(),
	createdAt: z.string(),
});

export type Subscription = z.infer<typeof subscriptionSchema>;
