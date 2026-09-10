const masterUrl=()=>String(process.env.MASTER_API_URL||"").replace(/\/$/,"");
const token=()=>String(process.env.MASTER_API_TOKEN||"");

export async function masterRequest(path:string,init:RequestInit={}){
  const base=masterUrl();
  if(!base) throw new Error("MASTER_API_URL is not configured");
  const headers=new Headers(init.headers);
  headers.set("content-type",headers.get("content-type")||"application/json");
  const t=token();
  if(t) headers.set("authorization",`Bearer ${t}`);
  const response=await fetch(`${base}${path}`,{...init,headers,cache:"no-store"});
  const text=await response.text();
  let data:any;
  try{data=JSON.parse(text)}catch{data={error:text||"Master returned an invalid response"}}
  if(!response.ok){const error=new Error(String(data?.error||`Master request failed (${response.status})`));(error as any).status=response.status;(error as any).data=data;throw error}
  return data;
}

export async function masterValidate(body:any){
  return masterRequest("/api/v1/license/validate",{method:"POST",body:JSON.stringify(body)});
}

export async function masterIssue(body:any){
  return masterRequest("/api/v1/license/issue",{method:"POST",body:JSON.stringify(body)});
}

export async function masterControl(licenceId:string,body:any){
  return masterRequest(`/api/v1/license/${encodeURIComponent(licenceId)}/control`,{method:"POST",body:JSON.stringify(body)});
}
