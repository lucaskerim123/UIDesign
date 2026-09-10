import {bodyOf,cors,reply} from "@/lib/license-api";
import {masterValidate} from "@/lib/master-api";
import {compatibleComponentList} from "@/lib/license-components";

export async function POST(req:Request){
  const b=await bodyOf(req);
  try{return reply(await masterValidate({
    licenseKey:b.licenseKey||b.license_key,
    installationId:b.installationId||b.installation_id,
    components:compatibleComponentList(b.components),
    activate:true,
    deviceName:b.deviceName||null,
    platform:b.platform||null,
    appVersion:b.appVersion||null
  }))}
  catch(error:any){return reply(error?.data||{error:error?.message||"Master licence activation failed",code:"MASTER_LICENSE_ACTIVATION_ERROR"},error?.status||502)}
}

export async function OPTIONS(){return new Response(null,{status:204,headers:cors})}
