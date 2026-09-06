import { getSupabaseAdmin } from '$lib/server/supabase';

export type EngineMode = 'running'|'standby'|'stopped';
export type EngineSetupState = 'not_started'|'required'|'in_progress'|'complete'|'error';

function objectValue(value: unknown): Record<string, any> {
	return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

function resolveSetupState(data:any,runtime:Record<string,any>):EngineSetupState {
	const candidate=String(runtime.setupState||'');
	if((['not_started','required','in_progress','complete','error'] as string[]).includes(candidate)) return candidate as EngineSetupState;
	if(data.configured===true) return 'complete';
	if(data.attached===true) return 'required';
	return 'not_started';
}

export async function getAddonEngineState(addonId:string) {
	const db=getSupabaseAdmin();
	const {data,error}=await db.from('orbitfs_addons').select('id,name,runtime,config,installed,attached,configured,available,updated_at').eq('id',addonId).maybeSingle();
	if(error) throw error;
	if(!data) throw Object.assign(new Error('Unknown add-on engine'),{status:404,code:'ENGINE_NOT_FOUND'});
	const runtime=objectValue(data.runtime);
	const config=objectValue(data.config);
	const link=objectValue(config.engineHostLink);
	const mode=(['running','standby','stopped'] as string[]).includes(String(runtime.engineMode))?String(runtime.engineMode) as EngineMode:'standby';
	const setupState=resolveSetupState(data,runtime);
	return {
		addonId:data.id,
		name:data.name,
		mode,
		setupState,
		setupVersion:Number(runtime.setupVersion||1),
		linked:runtime.engineHostLinked===true&&link.state==='linked',
		linkState:String(link.state||'unlinked'),
		panelUrl:link.panelUrl||runtime.panelUrl||null,
		workspaceId:link.workspaceId||runtime.workspaceId||null,
		workspaceName:link.workspaceName||null,
		installationId:link.installationId||null,
		generation:Number(runtime.generation||1),
		lastRequestAt:runtime.lastRequestAt||null,
		lastControlAt:runtime.lastControlAt||null,
		lastControlBy:runtime.lastControlBy||null,
		lastLinkSyncAt:runtime.lastLinkSyncAt||link.lastSyncAt||null,
		lastError:runtime.lastError||null,
		deployment:runtime.deployment||'ready',
		transport:runtime.transport||(addonId==='mcp'?'/mcp':null),
		compute:runtime.compute||'vercel',
		database:runtime.database||'supabase',
		installed:data.installed===true,
		attached:data.attached===true,
		configured:data.configured===true,
		available:data.available===true,
		updatedAt:data.updated_at||null
	};
}

export async function setAddonEngineMode(addonId:string,action:EngineMode|'restart',actor:string|null=null){
	const db=getSupabaseAdmin();
	const current=await getAddonEngineState(addonId);
	const now=new Date().toISOString();
	const nextMode:EngineMode=action==='restart'?'running':action;
	const {data:row,error:readError}=await db.from('orbitfs_addons').select('runtime').eq('id',addonId).maybeSingle();
	if(readError) throw readError;
	const runtime=objectValue(row?.runtime);
	const next={
		...runtime,
		engineMode:nextMode,
		generation:action==='restart'?current.generation+1:current.generation,
		lastControlAt:now,
		lastControlBy:actor,
		lastError:null,
		online:nextMode!=='stopped',
		deployment:'ready',
		compute:'vercel',
		database:'supabase'
	};
	const {error}=await db.from('orbitfs_addons').update({runtime:next,updated_at:now}).eq('id',addonId);
	if(error) throw error;
	return getAddonEngineState(addonId);
}

export async function noteAddonRequest(addonId:string){
	const db=getSupabaseAdmin();
	const now=new Date().toISOString();
	const {data:row}=await db.from('orbitfs_addons').select('runtime').eq('id',addonId).maybeSingle();
	const runtime=objectValue(row?.runtime);
	await db.from('orbitfs_addons').update({runtime:{...runtime,lastRequestAt:now},updated_at:now}).eq('id',addonId);
}

export async function assertAddonEngineAccepting(addonId:string){
	const state=await getAddonEngineState(addonId);
	if(state.mode==='stopped') throw Object.assign(new Error(`OrbitFS ${addonId} engine is stopped`),{status:503,code:'ENGINE_STOPPED'});
	return state;
}
