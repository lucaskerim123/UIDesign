import { requireAdmin } from '$lib/server/auth';
import { getEngineHubEngine } from '$lib/server/engine-hub';
import { getSupabaseAdmin } from '$lib/server/supabase';

export async function load({ cookies, params }) {
	const user = await requireAdmin(cookies);
	const engine = await getEngineHubEngine(params.engine);
	let clients: any[] = [];
	let sessions: any[] = [];

	if (engine.id === 'mcp') {
		const db = getSupabaseAdmin();
		const [clientResult, sessionResult] = await Promise.all([
			db.from('mcp_clients')
				.select('id,client_name,status,permissions,workspace_ids,first_seen_at,last_seen_at')
				.order('client_name')
				.limit(100),
			db.from('mcp_sessions')
				.select('id,client_id,user_id,username,workspace_id,provider,status,request_count,connected_at,last_seen_at')
				.order('last_seen_at', { ascending: false })
				.limit(100)
		]);
		if (clientResult.error) throw clientResult.error;
		if (sessionResult.error) throw sessionResult.error;
		clients = clientResult.data || [];
		sessions = sessionResult.data || [];
	}

	return { user, engine, clients, sessions };
}
