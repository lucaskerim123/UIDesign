import { redirect } from '@sveltejs/kit';
import { destroySession, requireUser } from '$lib/server/auth';
import { accessibleWorkspaces } from '$lib/server/base-compat';
import { engineCatalogAccess } from '$lib/server/engine-access';
import { ensureInstallationIdentity } from '$lib/server/license';
import { listEngineHubEngines } from '$lib/server/engine-hub';

export async function load({ cookies }) {
	const user = await requireUser(cookies);
	const [allEngines, workspaces, installationId] = await Promise.all([
		listEngineHubEngines(),
		accessibleWorkspaces(user),
		ensureInstallationIdentity()
	]);
	const engines = await engineCatalogAccess(user, allEngines);
	const mainWorkspace = workspaces.find((workspace: any) => workspace.is_main) || workspaces[0] || null;
	const canManage = ['owner','admin'].includes(String(user.role || '').toLowerCase());
	return { user, engines, mainWorkspace, workspaceCount: workspaces.length, installationId, canManage };
}

export const actions = {
	logout: async ({ cookies }) => {
		await destroySession(cookies);
		throw redirect(303, '/login');
	}
};
