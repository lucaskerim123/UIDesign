import {cors,reply} from "@/lib/license-api";
import {masterRequest} from "@/lib/master-api";

export async function GET(){
  try{
    const master=await masterRequest("/health");
    return reply({ok:true,service:"OrbitFS Website → Master",master});
  }catch(error:any){
    return reply({ok:false,service:"OrbitFS Website → Master",masterAvailable:false,error:error?.message||"Master unavailable"},502);
  }
}

export async function OPTIONS(){return new Response(null,{status:204,headers:cors})}
