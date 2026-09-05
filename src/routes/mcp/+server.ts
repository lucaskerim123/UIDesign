import type { RequestHandler } from './$types';
import { handleMcpAddonRequest } from '../../addons/mcp/server/mcp-server';
import { assertMcpEngineAccepting, noteMcpRequest } from '$lib/server/mcp-engine';

async function handle(request: Request) {
	try {
		await assertMcpEngineAccepting();
		void noteMcpRequest();
		return await handleMcpAddonRequest(request);
	} catch (error:any) {
		return new Response(JSON.stringify({ error: String(error?.message || 'MCP unavailable'), code: String(error?.code || 'MCP_UNAVAILABLE') }), {
			status: Number(error?.status || 503),
			headers: { 'content-type': 'application/json' }
		});
	}
}
export const GET: RequestHandler = async ({ request }) => handle(request);
export const POST: RequestHandler = async ({ request }) => handle(request);
export const DELETE: RequestHandler = async ({ request }) => handle(request);
