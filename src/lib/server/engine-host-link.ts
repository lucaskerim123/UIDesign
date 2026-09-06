import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { getSupabaseAdmin } from '$lib/server/supabase';
import { ensureInstallationIdentity, getPanelLicenseSummary } from '$lib/server/license';

export type EngineSetupState = 'not_started' | 'required' | 'in_progress' | 'complete' | 'error';

const PANEL_URL = 'https://orbitfs.vercel.app';
const COMPONENTS: Record<string, string> = {
	mcp: 'orbitfs_mcp',
	apex: 'orbitfs_apex',
	studio: 'orbitfs_studio'
};

function safeEqual(a: string, b: string) {
	const aa = Buffer.from(a);
	const bb = Buffer.from(b);
	return aa.length === bb.length && timingSafeEqual(aa, bb);
}

function engineSecret() {
	return String(env.ORBITFS_ENGINE_SECRET || env.ORBITFS_DB_SECRET || '').trim();
}

export function authorizeEngineHostRequest(request: Request, rawBody = '') {
	const expected = engineSecret();
	if (!expected) return false;
	const supplied = String(request.headers.get('x-orbitfs-engine-secret') || '');
	if (!safeEqual(supplied, expected)) return false;

	const timestamp = String(request.headers.get('x-orbitfs-timestamp') || '').trim();
	const signature = String(request.headers.get('x-orbitfs-signature') || '').trim();
	if (!timestamp && !signature) return true;
	if (!timestamp || !signature) return false;
	const seconds = Number(timestamp);
	if (!Number.isFinite(seconds) || Math.abs(Date.now() - seconds * 1000) > 5 * 60 * 1000) return false;
	const expectedSignature = createHmac('sha256', expected).update(`${timestamp}.${rawBody}`).digest('hex');
	return safeEqual(signature, expectedSignature);
}

function normalizeEngineId(value: unknown) {
	const id = String(value || '').trim().toLowerCase();
	if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(id)) {
		throw Object.assign(new Error('Invalid engine id'), { status: 400, code: 'ENGINE_ID_INVALID' });
	}
	return id;
}

function normalizePanelUrl(value: unknown) {
	try {
		const url = new URL(String(value || '').trim());
		const host = url.hostname.toLowerCase();
		if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new Error();
		if (host === 'localhost' || host === '127.0.0.1' || host === '::1') throw new Error();
		const normalized = `${url.protocol}//${url.host}`;
		const configuredUrl = new URL(String(env.ORBITFS_PANEL_URL || PANEL_URL).trim());
		const expected = `${configuredUrl.protocol}//${configuredUrl.host}`;
		if (normalized !== expected) {
			throw Object.assign(new Error('Panel URL does not match the configured OrbitFS Panel'), {
				status: 409,
				code: 'PANEL_URL_MISMATCH'
			});
		}
		return normalized;
	} catch (error: any) {
		if (error?.code) throw error;
		throw Object.assign(new Error('A public HTTPS OrbitFS Panel URL is required'), {
			status: 400,
			code: 'PANEL_URL_INVALID'
		});
	}
}

async function getEngineRow(engineId: string) {
	const db = getSupabaseAdmin();
	const { data, error } = await db
		.from('orbitfs_addons')
		.select('id,name,installed,attached,configured,available,license_component,config,runtime,updated_at')
		.eq('id', engineId)
		.maybeSingle();
	if (error) throw error;
	if (!data) throw Object.assign(new Error('Unknown engine'), { status: 404, code: 'ENGINE_NOT_FOUND' });
	return data as any;
}

function objectValue(value: unknown): Record<string, any> {
	return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, any>) : {};
}

function setupStateFor(row: any): EngineSetupState {
	const runtime = objectValue(row.runtime);
	const config = objectValue(row.config);
	const setup = objectValue(config.engineSetup);
	const candidate = String(runtime.setupState || setup.state || '');
	if (['not_started', 'required', 'in_progress', 'complete', 'error'].includes(candidate)) return candidate as EngineSetupState;
	return row.attached === true ? 'required' : 'not_started';
}

async function licenseStatus(engineId: string, row: any) {
	const componentId = String(row.license_component || COMPONENTS[engineId] || '').trim() || null;
	if (!componentId) return { componentId: null, licensed: true, component: null };
	const summary = await getPanelLicenseSummary();
	const component = summary.components?.[componentId] || null;
	const licensed = component?.allowed === true && component?.lockedToThisInstallation === true && ['enabled', 'locked'].includes(String(component?.state || ''));
	return { componentId, licensed, component };
}

export async function getEngineHostLink(engineIdInput: unknown) {
	const engineId = normalizeEngineId(engineIdInput);
	const row = await getEngineRow(engineId);
	const config = objectValue(row.config);
	const runtime = objectValue(row.runtime);
	const link = objectValue(config.engineHostLink);
	const license = await licenseStatus(engineId, row);
	const setupState = setupStateFor(row);
	return {
		engineId,
		name: row.name,
		installed: row.installed === true,
		attached: row.attached === true,
		configured: setupState === 'complete',
		available: row.available !== false,
		setupState,
		setupVersion: Number(runtime.setupVersion || 1),
		engineState: String(runtime.engineMode || 'standby'),
		linked: runtime.engineHostLinked === true && link.state === 'linked',
		linkState: String(link.state || 'unlinked'),
		installationId: link.installationId || null,
		panelUrl: link.panelUrl || null,
		workspaceId: link.workspaceId || null,
		workspaceName: link.workspaceName || null,
		linkedByUserId: link.linkedByUserId || null,
		linkedByUsername: link.linkedByUsername || null,
		linkedAt: link.linkedAt || null,
		lastSyncAt: link.lastSyncAt || null,
		detachedAt: link.detachedAt || null,
		componentId: license.componentId,
		licensed: license.licensed,
		licenseComponent: license.component,
		updatedAt: row.updated_at || null
	};
}

export async function pairEngineHost(input: Record<string, any>) {
	const engineId = normalizeEngineId(input.engineId || input.engine_id);
	const row = await getEngineRow(engineId);
	if (row.installed !== true) {
		throw Object.assign(new Error(`OrbitFS ${engineId} must be installed from Panel before it can be attached`), {
			status: 409,
			code: 'ENGINE_NOT_INSTALLED'
		});
	}
	const installationId = String(input.installationId || input.installation_id || '').trim();
	const canonicalInstallationId = await ensureInstallationIdentity();
	if (!installationId || installationId !== canonicalInstallationId) {
		throw Object.assign(new Error('Engine Host pairing belongs to a different OrbitFS installation'), {
			status: 409,
			code: 'INSTALLATION_MISMATCH'
		});
	}

	const panelUrl = normalizePanelUrl(input.panelUrl || input.panel_url);
	const workspaceId = String(input.workspaceId || input.workspace_id || '').trim();
	if (!workspaceId) throw Object.assign(new Error('Workspace id is required'), { status: 400, code: 'WORKSPACE_REQUIRED' });
	const db = getSupabaseAdmin();
	const { data: workspace, error: workspaceError } = await db
		.from('orbitfs_workspaces')
		.select('id,name,is_main')
		.eq('id', workspaceId)
		.maybeSingle();
	if (workspaceError) throw workspaceError;
	if (!workspace) throw Object.assign(new Error('Workspace was not found in the shared OrbitFS backend'), { status: 404, code: 'WORKSPACE_NOT_FOUND' });

	const actorUserId = String(input.actorUserId || input.actor_user_id || '').trim() || null;
	let actor: any = null;
	if (actorUserId) {
		const result = await db.from('orbitfs_users').select('id,username,display_name,status').eq('id', actorUserId).maybeSingle();
		if (result.error) throw result.error;
		if (!result.data || result.data.status !== 'active') {
			throw Object.assign(new Error('Pairing user is not an active OrbitFS user'), { status: 403, code: 'PAIRING_USER_INVALID' });
		}
		actor = result.data;
	}

	const license = await licenseStatus(engineId, row);
	if (!license.licensed) {
		throw Object.assign(new Error(`OrbitFS ${engineId} is not licensed for this installation`), {
			status: 403,
			code: 'ENGINE_LICENSE_REQUIRED'
		});
	}

	const config = objectValue(row.config);
	const runtime = objectValue(row.runtime);
	const previousLink = objectValue(config.engineHostLink);
	const previousSetupState = setupStateFor(row);
	const now = new Date().toISOString();
	const attached = input.attached !== false;
	const link = {
		version: 1,
		state: attached ? 'linked' : 'detached',
		engineId,
		componentId: license.componentId,
		installationId,
		panelUrl,
		workspaceId: workspace.id,
		workspaceName: workspace.name,
		workspaceIsMain: workspace.is_main === true,
		linkedByUserId: actor?.id || previousLink.linkedByUserId || null,
		linkedByUsername: actor?.username || previousLink.linkedByUsername || null,
		linkedAt: previousLink.linkedAt || now,
		lastSyncAt: now,
		detachedAt: attached ? null : now
	};
	const setupState: EngineSetupState = attached
		? (previousSetupState === 'complete' ? 'complete' : 'required')
		: previousSetupState;
	const nextRuntime = {
		...runtime,
		engineHostLinked: attached,
		panelUrl,
		workspaceId: workspace.id,
		setupState,
		setupVersion: Number(runtime.setupVersion || 1),
		lastLinkSyncAt: now
	};
	const { error } = await db
		.from('orbitfs_addons')
		.update({
			attached,
			configured: setupState === 'complete',
			status: attached ? (setupState === 'complete' ? 'attached' : 'setup_required') : 'detached',
			config: { ...config, engineHostLink: link },
			runtime: nextRuntime,
			updated_at: now
		})
		.eq('id', engineId);
	if (error) throw error;
	return getEngineHostLink(engineId);
}

export async function detachEngineHost(engineIdInput: unknown, actorUserId?: string | null) {
	const engineId = normalizeEngineId(engineIdInput);
	const row = await getEngineRow(engineId);
	const config = objectValue(row.config);
	const runtime = objectValue(row.runtime);
	const previousLink = objectValue(config.engineHostLink);
	const now = new Date().toISOString();
	const nextLink = {
		...previousLink,
		state: 'detached',
		lastSyncAt: now,
		detachedAt: now,
		detachedByUserId: actorUserId || null
	};
	const db = getSupabaseAdmin();
	const { error } = await db
		.from('orbitfs_addons')
		.update({
			attached: false,
			status: 'detached',
			config: { ...config, engineHostLink: nextLink },
			runtime: { ...runtime, engineHostLinked: false, lastLinkSyncAt: now },
			updated_at: now
		})
		.eq('id', engineId);
	if (error) throw error;
	return getEngineHostLink(engineId);
}
