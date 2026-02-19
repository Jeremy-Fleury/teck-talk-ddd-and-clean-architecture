import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// biome-ignore lint/style/noDefaultExport: Config expected by Prisma
export default defineConfig({
	datasource: {
		url: env('DATABASE_URL'),
	},
	migrations: {
		path: 'prisma/migrations',
	},
	schema: 'prisma/schema',
});
