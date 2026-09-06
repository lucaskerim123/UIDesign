import { fail } from '@sveltejs/kit';
import { requireUser } from '$lib/server/auth';
import { writeAudit } from '$lib/server/audit';
import { getEngineReadiness } from '$lib/server/engine-readiness';
import { setEngineSetupState } from '$lib/server/engine-hub';

function canManage(user: any) {
	return ['owner', 'admin'].includes(String(user?.role || '').toLowerCase());
}

export async function load({ cookies, params }) {
	const user = await requireUser(cookies);
	const readiness = await getEngineReadiness(params.engine);
	return { user, ...readiness, canManage: canManage(user) };
}

async function auditSetup(user:any, readiness:any, action:string, state:string) {
	await writeAudit({
		actorUserId:String(user.id),
		workspaceId:readiness.engine.workspaceId || null,
		action,
		targetType:'engine',
		targetId:readiness.engine.id,
		detail:{setupState:state,engineHost:'https://orbitfsengine.vercel.app'}
	});
}

export const actions = {
	begin: async ({ cookies, params }) => {
		const user = await requireUser(cookies);
		if (!canManage(user)) return fail(403, { error: 'Engine setup requires an OrbitFS administrator.' });
		const readiness = await getEngineReadiness(params.engine);
		if (!readiness.engine.linked) return fail(409, { error: 'Attach and link this engine from OrbitFS Panel before starting setup.' });
		await setEngineSetupState(params.engine, 'in_progress', String(user.id));
		await auditSetup(user,readiness,'engine.setup.begin','in_progress');
		return { ok: true, message: 'Setup started.' };
	},
	complete: async ({ cookies, params }) => {
		const user = await requireUser(cookies);
		if (!canManage(user)) return fail(403, { error: 'Engine setup requires an OrbitFS administrator.' });
		const readiness = await getEngineReadiness(params.engine);
		if (!readiness.ready) {
			return fail(409, { error: `Setup cannot complete yet. Blocking checks: ${readiness.blocking.join(', ')}.` });
		}
		await setEngineSetupState(params.engine, 'complete', String(user.id));
		await auditSetup(user,readiness,'engine.setup.complete','complete');
		return { ok: true, message: 'Engine setup is complete.' };
	},
	rerun: async ({ cookies, params }) => {
		const user = await requireUser(cookies);
		if (!canManage(user)) return fail(403, { error: 'Engine setup requires an OrbitFS administrator.' });
		const readiness = await getEngineReadiness(params.engine);
		await setEngineSetupState(params.engine, 'required', String(user.id));
		await auditSetup(user,readiness,'engine.setup.reopen','required');
		return { ok: true, message: 'Setup has been reopened.' };
	}
};
