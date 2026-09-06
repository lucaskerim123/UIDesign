import { requireAdmin } from '$lib/server/auth';
import { getEngineHubEngine } from '$lib/server/engine-hub';

export async function load({ cookies, params }) {
	const user = await requireAdmin(cookies);
	const engine = await getEngineHubEngine(params.engine);
	return { user, engine };
}
