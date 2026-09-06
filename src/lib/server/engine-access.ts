import type { OrbitUser } from '$lib/server/auth';
import { isSystemAdmin, visibleWorkspaces } from '$lib/server/workspaces';

export type EngineAccess = {
	allowed: boolean;
	admin: boolean;
	workspaces: any[];
};

function workspaceAllowsEngine(workspace: any, engineId: string) {
	const permissions = workspace?.management_permissions || {};
	if (engineId === 'mcp') {
		return workspace?.mcp_system_enabled !== false && permissions.mcp_use === true;
	}
	if (engineId === 'apex') {
		return workspace?.apex_system_enabled !== false && (permissions.sorter_view === true || permissions.converter_view === true);
	}
	if (engineId === 'studio') {
		return permissions.studio_view === true;
	}
	return false;
}

export async function engineAccess(user: OrbitUser, engineId: string): Promise<EngineAccess> {
	const workspaces = await visibleWorkspaces(user);
	if (isSystemAdmin(user)) return { allowed: true, admin: true, workspaces };
	const allowed = workspaces.filter((workspace: any) => workspaceAllowsEngine(workspace, engineId));
	return { allowed: allowed.length > 0, admin: false, workspaces: allowed };
}

export async function engineCatalogAccess(user: OrbitUser, engines: any[]) {
	const workspaces = await visibleWorkspaces(user);
	const admin = isSystemAdmin(user);
	return engines
		.map((engine: any) => {
			const allowedWorkspaces = admin ? workspaces : workspaces.filter((workspace: any) => workspaceAllowsEngine(workspace, engine.id));
			return {
				...engine,
				accessAllowed: admin || allowedWorkspaces.length > 0,
				accessWorkspaceCount: allowedWorkspaces.length,
				accessWorkspaceNames: allowedWorkspaces.map((workspace: any) => String(workspace.name || workspace.id)).slice(0, 8)
			};
		})
		.filter((engine: any) => engine.accessAllowed);
}
