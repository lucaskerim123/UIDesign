import { json } from '@sveltejs/kit';
import { MCP_RESOURCE, OAUTH_ISSUER } from '$lib/server/mcp-oauth';

export function GET() {
	return json({
		resource: MCP_RESOURCE,
		authorization_servers: [OAUTH_ISSUER],
		bearer_methods_supported: ['header'],
		scopes_supported: ['orbitfs:read', 'orbitfs:write', 'offline_access'],
		resource_documentation: 'https://orbitconvert.vercel.app/admin/mcp/settings'
	});
}
