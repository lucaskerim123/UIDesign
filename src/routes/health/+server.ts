import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getAddonEngineState } from '$lib/server/addon-engine';

export async function GET({request}){
	const expected=String(env.ORBITFS_ENGINE_SECRET||env.ORBITFS_DB_SECRET||'').trim();
	if(!expected || request.headers.get('x-orbitfs-engine-secret')!==expected) return json({error:'Not found'},{status:404});
	const engine=await getAddonEngineState('mcp');
	return json({ok:engine.mode!=='stopped',service:'orbitfs-engine-host',addon:'mcp',version:'1.5.0',toolCount:67,standardToolCount:64,appToolCount:3,engine},{status:engine.mode==='stopped'?503:200});
}