import { requireAdmin } from '$lib/server/auth';
import { apexEngineState, apexPolicy } from '$lib/server/apex-cloud';
import { getEngineHubEngine } from '$lib/server/engine-hub';
import { getStudioAdminSettings } from '$lib/server/studio-cloud';
import { getSupabaseAdmin } from '$lib/server/supabase';

export async function load({ cookies, params }) {
	const user = await requireAdmin(cookies);
	const engine = await getEngineHubEngine(params.engine);
	let clients: any[] = [];
	let sessions: any[] = [];
	let connectionDetails: any = null;

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
		connectionDetails = {
			transport: 'https://orbitfsengine.vercel.app/mcp',
			authority: 'https://orbitfs.vercel.app',
			clientCount: clients.length,
			activeSessions: sessions.filter((session: any) => String(session.status || 'active') === 'active').length
		};
	} else if (engine.id === 'apex') {
		const [policy, runtime] = await Promise.all([apexPolicy(user), Promise.resolve(apexEngineState())]);
		connectionDetails = {
			backend: 'Shared Supabase workspace data',
			routing: 'OrbitFS cloud routing engine',
			target: runtime.sorter?.target || 'library-memory',
			processingMode: policy.serviceMode || 'on_demand',
			converterAvailable: runtime.converter?.available === true,
			converterReason: runtime.converter?.reason || null
		};
	} else if (engine.id === 'studio') {
		const studio = await getStudioAdminSettings(user);
		connectionDetails = {
			backend: 'Shared Supabase workspace data',
			routingEngine: studio.routing?.engine || 'orbitfs-base-routing-v2-cloud',
			provider: studio.routing?.provider || 'deterministic',
			semanticProvider: studio.routing?.semanticProvider || null,
			semanticProviderStatus: studio.routing?.semanticProviderStatus || 'not_configured',
			processingMode: studio.processing?.mode || 'serverless',
			requestDriven: studio.processing?.requestDriven !== false,
			storageProvider: studio.storageUsage?.provider || 'supabase'
		};
	}

	return { user, engine, clients, sessions, connectionDetails };
}
