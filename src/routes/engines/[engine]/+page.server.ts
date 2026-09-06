import { error, fail } from '@sveltejs/kit';
import { requireUser } from '$lib/server/auth';
import { getEngineHubEngine, setEngineSetupState } from '$lib/server/engine-hub';
import { setAddonEngineMode } from '$lib/server/addon-engine';

function canManage(user: any) {
	return ['owner','admin'].includes(String(user.role || '').toLowerCase());
}

export async function load({ cookies, params }) {
	const user = await requireUser(cookies);
	const engine = await getEngineHubEngine(params.engine);
	if (!engine.registered) throw error(404, 'Engine is not registered');
	return { user, engine, canManage: canManage(user) };
}

export const actions = {
	setup: async ({ cookies, params, request }) => {
		const user = await requireUser(cookies);
		if (!canManage(user)) return fail(403, { error: 'Engine setup requires an OrbitFS administrator.' });
		const form = await request.formData();
		const state = String(form.get('state') || '');
		if (!['required','in_progress','complete','error'].includes(state)) return fail(400, { error: 'Invalid setup state.' });
		await setEngineSetupState(params.engine, state as any, String(user.id));
		return { ok: true };
	},
	runtime: async ({ cookies, params, request }) => {
		const user = await requireUser(cookies);
		if (!canManage(user)) return fail(403, { error: 'Engine runtime control requires an OrbitFS administrator.' });
		const form = await request.formData();
		const action = String(form.get('action') || '').toLowerCase();
		if (!['running','standby','stopped','restart'].includes(action)) return fail(400, { error: 'Invalid runtime action.' });
		await setAddonEngineMode(params.engine, action as any, String(user.id));
		return { ok: true };
	}
};
