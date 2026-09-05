import { fail } from '@sveltejs/kit';
import { authenticateOrbitCredentials, createSession, destroySession, getSessionUser } from '$lib/server/auth';
import { getMcpEngineState, setMcpEngineMode } from '$lib/server/mcp-engine';

export async function load({ cookies }) {
	const user = await getSessionUser(cookies);
	return { user, engine: await getMcpEngineState() };
}

export const actions = {
	login: async ({ request, cookies, getClientAddress }) => {
		const form = await request.formData();
		const identity = String(form.get('identity') || '').trim();
		const credential = String(form.get('credential') || '');
		const user = await authenticateOrbitCredentials(identity, credential);
		if (!user || !['owner','admin'].includes(String(user.role))) return fail(401, { loginError: 'Owner or admin login required.' });
		await createSession(user.id, cookies, { ip: getClientAddress(), secure: true });
		return { ok: true };
	},
	logout: async ({ cookies }) => {
		await destroySession(cookies);
		return { ok: true };
	},
	control: async ({ request, cookies }) => {
		const user = await getSessionUser(cookies);
		if (!user || !['owner','admin'].includes(String(user.role))) return fail(403, { controlError: 'Owner or admin access required.' });
		const form = await request.formData();
		const mode = String(form.get('mode') || '');
		if (!['running','standby','stopped','restart'].includes(mode)) return fail(400, { controlError: 'Invalid engine mode.' });
		await setMcpEngineMode(mode as any, user.username);
		return { ok: true };
	}
};
