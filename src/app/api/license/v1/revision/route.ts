import {cors,reply} from "@/lib/license-api";
import {masterRequest} from "@/lib/master-api";
export async function GET(){try{return reply(await masterRequest("/health"))}catch(e:any){return reply({error:e?.message||"Master unavailable",code:"MASTER_UNAVAILABLE"},e?.status||502)}}
export async function OPTIONS(){return new Response(null,{status:204,headers:cors})}
