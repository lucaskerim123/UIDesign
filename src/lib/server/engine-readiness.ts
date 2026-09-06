import { getEngineHubEngine } from '$lib/server/engine-hub';

export type EngineReadinessCheck = {
	id: string;
	label: string;
	description: string;
	ok: boolean;
	required: boolean;
};

export async function getEngineReadiness(engineId: string) {
	const engine: any = await getEngineHubEngine(engineId);
	const checks: EngineReadinessCheck[] = [
		{
			id: 'registered',
			label: 'Engine registered',
			description: 'The engine exists in the shared OrbitFS add-on registry.',
			ok: engine.registered === true,
			required: true
		},
		{
			id: 'installed',
			label: 'Installed from Panel',
			description: 'OrbitFS Panel has installed this engine for the current installation.',
			ok: engine.installed === true,
			required: true
		},
		{
			id: 'licensed',
			label: 'Licence entitlement',
			description: 'The canonical OrbitFS licence allows this engine on this installation.',
			ok: engine.licensed === true,
			required: true
		},
		{
			id: 'attached',
			label: 'Attached in Panel',
			description: 'The engine has been attached from OrbitFS Panel.',
			ok: engine.attached === true,
			required: true
		},
		{
			id: 'linked',
			label: 'Panel link confirmed',
			description: 'Panel and Engine Host agree on the installation and workspace pairing.',
			ok: engine.linked === true,
			required: true
		},
		{
			id: 'workspace',
			label: 'Workspace assigned',
			description: 'The Engine Host link points at a valid shared OrbitFS workspace.',
			ok: Boolean(engine.workspaceId),
			required: true
		},
		{
			id: 'configuration',
			label: 'Configuration reviewed',
			description: engine.id === 'mcp'
				? 'An administrator reviewed MCP connection, OAuth and runtime configuration for this Engine Host.'
				: `An administrator reviewed the current ${engine.name} Engine Host configuration.`,
			ok: Boolean(engine.configurationReviewedAt),
			required: true
		},
		{
			id: 'runtime',
			label: 'Runtime available',
			description: 'The engine runtime is available. It may remain in Standby after setup.',
			ok: engine.available !== false && engine.state?.deployment !== 'error',
			required: true
		}
	];

	if (engine.id === 'mcp') {
		checks.push({
			id: 'transport',
			label: 'MCP transport configured',
			description: 'The MCP transport remains available at /mcp on this Engine Host.',
			ok: engine.transportPath === '/mcp',
			required: true
		});
	}

	const blocking = checks.filter((check) => check.required && !check.ok);
	return {
		engine,
		checks,
		ready: blocking.length === 0,
		blocking: blocking.map((check) => check.id)
	};
}
