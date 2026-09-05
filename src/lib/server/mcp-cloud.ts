import { getSupabaseAdmin } from '$lib/server/supabase';
import { getPanelLicenseSummary } from '$lib/server/license';

export const MCP_COMPONENT = 'orbitfs_mcp';

function invalidLicense(message: string, code = 'MCP_LICENSE_REQUIRED') {
	return Object.assign(new Error(message), { status: 403, code });
}

export async function assertMcpLicensed() {
	const summary = await getPanelLicenseSummary();
	const component = summary.components?.[MCP_COMPONENT] ?? null;
	const allowed = Boolean(
		summary.valid === true &&
		component?.allowed === true &&
		component?.lockedToThisInstallation === true &&
		['enabled', 'locked'].includes(String(component?.state || ''))
	);
	if (!allowed) {
		throw invalidLicense(
			String(component?.reason || summary.reason || 'OrbitFS MCP licence is required'),
			'MCP_LICENSE_REQUIRED'
		);
	}
	return { summary, component };
}

export async function getMcpAddonRow() {
	const db = getSupabaseAdmin();
	const { data, error } = await db.from('orbitfs_addons').select('*').eq('id', 'mcp').maybeSingle();
	if (error) throw error;
	return data;
}

export async function auditMcp(eventType: string, details: Record<string, unknown> = {}, actorUserId: string | null = null, scopeId = 'public') {
	const db = getSupabaseAdmin();
	await db.from('mcp_audit_log').insert({ scope_id: scopeId, actor_user_id: actorUserId, event_type: eventType, details });
}
