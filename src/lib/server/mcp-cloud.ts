import { getSupabaseAdmin } from '$lib/server/supabase';

export const MCP_COMPONENT = 'orbitfs_mcp';
const LICENSE_ID = 'primary';
const DEFAULT_PROVIDER = 'https://orbitfs.vercel.app/api/license/v1';
const ALLOWED_PROVIDERS = new Set([DEFAULT_PROVIDER]);
const ALLOWED_ISSUERS = new Set(['orbitfs-website', 'orbitfs.vercel.app', 'license.incendiarynetworks.cc']);

function invalidLicense(message: string, code = 'MCP_LICENSE_REQUIRED', status = 403) {
	return Object.assign(new Error(message), { status, code });
}

function providerFromMetadata(metadata: Record<string, any>) {
	const configured = String(metadata.providerBase || DEFAULT_PROVIDER).replace(/\/$/, '');
	if (!ALLOWED_PROVIDERS.has(configured)) {
		throw invalidLicense('OrbitFS licence provider is not approved', 'LICENSE_PROVIDER_NOT_ALLOWED');
	}
	return configured;
}

function readPanelValidatedEntitlement(token: string, installationId: string) {
	const parts = String(token || '').split('.');
	if (parts.length !== 3) throw invalidLicense('OrbitFS signed entitlement is invalid', 'LICENSE_ENTITLEMENT_INVALID');
	const [headerPart, payloadPart] = parts;
	let header: Record<string, any>;
	let payload: Record<string, any>;
	try {
		header = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf8'));
		payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
	} catch {
		throw invalidLicense('OrbitFS signed entitlement is invalid', 'LICENSE_ENTITLEMENT_INVALID');
	}
	if (header.alg !== 'RS256') throw invalidLicense('OrbitFS entitlement algorithm is unsupported', 'LICENSE_ENTITLEMENT_INVALID');
	if (!ALLOWED_ISSUERS.has(String(payload.iss || '')) || payload.aud !== 'orbitfs-runtime') {
		throw invalidLicense('OrbitFS entitlement issuer or audience is invalid', 'LICENSE_ENTITLEMENT_INVALID');
	}
	if (String(payload.installationId || '') !== installationId) {
		throw invalidLicense('OrbitFS entitlement belongs to another installation', 'LICENSE_INSTALLATION_MISMATCH');
	}
	const now = Math.floor(Date.now() / 1000);
	const exp = Number(payload.exp || 0);
	const graceUntil = Number(payload.graceUntil || 0);
	if (!exp || (now > exp && (!graceUntil || now > graceUntil))) {
		throw invalidLicense('OrbitFS signed entitlement has expired', 'LICENSE_ENTITLEMENT_EXPIRED');
	}
	return { payload, offlineGrace: now > exp };
}

export async function assertMcpLicensed() {
	const db = getSupabaseAdmin();
	const { data: row, error } = await db
		.from('orbitfs_license')
		.select('status,expires_at,metadata')
		.eq('id', LICENSE_ID)
		.maybeSingle();
	if (error) throw error;
	if (!row || String(row.status || '').toLowerCase() !== 'active') {
		throw invalidLicense('OrbitFS licence is not active');
	}
	const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata as Record<string, any> : {};
	const installationId = String(metadata.installationId || '');
	const entitlement = String(metadata.entitlement || '');
	const lastCheckedAt = String(metadata.lastCheckedAt || '');
	if (!installationId || !entitlement || !lastCheckedAt) {
		throw invalidLicense('OrbitFS MCP licence is not activated');
	}
	const providerBase = providerFromMetadata(metadata);
	// Orbitconvert is the licence authority. It verifies the provider signature before persisting
	// this entitlement into the shared Supabase row. The MCP host deliberately does not perform
	// a second provider validation or key fetch; it enforces the trusted Panel state and claims.
	const { payload, offlineGrace } = readPanelValidatedEntitlement(entitlement, installationId);
	const component = payload.components?.[MCP_COMPONENT] ?? null;
	const allowed = Boolean(
		payload.valid === true &&
		component?.allowed === true &&
		component?.lockedToThisInstallation === true &&
		['enabled', 'locked'].includes(String(component?.state || ''))
	);
	if (!allowed) throw invalidLicense(String(component?.reason || 'OrbitFS MCP licence is required'));
	return {
		summary: {
			valid: true,
			licensed: true,
			status: row.status,
			installationId,
			offlineGrace,
			expiresAt: payload.exp ? new Date(Number(payload.exp) * 1000).toISOString() : row.expires_at || null,
			lastCheckedAt,
			components: payload.components || {},
			providerBase
		},
		component
	};
}

export async function getMcpAddonRow() {
	const db = getSupabaseAdmin();
	const { data, error } = await db.from('orbitfs_addons').select('*').eq('id', 'mcp').maybeSingle();
	if (error) throw error;
	return data;
}

export async function auditMcp(eventType: string, details: Record<string, unknown> = {}, actorUserId: string | null = null, scopeId = 'public') {
	const db = getSupabaseAdmin();
	await db.from('mcp_audit_log').insert({ scope_id: scopeId, actor_user_id: actorUserId, event_type: eventType, details });
}
