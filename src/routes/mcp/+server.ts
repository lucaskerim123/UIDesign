import type { RequestHandler } from './$types';
import { handleMcpAddonRequest } from '../../addons/mcp/server/mcp-server';

export const GET: RequestHandler = async ({ request }) => handleMcpAddonRequest(request);
export const POST: RequestHandler = async ({ request }) => handleMcpAddonRequest(request);
export const DELETE: RequestHandler = async ({ request }) => handleMcpAddonRequest(request);
