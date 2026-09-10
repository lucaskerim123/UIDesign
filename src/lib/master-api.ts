const masterUrl=()=>String(process.env.MASTER_API_URL||"").replace(/\/$/,"");
const token=()=>String(process.env.MASTER_API_TOKEN||"");
export async function masterRequest(path:string,init:RequestInit={}){const base=masterUrl();if(!base)throw new Error("MASTER_API_URL is not configured");const headers=new Headers(init.headers);if(init.body&&!headers.has("content-type"))headers.set("content-type","application/json");const t=token();if(t)headers.set("authorization",`Bearer ${t}`);const response=await fetch(`${base}${path}`,{...init,headers,cache:"no-store"});const text=await response.text();let data:any;try{data=JSON.parse(text)}catch{data={error:text||"Master returned an invalid response"}}if(!response.ok)throw Object.assign(new Error(String(data?.error||`Master request failed (${response.status})`)),{status:response.status,data});return data}
export async function masterValidate(body:any){return masterRequest("/api/v1/license/validate",{method:"POST",body:JSON.stringify(body)})}
export async function masterIssue(body:any){return masterRequest("/api/v1/license/issue",{method:"POST",body:JSON.stringify(body)})}
export async function masterControl(licenceId:string,body:any){return masterRequest(`/api/v1/license/${encodeURIComponent(licenceId)}/control`,{method:"POST",body:JSON.stringify(body)})}
export async function masterReleases(){return masterRequest("/api/v1/releases",{method:"GET"})}
export async function masterCreateRelease(body:any){return masterRequest("/api/v1/releases",{method:"POST",body:JSON.stringify(body)})}
export async function masterPublishRelease(id:string){return masterRequest(`/api/v1/releases/${encodeURIComponent(id)}/publish`,{method:"POST",body:"{}"})}
export async function masterControlRelease(id:string,status:string){return masterRequest(`/api/v1/releases/${encodeURIComponent(id)}/control`,{method:"POST",body:JSON.stringify({status})})}
export async function masterUploadReleaseArtifact(id:string,bytes:Buffer,contentType="application/octet-stream"){
  const base=masterUrl();if(!base)throw new Error("MASTER_API_URL is not configured");const headers=new Headers({"content-type":contentType});const t=token();if(t)headers.set("authorization",`Bearer ${t}`);
  const response=await fetch(`${base}/api/v1/releases/${encodeURIComponent(id)}/artifact`,{method:"POST",headers,body:new Uint8Array(bytes),cache:"no-store"});const text=await response.text();let data:any;try{data=JSON.parse(text)}catch{data={error:text||"Master returned an invalid response"}}if(!response.ok)throw Object.assign(new Error(String(data?.error||"Master artifact upload failed")),{status:response.status,data});return data;
}
