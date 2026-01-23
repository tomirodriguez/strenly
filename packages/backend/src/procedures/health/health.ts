import { z } from "zod";
import { publicProcedure } from "../../lib/orpc";

const healthOutputSchema = z.object({
	status: z.literal("ok"),
	timestamp: z.string(),
});

/**
 * Health check endpoint
 * Returns status and current timestamp for monitoring
 */
export const health = publicProcedure
	.output(healthOutputSchema)
	.handler(async () => {
		return {
			status: "ok",
			timestamp: new Date().toISOString(),
		};
	});
