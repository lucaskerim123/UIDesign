import { verify } from 'node:crypto';
import { getSupabaseAdmin } from '$lib/server/supabase';

export const MCP_COMPONENT = 'orbitfs_mcp';
const LICENSE_ID = 'primary';
const ALLOWED_ENTITLEMENT_ISSUERS = new Set(['orbitfs-website', 'orbitfs.vercel.app', 'license.incendiarynetworks.cc']);
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAqAHPTGUEd1LkTFxngD5o
CiN+YbFIei69WO3PnR7OMYdtxIBShPq3PK+80zFRvhpQzpBtc+CsIQY0WPLmnC9t
RepQctzSHQg9f3sosFkw812jPZtYvwcmNAo2X3K3vzY004VUHzTk7EAHYL3wpR5J
AojFFiAcPiT2KwygOF8C0D7Dwx1TtIxHEgKREjPxwr+aRKTGahWtxRf/7qI7YpUC
ranYzNlR9J2CnDtER1dyRRvRgxOto/TuldlCcoixhmfRcZBNuYH+GgUYQIoQled3
3XWEUKBbfqSHct0mYEqksHnbblSqvxgUpH1NYG+naqlZPmwoGjlrQhDRWBJe8AsC
ZmtoHCYXPIs8MTdq7gGF+DiwGnD+H6uBX8EdZClchQKb/A6pazt0ptIM4hZsTkbT
X3sdt4/9f09lZteC+Jf4j89SeoygUmFPE8u8a9pRgm4leZg+TkmFm2PW6pW7cAsn
CZtS8cAD3AKcR99pOxTdjUOHvwWrn8rbO0NC0gwxledrAgMBAAE=
-----END PUBLIC KEY-----`;

function invalidLicense(message: string, code = 'MCP_LICENSE_REQUIRED') {
	return Object.assign(new Error(message), { status: 403, code });
}

function verifySharedEntitlement(token: string, installationId: string) {
	const parts = String(token || '').split('.');
	if (parts.length !== 3) throw invalidLicense('OrbitFS signed entitlement is invalid', 'LICENSE_SIGNATURE_INVALID');
	const [headerPart, payloadPart, signaturePart] = parts;
	const header = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf8'));
	if (header.alg !== 'RS256') throw invalidLicense('OrbitFS entitlement algorithm is unsupported', 'LICENSE_SIGNATURE_INVALID');
	const validSignature = verify(
		'RSA-SHA256',
		Buffer.from(`${headerPart}.${payloadPart}`),
		PUBLIC_KEY,
		Buffer.from(signaturePart, 'base64url')
	);
	if (!validSignature) throw invalidLicense('OrbitFS entitlement signature check failed', 'LICENSE_SIGNATURE_INVALID');
	const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8')) as Record<string, any>;
	if (!ALLOWED_ENTITLEMENT_ISSUERS.has(String(payload.iss || '')) || payload.aud !== 'orbitfs-runtime') {
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
		.select('status,metadata')
		.eq('id', LICENSE_ID)
		.maybeSingle();
	if (error) throw error;
	const metadata = row?.metadata && typeof row.metadata === 'object' ? row.metadata as Record<string, any> : {};
	const installationId = String(metadata.installationId || '');
	const entitlement = String(metadata.entitlement || '');
	if (!installationId || !entitlement) throw invalidLicense('OrbitFS MCP licence is not activated');
	const { payload, offlineGrace } = verifySharedEntitlement(entitlement, installationId);
	const component = payload.components?.[MCP_COMPONENT] ?? null;
	const allowed = Boolean(
		payload.valid === true &&
		component?.allowed === true &&
		component?.lockedToThisInstallation === true &&
		['enabled', 'locked'].includes(String(component?.state || ''))
	);
	if (!allowed) throw invalidLicense('OrbitFS MCP licence is required');
	return {
		summary: {
			valid: true,
			licensed: true,
			status: row?.status || 'active',
			installationId,
			offlineGrace,
			expiresAt: payload.exp ? new Date(Number(payload.exp) * 1000).toISOString() : null,
			components: payload.components || {}
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
