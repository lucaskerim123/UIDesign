import type { RequestHandler } from './$types';
import { handleMcpAddonRequest } from '../../addons/mcp/server/mcp-server';
import { assertAddonEngineAccepting, noteAddonRequest } from '$lib/server/addon-engine';

function mirrorOrbitfsUiState(payload: any) {
	const result = payload?.result;
	if (!result || typeof result !== 'object') return payload;
	const uiState = result?._meta?.orbitfsUiState;
	if (!uiState || typeof uiState !== 'object') return payload;
	const existing = result.structuredContent && typeof result.structuredContent === 'object' ? result.structuredContent : {};
	result.structuredContent = {
		...existing,
		...uiState,
		workspaceId: existing.workspaceId ?? uiState.workspaceId,
		orbitfsUiState: uiState
	};
	return payload;
}

async function exposeWidgetState(response: Response) {
	const contentType = response.headers.get('content-type') || '';
	if (!contentType.includes('application/json') || response.status === 204) return response;
	const text = await response.clone().text();
	if (!text) return response;
	let payload: any;
	try {
		payload = JSON.parse(text);
	} catch {
		return response;
	}
	const enriched = mirrorOrbitfsUiState(payload);
	const headers = new Headers(response.headers);
	headers.set('content-type', 'application/json; charset=utf-8');
	headers.delete('content-length');
	return new Response(JSON.stringify(enriched), {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}

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
		return exposeWidgetState(response);
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
