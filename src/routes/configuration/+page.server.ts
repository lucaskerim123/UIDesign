import { env } from '$env/dynamic/private';
import { requireAdmin } from '$lib/server/auth';
import { accessibleWorkspaces } from '$lib/server/base-compat';
import { listEngineHubEngines } from '$lib/server/engine-hub';
import { ensureInstallationIdentity, getLicenseProviderSettings, getPanelLicenseSummary } from '$lib/server/license';

function cleanHttps(value: string, fallback: string) {
	try {
		const parsed = new URL(String(value || fallback).trim());
		if (parsed.protocol !== 'https:') throw new Error();
		return `${parsed.protocol}//${parsed.host}`;
	} catch {
		return fallback;
	}
}

export async function load({ cookies, url }) {
	const user = await requireAdmin(cookies);
	const [engines, workspaces, installationId, licenseProvider, license] = await Promise.all([
		listEngineHubEngines(),
		accessibleWorkspaces(user),
		ensureInstallationIdentity(),
		getLicenseProviderSettings(),
		getPanelLicenseSummary()
	]);

	const panelUrl = cleanHttps(String(env.ORBITFS_PANEL_URL || ''), 'https://orbitfs.vercel.app');
	const engineHostUrl = cleanHttps(String(env.ORBITFS_ENGINE_HOST_URL || ''), 'https://orbitfsengine.vercel.app');
	const mainWorkspace = workspaces.find((workspace: any) => workspace.is_main) || workspaces[0] || null;
	const dedicatedEngineSecret = Boolean(String(env.ORBITFS_ENGINE_SECRET || '').trim());
	const databaseSecret = Boolean(String(env.ORBITFS_DB_SECRET || '').trim());
	const engineSecretConfigured = dedicatedEngineSecret || databaseSecret;
	const engineSecretSource = dedicatedEngineSecret ? 'dedicated' : databaseSecret ? 'database_fallback' : 'missing';
	const supabaseConfigured = Boolean(
		String(env.SUPABASE_URL || '').trim() &&
		String(env.SUPABASE_PUBLISHABLE_KEY || '').trim() &&
		databaseSecret
	);
	const currentOrigin = cleanHttps(url.origin, engineHostUrl);
	const vercelEnvironment = String(env.VERCEL_ENV || 'local').toLowerCase();
	const branch = String(env.VERCEL_GIT_COMMIT_REF || '').trim() || null;

	return {
		user,
		engines,
		installationId,
		mainWorkspace,
		workspaceCount: workspaces.length,
		services: {
			panelUrl,
			engineHostUrl,
			mcpUrl: `${engineHostUrl}/mcp`,
			licenseProvider: licenseProvider.providerBase
		},
		deployment: {
			environment: vercelEnvironment,
			branch,
			currentOrigin,
			canonicalOrigin: engineHostUrl,
			canonical: currentOrigin === engineHostUrl
		},
		backend: {
			compute: 'Vercel / SvelteKit',
			database: 'Supabase Postgres',
			storage: 'Supabase Storage',
			filesystem: 'Virtual OrbitFS Library paths backed by Supabase',
			supabaseConfigured,
			engineSecretConfigured,
			engineSecretSource
		},
		license: {
			licensed: license.licensed,
			status: license.status,
			plan: license.plan,
			licensedTo: license.licensedTo,
			expiresAt: license.expiresAt,
			lastCheckedAt: license.lastCheckedAt
		}
	};
}
