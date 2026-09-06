import { fail } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth';
import { writeAudit } from '$lib/server/audit';
import { apexPolicy, saveApexPolicy } from '$lib/server/apex-cloud';
import { getEngineHubEngine } from '$lib/server/engine-hub';
import { getStudioAdminSettings, updateStudioAdminSettings } from '$lib/server/studio-cloud';

function checked(form: FormData, key: string) {
	return form.get(key) === 'on' || form.get(key) === 'true';
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
			return fail(409,{error:'Install and attach this engine from Panel before changing Engine Host configuration.'});
		}
		const form = await request.formData();
		let settings: any;
		if (engine.id === 'apex') {
			settings = await saveApexPolicy(user,{
				serviceMode:String(form.get('serviceMode') || 'on_demand'),
				fullShutdown:checked(form,'fullShutdown'),
				standby:checked(form,'standby'),
				blockAutomation:checked(form,'blockAutomation'),
				idleTimeoutMs:Number(form.get('idleTimeoutMs') || 10000)
			});
		} else if (engine.id === 'studio') {
			const current=(await getStudioAdminSettings(user)).settings;
			settings = await updateStudioAdminSettings(user,{
				routingEnabled:checked(form,'routingEnabled'),
				routingAutoAnalyzeCreate:checked(form,'routingAutoAnalyzeCreate'),
				routingAutoAnalyzeUpdate:checked(form,'routingAutoAnalyzeUpdate'),
				routingMinConfidence:Number(form.get('routingMinConfidence') ?? current.routingMinConfidence),
				routingProfileConfidence:Number(form.get('routingProfileConfidence') ?? current.routingProfileConfidence),
				routingIncidentConfidence:Number(form.get('routingIncidentConfidence') ?? current.routingIncidentConfidence),
				routingTimelineConfidence:Number(form.get('routingTimelineConfidence') ?? current.routingTimelineConfidence),
				routingMaxSuggestions:Number(form.get('routingMaxSuggestions') ?? current.routingMaxSuggestions),
				routingMaxCharacters:Number(form.get('routingMaxCharacters') ?? current.routingMaxCharacters),
				analysisPolicy:current.analysisPolicy
			});
		} else {
			return fail(400,{error:'MCP configuration is managed through OAuth, Connections, Runtime and workspace startup/context settings.'});
		}
		await writeAudit({
			actorUserId:String(user.id),
			workspaceId:engine.workspaceId || null,
			action:`engine.${engine.id}.configuration.update`,
			targetType:'engine',
			targetId:engine.id,
			detail:{engineHost:'https://orbitfsengine.vercel.app'}
		});
		return {ok:true,message:`${engine.name} configuration saved.`,settings};
	}
};
