import { getSupabaseAdmin } from '$lib/server/supabase';

export type McpEngineMode = 'running' | 'standby' | 'stopped';

export async function getMcpEngineState() {
	const db = getSupabaseAdmin();
	const { data, error } = await db.from('orbitfs_addons').select('runtime,updated_at').eq('id','mcp').maybeSingle();
	if (error) throw error;
	const runtime = (data?.runtime && typeof data.runtime === 'object') ? data.runtime as Record<string, any> : {};
	const mode = (['running','standby','stopped'] as string[]).includes(String(runtime.engineMode)) ? String(runtime.engineMode) as McpEngineMode : 'standby';
	return {
		mode,
		generation: Number(runtime.generation || 1),
		lastRequestAt: runtime.lastRequestAt || null,
		lastControlAt: runtime.lastControlAt || null,
		lastControlBy: runtime.lastControlBy || null,
		lastError: runtime.lastError || null,
		deployment: runtime.deployment || 'ready',
		transport: runtime.transport || '/mcp',
		compute: runtime.compute || 'vercel',
		database: runtime.database || 'supabase',
		updatedAt: data?.updated_at || null
	};
}

export async function setMcpEngineMode(mode: McpEngineMode | 'restart', actor: string | null = null) {
	const db = getSupabaseAdmin();
	const current = await getMcpEngineState();
	const now = new Date().toISOString();
	const nextMode: McpEngineMode = mode === 'restart' ? 'running' : mode;
	const runtimePatch = {
		engineMode: nextMode,
		generation: mode === 'restart' ? current.generation + 1 : current.generation,
		lastControlAt: now,
		lastControlBy: actor,
		lastError: null,
		online: nextMode !== 'stopped',
		deployment: 'ready',
		transport: '/mcp',
		compute: 'vercel',
		database: 'supabase'
	};
	const { data: row } = await db.from('orbitfs_addons').select('runtime').eq('id','mcp').maybeSingle();
	const merged = { ...((row?.runtime && typeof row.runtime === 'object') ? row.runtime : {}), ...runtimePatch };
	const { error } = await db.from('orbitfs_addons').update({ runtime: merged, updated_at: now }).eq('id','mcp');
	if (error) throw error;
	return getMcpEngineState();
}

export async function noteMcpRequest() {
	const db = getSupabaseAdmin();
	const now = new Date().toISOString();
	const { data: row } = await db.from('orbitfs_addons').select('runtime').eq('id','mcp').maybeSingle();
	const runtime = (row?.runtime && typeof row.runtime === 'object') ? row.runtime as Record<string, any> : {};
	await db.from('orbitfs_addons').update({ runtime: { ...runtime, lastRequestAt: now }, updated_at: now }).eq('id','mcp');
}

export async function assertMcpEngineAccepting() {
	const state = await getMcpEngineState();
	if (state.mode === 'stopped') {
		throw Object.assign(new Error('OrbitFS MCP engine is stopped'), { status: 503, code: 'MCP_ENGINE_STOPPED' });
	}
	return state;
}
