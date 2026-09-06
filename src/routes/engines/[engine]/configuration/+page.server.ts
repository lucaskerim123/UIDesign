import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth';
import { writeAudit } from '$lib/server/audit';
import { apexPolicy, saveApexPolicy } from '$lib/server/apex-cloud';
import { getEngineHubEngine } from '$lib/server/engine-hub';
import { getStudioAdminSettings, updateStudioAdminSettings } from '$lib/server/studio-cloud';

function checked(form: FormData, key: string) {
	return form.get(key) === 'on' || form.get(key) === 'true';
}

function boundedNumber(form: FormData, key: string, fallback: number, min: number, max: number) {
	const value = Number(form.get(key));
	if (!Number.isFinite(value)) return fallback;
	return Math.min(max, Math.max(min, value));
}

function percent(form: FormData, key: string, fallback: number) {
	return boundedNumber(form, key, Math.round(fallback * 100), 0, 100) / 100;
}

export async function load({ cookies, params }) {
	const user = await requireAdmin(cookies);
	const engine = await getEngineHubEngine(params.engine);
	let settings: any = null;
	if (engine.id === 'apex') settings = await apexPolicy(user);
	if (engine.id === 'studio') settings = await getStudioAdminSettings(user);
	return { user, engine, settings };
}

export const actions = {
	save: async ({ cookies, params, request }) => {
		const user = await requireAdmin(cookies);
		const engine = await getEngineHubEngine(params.engine);
		if (!engine.installed || !engine.attached || !engine.linked) {
			return fail(409, { error: 'Install and attach this engine from Panel before changing Engine Host configuration.' });
		}

		const form = await request.formData();
		let settings: any;
		if (engine.id === 'apex') {
			const mode = String(form.get('serviceMode') || 'on_demand');
			settings = await saveApexPolicy(user, {
				serviceMode: mode === 'automatic' ? 'automatic' : 'on_demand',
				fullShutdown: checked(form, 'fullShutdown'),
				standby: checked(form, 'standby'),
				blockAutomation: checked(form, 'blockAutomation'),
				idleTimeoutMs: Math.round(boundedNumber(form, 'idleTimeoutSeconds', 10, 5, 300) * 1000)
			});
		} else if (engine.id === 'studio') {
			const current = (await getStudioAdminSettings(user)).settings;
			settings = await updateStudioAdminSettings(user, {
				routingEnabled: checked(form, 'routingEnabled'),
				routingAutoAnalyzeCreate: checked(form, 'routingAutoAnalyzeCreate'),
				routingAutoAnalyzeUpdate: checked(form, 'routingAutoAnalyzeUpdate'),
				routingMinConfidence: percent(form, 'routingMinConfidencePercent', Number(current.routingMinConfidence ?? 0.5)),
				routingProfileConfidence: percent(form, 'routingProfileConfidencePercent', Number(current.routingProfileConfidence ?? 0.5)),
				routingIncidentConfidence: percent(form, 'routingIncidentConfidencePercent', Number(current.routingIncidentConfidence ?? 0.5)),
				routingTimelineConfidence: percent(form, 'routingTimelineConfidencePercent', Number(current.routingTimelineConfidence ?? 0.5)),
				routingMaxSuggestions: Math.round(boundedNumber(form, 'routingMaxSuggestions', Number(current.routingMaxSuggestions ?? 5), 1, 20)),
				routingMaxCharacters: Math.round(boundedNumber(form, 'routingMaxCharacters', Number(current.routingMaxCharacters ?? 50000), 1000, 200000)),
				analysisPolicy: current.analysisPolicy
			});
		} else {
			return fail(400, { error: 'MCP configuration is managed through OAuth, Connections, Runtime and workspace startup/context settings.' });
		}

		await writeAudit({
			actorUserId: String(user.id),
			workspaceId: engine.workspaceId || null,
			action: `engine.${engine.id}.configuration.update`,
			targetType: 'engine',
			targetId: engine.id,
			detail: { engineHost: 'https://orbitfsengine.vercel.app' }
		});
		return { ok: true, message: `${engine.name} configuration saved.`, settings };
	}
};
