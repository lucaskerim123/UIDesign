import { json } from '@sveltejs/kit';
import { getMcpEngineState } from '$lib/server/mcp-engine';

export async function GET(){
	const engine = await getMcpEngineState();
	return json({
		ok: engine.mode !== 'stopped',
		service: 'orbitfs-mcp',
		mode: 'serverless',
		engineMode: engine.mode,
		generation: engine.generation,
		lastRequestAt: engine.lastRequestAt,
		filesystem: false,
		storage: 'supabase-library-memory'
	}, { status: engine.mode === 'stopped' ? 503 : 200 });
}
