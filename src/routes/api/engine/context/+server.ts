import { json } from '@sveltejs/kit';
import { requireUser } from '$lib/server/auth';
import { accessibleWorkspaces } from '$lib/server/base-compat';
import { getEngineHostLink } from '$lib/server/engine-host-link';
import { getPanelLicenseSummary } from '$lib/server/license';
import { getSupabaseAdmin } from '$lib/server/supabase';

export async function GET({ cookies }) {
	try {
		const user = await requireUser(cookies);
		const workspaces = await accessibleWorkspaces(user);
		const mainWorkspace = workspaces.find((workspace: any) => workspace.is_main) || workspaces[0] || null;
		const db = getSupabaseAdmin();
		const { data: addonRows, error } = await db
			.from('orbitfs_addons')
			.select('id')
			.in('id', ['mcp', 'apex', 'studio']);
		if (error) throw error;
		const engineIds = (addonRows || []).map((row: any) => String(row.id));
		const [license, engines] = await Promise.all([
			getPanelLicenseSummary(),
			Promise.all(engineIds.map((engineId: string) => getEngineHostLink(engineId)))
		]);
		const linkedPanel = engines.find((engine: any) => engine.panelUrl)?.panelUrl || null;
		return json(
			{
				user: {
					id: user.id,
					username: user.username,
					displayName: user.display_name,
					email: user.email,
					role: user.role,
					avatarUrl: user.avatar_url,
					permissions: user.permissions || {}
				},
				installation: {
					id: license.installationId,
					licensed: license.licensed,
					plan: license.plan,
					licensedTo: license.licensedTo,
					expiresAt: license.expiresAt,
					panelUrl: linkedPanel
				},
				mainWorkspace,
				workspaces,
				engines
			},
			{ headers: { 'cache-control': 'no-store' } }
		);
	} catch (error: any) {
		return json(
			{ error: String(error?.message || 'Engine Host context failed'), code: String(error?.code || 'ENGINE_CONTEXT_FAILED') },
			{ status: Number(error?.status || 500), headers: { 'cache-control': 'no-store' } }
		);
	}
}
