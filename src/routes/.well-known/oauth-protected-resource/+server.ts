import { json } from '@sveltejs/kit';
import { MCP_RESOURCE, OAUTH_ISSUER } from '$lib/server/mcp-oauth';

export function GET({ url }: any) {
  return json({
    resource: MCP_RESOURCE || url.origin + '/mcp',
    authorization_servers: [OAUTH_ISSUER],
    bearer_methods_supported: ['header'],
    scopes_supported: ['orbitfs:read','orbitfs:write','offline_access'],
    resource_documentation: 'https://orbitfsproject.vercel.app/admin/mcp/settings'
  });
}
