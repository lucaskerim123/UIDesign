import { fail, redirect } from '@sveltejs/kit';
import { authenticateOrbitCredentials, createSession, getSessionUser } from '$lib/server/auth';

export async function load({ cookies }) {
	if (await getSessionUser(cookies)) throw redirect(303, '/engines');
	return {};
}

export const actions = {
	default: async ({ request, cookies, url, getClientAddress }) => {
		const form = await request.formData();
		const identity = String(form.get('identity') || '').trim();
		const credential = String(form.get('credential') || '');
		if (!identity || !credential) return fail(400, { error: 'Enter your OrbitFS username or email and password.', identity });
		const user = await authenticateOrbitCredentials(identity, credential);
		if (!user || user.status !== 'active') return fail(401, { error: 'Invalid OrbitFS credentials.', identity });
		await createSession(String(user.id), cookies, {
			userAgent: request.headers.get('user-agent'),
			ip: (() => { try { return getClientAddress(); } catch { return null; } })(),
			secure: url.protocol === 'https:'
		});
		throw redirect(303, '/engines');
	}
};
