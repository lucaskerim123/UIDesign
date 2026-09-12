import {licenseDb} from "@/lib/license-api";
import {httpError,latestPanelMetadata,releaseSettings,requireOrbitAdmin} from "@/lib/orbitfs-deployment";
import {listPanelReleases} from "@/lib/panel-release";

export async function GET(req:Request){
  try{
    await requireOrbitAdmin(req);
    const db=licenseDb();
    const [{data:installations,error:installError},{data:profiles,error:profileError}]=await Promise.all([
      db.from("orbitfs_installations").select("*").order("created_at",{ascending:false}),
      db.from("user_profiles").select("id,display_name,company_name,email,status")
    ]);
    if(installError)throw installError;
    if(profileError)throw profileError;
    const profileMap=new Map((profiles||[]).map((p:any)=>[p.id,p]));
    const releases=await listPanelReleases();
    const settings=await releaseSettings();
    return Response.json({
      installations:(installations||[]).map((i:any)=>({...i,customer:profileMap.get(i.auth_user_id)||null})),
      releases,
      latestBase:await latestPanelMetadata("base"),
      latestUpdate:await latestPanelMetadata("update"),
      settings:{enabled:settings.enabled,customer_deploy_enabled:settings.customer_deploy_enabled,customer_updates_enabled:settings.customer_updates_enabled,customer_rollbacks_enabled:settings.customer_rollbacks_enabled,release_channel:settings.release_channel}
    });
  }catch(e){return httpError(e)}
}
