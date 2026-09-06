import { fail } from '@sveltejs/kit';
import { requireUser } from '$lib/server/auth';
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

export const actions = {
	begin: async ({ cookies, params }) => {
		const user = await requireUser(cookies);
		if (!canManage(user)) return fail(403, { error: 'Engine setup requires an OrbitFS administrator.' });
		const readiness = await getEngineReadiness(params.engine);
		if (!readiness.engine.linked) return fail(409, { error: 'Attach and link this engine from OrbitFS Panel before starting setup.' });
		await setEngineSetupState(params.engine, 'in_progress', String(user.id));
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
		return { ok: true, message: 'Engine setup is complete.' };
	},
	rerun: async ({ cookies, params }) => {
		const user = await requireUser(cookies);
		if (!canManage(user)) return fail(403, { error: 'Engine setup requires an OrbitFS administrator.' });
		await setEngineSetupState(params.engine, 'required', String(user.id));
		return { ok: true, message: 'Setup has been reopened.' };
	}
};
