import { requireAdmin } from '$lib/server/auth';
import { getEngineHubEngine } from '$lib/server/engine-hub';
import { getSupabaseAdmin } from '$lib/server/supabase';

export async function load({ cookies, params }) {
	const user = await requireAdmin(cookies);
	const engine = await getEngineHubEngine(params.engine);
	const db = getSupabaseAdmin();
	let logs: any[] = [];

	if (engine.id === 'mcp') {
		const result = await db.from('mcp_audit_log')
			.select('id,scope_id,actor_user_id,event_type,details,created_at')
			.order('created_at',{ascending:false})
			.limit(200);
		if (result.error) throw result.error;
		logs = (result.data || []).map((row:any)=>({
			id: row.id,
			type: row.event_type,
			scope: row.scope_id,
			actor: row.actor_user_id,
			detail: row.details || {},
			createdAt: row.created_at
		}));
	} else {
		const result = await db.from('orbitfs_audit_log')
			.select('id,actor_user_id,workspace_id,action,target_type,target_id,detail,created_at')
			.eq('target_id',engine.id)
			.order('created_at',{ascending:false})
			.limit(200);
		if (result.error) throw result.error;
		logs = (result.data || []).map((row:any)=>({
			id: row.id,
			type: row.action,
			scope: row.workspace_id,
			actor: row.actor_user_id,
			detail: row.detail || {},
			createdAt: row.created_at
		}));
	}

	return { user, engine, logs };
}
