import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getAddonEngineState,setAddonEngineMode } from '$lib/server/addon-engine';

function authorized(request:Request){
	const expected=String(env.ORBITFS_ENGINE_SECRET||'').trim();
	const actual=String(request.headers.get('x-orbitfs-engine-secret')||'');
	return Boolean(expected)&&actual===expected;
}
const deny=()=>json({error:'Not found'},{status:404});

export async function GET({params,request}){
	if(!authorized(request)) return deny();
	try{return json(await getAddonEngineState(String(params.addon||'')),{headers:{'cache-control':'no-store'}});}
	catch(error:any){return json({error:String(error?.message||'Engine status failed'),code:String(error?.code||'ENGINE_STATUS_FAILED')},{status:Number(error?.status||500)});}
}
export async function POST({params,request}){
	if(!authorized(request)) return deny();
	try{
		const body=await request.json().catch(()=>({}));
		const action=String(body.action||'').toLowerCase();
		if(!['running','standby','stopped','restart'].includes(action)) return json({error:'Invalid engine action'},{status:400});
		return json(await setAddonEngineMode(String(params.addon||''),action as any,String(body.actor||'main-site')));
	}catch(error:any){return json({error:String(error?.message||'Engine control failed'),code:String(error?.code||'ENGINE_CONTROL_FAILED')},{status:Number(error?.status||500)});}
}
