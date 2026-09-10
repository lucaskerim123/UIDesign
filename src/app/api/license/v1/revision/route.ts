import {masterRequest} from "@/lib/master-api";

export async function GET(){
  try{return Response.json(await masterRequest("/api/v1/license/revision"))}
  catch(e:any){return Response.json({error:e.message||"License Master unavailable"},{status:e.status||503})}
}
export async function OPTIONS(){return new Response(null,{status:204})}
