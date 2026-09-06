import { requireAdmin } from '$lib/server/auth';
import { getEngineReadiness } from '$lib/server/engine-readiness';
import { getSupabaseAdmin } from '$lib/server/supabase';

export async function load({ cookies, params }) {
	const user = await requireAdmin(cookies);
	const readiness = await getEngineReadiness(params.engine);
	const engine: any = readiness.engine;
	const metrics: Record<string, any> = {
		engineState: engine.engineState,
		setupState: engine.setupState,
		lastRequestAt: engine.state?.lastRequestAt || null,
		lastControlAt: engine.state?.lastControlAt || null,
		lastSyncAt: engine.lastSyncAt || null,
		generation: engine.state?.generation || 1
	};

	if (engine.id === 'mcp') {
		const db = getSupabaseAdmin();
		const [clientsResult, sessionsResult, tokensResult, auditResult] = await Promise.all([
			db.from('mcp_clients').select('id,status,last_seen_at').limit(250),
			db.from('mcp_sessions').select('id,status,request_count,last_seen_at').limit(500),
			db.from('mcp_oauth_tokens').select('client_id,expires_at,revoked_at,last_used_at').limit(500),
			db.from('mcp_audit_log').select('id,created_at').order('created_at',{ascending:false}).limit(500)
		]);
		if (clientsResult.error) throw clientsResult.error;
		if (sessionsResult.error) throw sessionsResult.error;
		if (tokensResult.error) throw tokensResult.error;
		if (auditResult.error) throw auditResult.error;
		const clients = clientsResult.data || [];
		const sessions = sessionsResult.data || [];
		const tokens = tokensResult.data || [];
		const audits = auditResult.data || [];
		const now = Date.now();
		const dayAgo = now - 24 * 60 * 60 * 1000;
		metrics.clients = clients.length;
		metrics.activeClients = clients.filter((row:any)=>String(row.status)==='active').length;
		metrics.activeSessions = sessions.filter((row:any)=>String(row.status)==='active').length;
		metrics.totalRequests = sessions.reduce((sum:number,row:any)=>sum+Number(row.request_count||0),0);
		metrics.oauthActive = tokens.filter((row:any)=>!row.revoked_at && new Date(row.expires_at).getTime()>now).length;
		metrics.auditEvents24h = audits.filter((row:any)=>new Date(row.created_at).getTime()>=dayAgo).length;
		metrics.lastClientSeenAt = clients.map((row:any)=>row.last_seen_at).filter(Boolean).sort().at(-1) || null;
		metrics.lastSessionSeenAt = sessions.map((row:any)=>row.last_seen_at).filter(Boolean).sort().at(-1) || null;
	}

	return { user, engine, readiness, metrics };
}
