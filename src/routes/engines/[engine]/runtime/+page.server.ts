import { fail } from '@sveltejs/kit';
import { requireUser } from '$lib/server/auth';
import { getEngineHubEngine } from '$lib/server/engine-hub';
import { setAddonEngineMode } from '$lib/server/addon-engine';

function canManage(user: any) {
	return ['owner', 'admin'].includes(String(user?.role || '').toLowerCase());
}

export async function load({ cookies, params }) {
	const user = await requireUser(cookies);
	const engine = await getEngineHubEngine(params.engine);
	return { user, engine, canManage: canManage(user) };
}

export const actions = {
	control: async ({ cookies, params, request }) => {
		const user = await requireUser(cookies);
		if (!canManage(user)) return fail(403, { error: 'Runtime control requires an OrbitFS administrator.' });
		const form = await request.formData();
		const action = String(form.get('action') || '').toLowerCase();
		if (!['running', 'standby', 'stopped', 'restart'].includes(action)) return fail(400, { error: 'Invalid runtime action.' });
		const engine = await getEngineHubEngine(params.engine);
		if (!engine.attached || !engine.linked) return fail(409, { error: 'Attach and link this engine from Panel before changing runtime state.' });
		if (!engine.licensed) return fail(403, { error: 'This engine is not licensed for the current OrbitFS installation.' });
		await setAddonEngineMode(params.engine, action as any, String(user.id));
		return { ok: true, message: `Runtime changed to ${action}.` };
	}
};
