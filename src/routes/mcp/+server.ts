import type { RequestHandler } from './$types';
import { handleMcpAddonRequest } from '../../addons/mcp/server/mcp-server';
import { assertAddonEngineAccepting, noteAddonRequest } from '$lib/server/addon-engine';

async function handle(request: Request) {
	try {
		await assertAddonEngineAccepting('mcp');
		void noteAddonRequest('mcp');
		const response = await handleMcpAddonRequest(request);
		if (response.status >= 400) {
			const diagnostic = await response.clone().json().catch(() => ({}));
			console.warn('[orbitfs-mcp] request rejected', {
				method: request.method,
				status: response.status,
				code: diagnostic?.code || null,
				error: diagnostic?.error || null
			});
		}
		return response;
	} catch (error:any) {
		console.warn('[orbitfs-mcp] transport unavailable', {
			method: request.method,
			status: Number(error?.status || 503),
			code: String(error?.code || 'MCP_UNAVAILABLE'),
			error: String(error?.message || 'MCP unavailable')
		});
		return new Response(JSON.stringify({ error: String(error?.message || 'MCP unavailable'), code: String(error?.code || 'MCP_UNAVAILABLE') }), {
			status: Number(error?.status || 503),
			headers: { 'content-type': 'application/json' }
		});
	}
}
export const GET: RequestHandler = async ({ request }) => handle(request);
export const POST: RequestHandler = async ({ request }) => handle(request);
export const DELETE: RequestHandler = async ({ request }) => handle(request);
