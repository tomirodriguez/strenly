import { neon, neonConfig } from "@neondatabase/serverless";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle } from "drizzle-orm/neon-http";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const LOCAL_PROXY_HOST = "db.localtest.me";

/**
 * Detects if running in local development based on database URL.
 * Local URLs use the special db.localtest.me hostname.
 */
function isLocalDevelopment(databaseUrl: string): boolean {
	return databaseUrl.includes(LOCAL_PROXY_HOST);
}

/**
 * Configures Neon for local development with the neon-proxy.
 * The proxy translates HTTP requests to PostgreSQL protocol.
 *
 * @see https://github.com/TimoWilhelm/local-neon-http-proxy
 */
function configureForLocalDevelopment(): void {
	// Route to local proxy for db.localtest.me, otherwise use Neon's HTTPS endpoint
	neonConfig.fetchEndpoint = (host) => {
		const [protocol, port] = host === LOCAL_PROXY_HOST ? ["http", 4444] : ["https", 443];
		return `${protocol}://${host}:${port}/sql`;
	};
	// Disable secure WebSocket for local development
	neonConfig.useSecureWebSocket = false;
}

/**
 * Database Client Configuration
 *
 * Uses @neondatabase/serverless for all environments:
 * - Production: Connects to Neon cloud via HTTPS
 * - Development: Connects to local PostgreSQL via neon-proxy (port 4444)
 *
 * For local development, use DATABASE_URL with db.localtest.me hostname:
 * DATABASE_URL=postgres://strenly:strenly@db.localtest.me:5432/strenly_dev
 *
 * @param connectionString - Database connection URL
 * @returns Configured Drizzle database client
 */
export const createDb = (connectionString: string) => {
	if (!connectionString) {
		throw new Error("DATABASE_URL is required to create database client");
	}

	if (isLocalDevelopment(connectionString)) {
		configureForLocalDevelopment();
	}

	const sql = neon(connectionString);
	return drizzle({ client: sql, schema });
};

/**
 * Database client type
 * Union type allows both Neon HTTP (production) and postgres.js (testing) clients
 * Both share compatible query builder interfaces
 */
// biome-ignore lint/suspicious/noExplicitAny: Required for database type compatibility between drivers
export type DbClient = NeonHttpDatabase<any> | PostgresJsDatabase<any>;
