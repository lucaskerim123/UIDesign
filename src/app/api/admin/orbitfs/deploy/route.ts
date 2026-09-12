import {deployPanel,httpError,loadInstallation,reconcileOrbitfsInstallation,requireOrbitAdmin,type DeployAction} from "@/lib/orbitfs-deployment";
import {latestPanelMetadata} from "@/lib/panel-release";

const allowed=new Set<DeployAction>(["deploy","update","rollback","redeploy"]);

export async function POST(req:Request){
  try{
    await requireOrbitAdmin(req);
    const body=await req.json().catch(()=>({}));
    const installationId=String(body.installationId||body.installation_id||"").trim();
    const action=String(body.action||"deploy") as DeployAction;
    if(!installationId)throw Object.assign(new Error("Installation ID is required"),{status:400});
    if(!allowed.has(action))throw Object.assign(new Error("Unsupported deployment action"),{status:400});
    let install=await loadInstallation(installationId,"",true);
    install=await reconcileOrbitfsInstallation(install);
    let version=body.version?String(body.version):undefined;
    if(action==="update"&&!version)version=(await latestPanelMetadata("update"))?.version;
    if(action==="redeploy"&&!install.release_version)throw Object.assign(new Error("The Panel is not currently deployed. Use Deploy to create a new Vercel project."),{status:409});
    return Response.json({installation:await deployPanel(install,action,version)});
  }catch(e){return httpError(e)}
}
