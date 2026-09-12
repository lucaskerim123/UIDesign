const base=()=>String(process.env.MASTER_API_URL||"").replace(/\/$/,"");
const token=()=>String(process.env.MASTER_API_TOKEN||"");
const timeoutMs=()=>Math.max(1000,Number(process.env.MASTER_API_TIMEOUT_MS||10000));

function requireConfig(){
  const url=base();
  if(!url)throw new Error("Master License API is not configured");
  if(!token())throw new Error("Master License API token is not configured");
  return {url,token:token()};
}

export async function masterRequest(path:string,init:RequestInit={}){
  const cfg=requireConfig();
  const headers=new Headers(init.headers);
  headers.set("authorization",`Bearer ${cfg.token}`);
  if(!headers.has("content-type")&&init.body)headers.set("content-type","application/json");
  const controller=init.signal?null:new AbortController();
  const timer=controller?setTimeout(()=>controller.abort(),timeoutMs()):null;
  try{
    const response=await fetch(`${cfg.url}${path}`,{...init,headers,cache:"no-store",signal:init.signal||controller?.signal});
    const text=await response.text();
    let data:any={};
    try{data=text?JSON.parse(text):{}}catch{data={error:text||"Master API returned an invalid response"}}
    if(!response.ok)throw Object.assign(new Error(data?.error||`Master API request failed (${response.status})`),{status:response.status,code:data?.code});
    return data;
  }catch(error){
    if(error instanceof Error&&error.name==="AbortError")throw new Error(`Master API request timed out after ${timeoutMs()}ms`);
    throw error;
  }finally{
    if(timer)clearTimeout(timer);
  }
}

export async function masterBinaryRequest(path:string,init:RequestInit={}):Promise<{bytes:Buffer;contentType:string;headers:Headers}>{
  const cfg=requireConfig();
  const headers=new Headers(init.headers);
  headers.set("authorization",`Bearer ${cfg.token}`);
  const controller=init.signal?null:new AbortController();
  const timer=controller?setTimeout(()=>controller.abort(),timeoutMs()):null;
  try{
    const response=await fetch(`${cfg.url}${path}`,{...init,headers,cache:"no-store",signal:init.signal||controller?.signal});
    if(!response.ok){
      const text=await response.text();
      let message=text||`Master API request failed (${response.status})`;
      try{message=JSON.parse(text)?.error||message}catch{}
      throw Object.assign(new Error(message),{status:response.status});
    }
    return {bytes:Buffer.from(await response.arrayBuffer()),contentType:response.headers.get("content-type")||"application/octet-stream",headers:response.headers};
  }catch(error){
    if(error instanceof Error&&error.name==="AbortError")throw new Error(`Master API request timed out after ${timeoutMs()}ms`);
    throw error;
  }finally{
    if(timer)clearTimeout(timer);
  }
}

export async function masterLicenseValidate(input:any){
  return masterRequest("/api/v1/license/validate",{method:"POST",body:JSON.stringify({
    licenseKey:input.licenseKey||input.license_key,
    installationId:input.installationId||input.installation_id,
    components:input.components||null,
    activate:!!input.activate,
    deviceName:input.deviceName||null,
    platform:input.platform||null,
    appVersion:input.appVersion||null
  })});
}

export async function masterHealth(){return masterRequest("/health",{method:"GET"});}
export async function masterPublicKey(){return masterRequest("/api/v1/license/public-key",{method:"GET"});}

export async function masterExecuteDeployment(input:any){
  return masterRequest("/api/v1/deployments/execute",{method:"POST",body:JSON.stringify(input)});
}
export async function masterSyncDeployment(input:any){
  return masterRequest("/api/v1/deployments/sync",{method:"POST",body:JSON.stringify(input)});
}
export const masterValidate=masterLicenseValidate;
export async function masterIssue(input:any){return masterRequest("/api/v1/license/issue",{method:"POST",body:JSON.stringify(input)})}
export async function masterControl(id:string,input:any){return masterRequest(`/api/v1/license/${encodeURIComponent(id)}/control`,{method:"POST",body:JSON.stringify(input)})}
export async function masterReleases(){return masterRequest("/api/v1/releases",{method:"GET"})}
export async function masterCreateRelease(input:any){return masterRequest("/api/v1/releases",{method:"POST",body:JSON.stringify(input)})}
export async function masterPublishRelease(id:string){return masterRequest(`/api/v1/releases/${encodeURIComponent(id)}/publish`,{method:"POST"})}
export async function masterControlRelease(id:string,status:string){return masterRequest(`/api/v1/releases/${encodeURIComponent(id)}/control`,{method:"POST",body:JSON.stringify({action:status})})}
export async function masterUploadReleaseArtifact(id:string,bytes:Buffer,contentType="application/octet-stream"){
  return masterRequest(`/api/v1/releases/${encodeURIComponent(id)}/artifact`,{method:"POST",headers:{"content-type":contentType,"x-artifact-sha256":(await import("node:crypto")).createHash("sha256").update(bytes).digest("hex")},body:new Uint8Array(bytes)});
}
export async function masterDownloadReleaseArtifact(id:string){
  return masterBinaryRequest(`/api/v1/releases/${encodeURIComponent(id)}/artifact`,{method:"GET"});
}
