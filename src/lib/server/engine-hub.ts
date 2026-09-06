import { getSupabaseAdmin } from '$lib/server/supabase';
import { getAddonEngineState, type EngineSetupState } from '$lib/server/addon-engine';
import { getPanelLicenseSummary } from '$lib/server/license';

export const ENGINE_CATALOG = [
	{ id: 'mcp', name: 'MCP', fullName: 'OrbitFS MCP', description: 'Context, tools, OAuth and MCP client runtime.', component: 'orbitfs_mcp', transportPath: '/mcp' },
	{ id: 'apex', name: 'APEX', fullName: 'OrbitFS APEX', description: 'Routing, processing and automation engine.', component: 'orbitfs_apex', transportPath: null },
	{ id: 'studio', name: 'Studio', fullName: 'OrbitFS Studio', description: 'Studio processing and analysis runtime.', component: 'orbitfs_studio', transportPath: null }
] as const;

function objectValue(value: unknown): Record<string, any> {
	return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function setupStateFor(row: any): EngineSetupState {
	const runtime = objectValue(row?.runtime);
	const config = objectValue(row?.config);
	const setup = objectValue(config.engineSetup);
	const state = String(runtime.setupState || setup.state || '');
	if (['not_started','required','in_progress','complete','error'].includes(state)) return state as EngineSetupState;
	return row?.attached ? 'required' : 'not_started';
}

export function knownEngine(id: string) {
	return ENGINE_CATALOG.find((engine) => engine.id === id.toLowerCase()) || null;
}

export async function listEngineHubEngines() {
	const db = getSupabaseAdmin();
	const [{ data: rows, error }, license] = await Promise.all([
		db.from('orbitfs_addons').select('id,name,installed,attached,configured,available,license_component,config,runtime,updated_at'),
		getPanelLicenseSummary()
	]);
	if (error) throw error;
	const byId = new Map((rows || []).map((row: any) => [String(row.id), row]));
	return ENGINE_CATALOG.map((engine) => {
		const row: any = byId.get(engine.id) || null;
		const runtime = objectValue(row?.runtime);
		const config = objectValue(row?.config);
		const link = objectValue(config.engineHostLink);
		const component = license.components?.[String(row?.license_component || engine.component)] || null;
		const licensed = component?.allowed === true && component?.lockedToThisInstallation === true && ['enabled','locked'].includes(String(component?.state || ''));
		const setupState = setupStateFor(row);
		return {
			...engine,
			registered: Boolean(row),
			installed: row?.installed === true,
			attached: row?.attached === true,
			licensed,
			available: row?.available !== false,
			configured: setupState === 'complete',
			setupState,
			setupVersion: Number(runtime.setupVersion || 1),
			engineState: String(runtime.engineMode || 'standby'),
			linked: runtime.engineHostLinked === true && link.state === 'linked',
			panelUrl: link.panelUrl || runtime.panelUrl || null,
			workspaceId: link.workspaceId || runtime.workspaceId || null,
			workspaceName: link.workspaceName || null,
			lastSyncAt: runtime.lastLinkSyncAt || link.lastSyncAt || null,
			updatedAt: row?.updated_at || null
		};
	});
}

export async function getEngineHubEngine(id: string) {
	const engine = knownEngine(id);
	if (!engine) throw Object.assign(new Error('Unknown engine'), { status: 404, code: 'ENGINE_NOT_FOUND' });
	const list = await listEngineHubEngines();
	const summary = list.find((item) => item.id === engine.id)!;
	if (!summary.registered) return { ...summary, state: null };
	return { ...summary, state: await getAddonEngineState(engine.id) };
}

export async function setEngineSetupState(engineId: string, setupState: EngineSetupState, actorUserId: string) {
	const engine = knownEngine(engineId);
	if (!engine) throw Object.assign(new Error('Unknown engine'), { status: 404, code: 'ENGINE_NOT_FOUND' });
	if (!['not_started','required','in_progress','complete','error'].includes(setupState)) {
		throw Object.assign(new Error('Invalid setup state'), { status: 400, code: 'SETUP_STATE_INVALID' });
	}
	const db = getSupabaseAdmin();
	const { data: row, error: readError } = await db.from('orbitfs_addons').select('runtime,config,attached').eq('id', engine.id).maybeSingle();
	if (readError) throw readError;
	if (!row) throw Object.assign(new Error('Engine is not registered'), { status: 404, code: 'ENGINE_NOT_REGISTERED' });
	const runtime = objectValue(row.runtime);
	const config = objectValue(row.config);
	const now = new Date().toISOString();
	const configured = setupState === 'complete';
	const setup = { ...objectValue(config.engineSetup), state: setupState, version: Number(runtime.setupVersion || 1), updatedAt: now, updatedByUserId: actorUserId };
	const { error } = await db.from('orbitfs_addons').update({
		configured,
		status: row.attached ? (configured ? 'attached' : 'setup_required') : 'detached',
		config: { ...config, engineSetup: setup },
		runtime: { ...runtime, setupState, setupVersion: setup.version, lastSetupAt: now, lastSetupBy: actorUserId },
		updated_at: now
	}).eq('id', engine.id);
	if (error) throw error;
	return getEngineHubEngine(engine.id);
}
