import { redirect } from '@sveltejs/kit';
import { destroySession, requireUser } from '$lib/server/auth';
import { accessibleWorkspaces } from '$lib/server/base-compat';
import { ensureInstallationIdentity } from '$lib/server/license';
import { listEngineHubEngines } from '$lib/server/engine-hub';

export async function load({ cookies }) {
	const user = await requireUser(cookies);
	const [engines, workspaces, installationId] = await Promise.all([
		listEngineHubEngines(),
		accessibleWorkspaces(user),
		ensureInstallationIdentity()
	]);
	const mainWorkspace = workspaces.find((workspace: any) => workspace.is_main) || workspaces[0] || null;
	return { user, engines, mainWorkspace, workspaceCount: workspaces.length, installationId };
}

export const actions = {
	logout: async ({ cookies }) => {
		await destroySession(cookies);
		throw redirect(303, '/login');
	}
};
