import {masterIssue,masterRequest} from "@/lib/master-api";
import {licenseDb} from "@/lib/license-api";
import {latestPanelMetadata} from "@/lib/panel-release";
import {httpError,publicReleaseSettings,requireOrbitUser} from "@/lib/orbitfs-deployment";
import {reconcileOrbitfsInstallation} from "@/lib/orbitfs-lifecycle";

function installationScore(i:any){if(!i)return 0;if(i.release_version||i.state==="ready")return 50;if(i.vercel_project_id)return 40;if(i.database_initialized_at)return 30;if(i.supabase_project_ref)return 20;return 10}
function hasBase(b:any){return b?.license_product_key==="orbitfs_base"||!!b?.components?.orbitfs_base||!!b?.components?.orbitfs_panel}
function masterBinding(l:any){return {id:String(l.id),license_id:String(l.id),customer_ref:l.customer_ref||null,order_ref:l.order_ref||null,product_code:l.product_code||"orbitfs_base",license_product_key:l.product_code||"",label:l.product_code||"OrbitFS",status:l.status||"unknown",desired_state:l.desired_state||l.status||"unknown",remote_state:l.remote_state||l.status||"unknown",expires_at:l.expires_at||null,max_installations:l.max_installations||1,components:l.components||{},metadata:l.metadata||{},license_key_last4:l.license_key_last4||null,created_at:l.created_at||null,updated_at:l.updated_at||null,source:"license-master"}}

export async function GET(req:Request){
  try{
    const {user}=await requireOrbitUser(req),db=licenseDb();
    const [settings,orders,legacyBindings,connections,installations,latestBase,latestUpdate,masterLicenses]=await Promise.all([
      publicReleaseSettings(),
      db.from("orders").select("id,order_number").eq("auth_user_id",user.id).order("created_at",{ascending:false}),
      db.from("license_bindings").select("id,license_product_key,components,label,expires_at,max_installations,metadata,order_id,api_source,desired_state,remote_state,archived_at,created_at,updated_at").eq("auth_user_id",user.id).is("archived_at",null).order("created_at",{ascending:false}),
      db.from("orbitfs_provider_connections").select("id,provider,status,provider_account_id,provider_account_name,team_id,scopes,token_expires_at,connected_at,refreshed_at,last_error,metadata").eq("auth_user_id",user.id),
      db.from("orbitfs_installations").select("*").eq("auth_user_id",user.id).order("created_at",{ascending:false}),
      latestPanelMetadata("base").catch(()=>null),latestPanelMetadata("update").catch(()=>null),
      masterRequest("/api/v1/licenses",{method:"GET"})
    ]);
    if(orders.error)throw orders.error;
    if(legacyBindings.error)throw legacyBindings.error;
    if(connections.error)throw connections.error;
    if(installations.error)throw installations.error;
    const orderRefs=new Set<string>();for(const o of orders.data||[]){if(o.id)orderRefs.add(String(o.id));if(o.order_number)orderRefs.add(String(o.order_number))}
    let rawLicenses=Array.isArray(masterLicenses?.licenses)?masterLicenses.licenses:[];
    let ownedLicenses=rawLicenses.filter((l:any)=>String(l.customer_ref||"")===String(user.id)||orderRefs.has(String(l.order_ref||"")));
    if(!ownedLicenses.length&&(legacyBindings.data||[]).length){
      for(const legacy of legacyBindings.data||[]){
        const components={...(legacy.components||{})};const key=String(legacy.license_product_key||"").toLowerCase();if(key==="orbitfs_panel")components.orbitfs_base=true;if(key==="orbitfs_sorter")components.orbitfs_apex=true;if(key.startsWith("orbitfs_"))components[key]=true;if(components.orbitfs_apex||components.orbitfs_mcp||components.orbitfs_studio)components.orbitfs_base=true;
        try{await masterIssue({orderRef:String(legacy.order_id||legacy.id),customerRef:String(user.id),productCode:"orbitfs_base",components,maxInstallations:Number(legacy.max_installations||1),expiresAt:legacy.expires_at||null,metadata:{...(legacy.metadata||{}),migratedFromBillingBinding:String(legacy.id),source:"billing_legacy_migration"}})}catch(e){console.error("OrbitFS legacy License Master migration failed",e)}
      }
      const refreshed=await masterRequest("/api/v1/licenses",{method:"GET"});rawLicenses=Array.isArray(refreshed?.licenses)?refreshed.licenses:[];ownedLicenses=rawLicenses.filter((l:any)=>String(l.customer_ref||"")===String(user.id)||orderRefs.has(String(l.order_ref||"")));
    }
    const bindingRows=ownedLicenses.map(masterBinding).sort((a:any,b:any)=>String(b.created_at||"").localeCompare(String(a.created_at||"")));
    let installationRows=installations.data||[],connectionRows=(connections.data||[]).map((x:any)=>({...x,metadata:{...(x.metadata||{})}}));
    const installByBinding=new Map<string,any>();for(const i of installationRows){const key=String(i.license_binding_id||""),current=installByBinding.get(key);if(!current||installationScore(i)>installationScore(current))installByBinding.set(key,i)}
    const preferredBinding=bindingRows.find(hasBase),preferredIndex=preferredBinding?installationRows.findIndex((x:any)=>String(x.license_binding_id||"")===String(preferredBinding.id)):-1,vercel=connectionRows.find((x:any)=>x.provider==="vercel"&&x.status==="connected");
    if(preferredIndex>=0&&installationRows[preferredIndex]?.vercel_project_id&&vercel?.metadata?.api_ready===true){const reconciled=await reconcileOrbitfsInstallation(installationRows[preferredIndex]);installationRows=installationRows.map((x:any,index:number)=>index===preferredIndex?reconciled:x)}
    const preferredInstall=preferredBinding?installationRows.find((x:any)=>String(x.license_binding_id||"")===String(preferredBinding.id)):null;
    if(preferredInstall?.vercel_project_id){connectionRows=connectionRows.map((x:any)=>x.provider==="vercel"?{...x,team_id:preferredInstall.vercel_team_id||x.team_id,metadata:{...(x.metadata||{}),team_id:preferredInstall.vercel_team_id||x.metadata?.team_id||null,teams:[],team_locked:true}}:x)}
    const ids=installationRows.map((x:any)=>x.id);let events:any[]=[];let releases:any[]=[];
    if(ids.length){const [e,r]=await Promise.all([db.from("orbitfs_deployment_events").select("*").in("installation_id",ids).order("created_at",{ascending:false}).limit(40),db.from("orbitfs_installation_releases").select("*").in("installation_id",ids).order("created_at",{ascending:false}).limit(40)]);events=e.data||[];releases=r.data||[]}
    const latest=preferredInstall?.release_version?(latestUpdate||latestBase):latestBase,slim=(x:any)=>x?{version:x.version,releaseId:x.releaseId,publishedAt:x.publishedAt,sourceCommit:x.sourceCommit,title:x.title,description:x.description,changelog:x.changelog,customerNotes:x.customerNotes,severity:x.severity,required:x.required,rollout:x.rollout,channel:x.channel}:null;
    return Response.json({settings,bindings:bindingRows,connections:connectionRows,installations:installationRows,events,releases,latestRelease:slim(latest),latestBase:slim(latestBase),latestUpdate:slim(latestUpdate)},{headers:{"cache-control":"no-store"}});
  }catch(e){return httpError(e)}
}
