import { json } from '@sveltejs/kit';
import { authorizeEngineHostRequest } from '$lib/server/engine-host-link';
import { ensureInstallationIdentity } from '$lib/server/license';
import { listEngineHubEngines } from '$lib/server/engine-hub';

export async function GET({ request }) {
	if (!authorizeEngineHostRequest(request)) {
		return json({ ok: false, error: 'Unauthorized', code: 'ENGINE_HOST_UNAUTHORIZED' }, { status: 401 });
	}

	try {
		const [installationId, engines] = await Promise.all([
			ensureInstallationIdentity(),
			listEngineHubEngines()
		]);
		return json({
			ok: true,
			service: 'orbitfs-engine-host',
			version: 2,
			installationId,
			storage: 'supabase',
			filesystem: false,
			engines: engines.map((engine) => ({
				id: engine.id,
				installed: engine.installed,
				attached: engine.attached,
				licensed: engine.licensed,
				linked: engine.linked,
				setupState: engine.setupState,
				engineState: engine.engineState,
				workspaceId: engine.workspaceId,
				lastSyncAt: engine.lastSyncAt,
				transportPath: engine.transportPath
			}))
		});
	} catch (error: any) {
		return json({ ok: false, error: error?.message || 'Engine Host status failed', code: error?.code || 'ENGINE_HOST_STATUS_FAILED' }, { status: Number(error?.status || 500) });
	}
}
