import { error, fail } from '@sveltejs/kit';
import { requireUser } from '$lib/server/auth';
import { writeAudit } from '$lib/server/audit';
import { engineAccess } from '$lib/server/engine-access';
import { getEngineHubEngine } from '$lib/server/engine-hub';
import { setAddonEngineMode } from '$lib/server/addon-engine';

function canManage(user: any) {
	return ['owner', 'admin'].includes(String(user?.role || '').toLowerCase());
}

export async function load({ cookies, params }) {
	const user = await requireUser(cookies);
	const engine = await getEngineHubEngine(params.engine);
	const access = await engineAccess(user, engine.id);
	if (!access.allowed) throw error(403, 'You do not have workspace permission to use this OrbitFS engine.');
	return {
		user,
		engine,
		canManage: canManage(user),
		canWake: access.allowed && engine.engineState === 'standby',
		accessWorkspaceCount: access.workspaces.length
	};
}

export const actions = {
	control: async ({ cookies, params, request }) => {
		const user = await requireUser(cookies);
		const admin = canManage(user);
		const form = await request.formData();
		const action = String(form.get('action') || '').toLowerCase();
		if (!['running', 'standby', 'stopped', 'restart'].includes(action)) return fail(400, { error: 'Invalid runtime action.' });

		const engine = await getEngineHubEngine(params.engine);
		const access = await engineAccess(user, engine.id);
		if (!access.allowed) return fail(403, { error: 'You do not have workspace permission to use this OrbitFS engine.' });
		if (!engine.attached || !engine.linked) return fail(409, { error: 'Attach and link this engine from Panel before changing runtime state.' });
		if (!engine.licensed) return fail(403, { error: 'This engine is not licensed for the current OrbitFS installation.' });

		if (!admin) {
			if (action !== 'running') return fail(403, { error: 'Only an OrbitFS administrator can change this runtime mode.' });
			if (engine.engineState === 'stopped') return fail(409, { error: 'This engine was stopped by an administrator and cannot be woken by a workspace user.' });
			if (engine.engineState !== 'standby') return { ok: true, message: `Runtime is already ${engine.engineState}.` };
		}

		const state = await setAddonEngineMode(params.engine, action as any, String(user.id));
		await writeAudit({
			actorUserId:String(user.id),
			workspaceId:engine.workspaceId || null,
			action:admin ? `engine.runtime.${action}` : 'engine.runtime.wake',
			targetType:'engine',
			targetId:engine.id,
			detail:{engineMode:state.mode,generation:state.generation,engineHost:'https://orbitfsengine.vercel.app',workspacePermissionWake:!admin}
		});
		return { ok: true, message: admin ? `Runtime changed to ${action}.` : `${engine.name} is running.` };
	}
};
