const base=()=>String(process.env.MASTER_API_URL||"").replace(/\/$/,"");
const token=()=>String(process.env.MASTER_API_TOKEN||"");

export async function masterRequest(path:string,init:RequestInit={}){
  const url=base();
  if(!url)throw new Error("Master License API is not configured");
  const headers=new Headers(init.headers);
  headers.set("authorization",`Bearer ${token()}`);
  if(!headers.has("content-type")&&init.body)headers.set("content-type","application/json");
  const response=await fetch(`${url}${path}`,{...init,headers,cache:"no-store"});
  const text=await response.text();
  let data:any={};
  try{data=text?JSON.parse(text):{}}catch{data={error:text||"Master API returned an invalid response"}}
  if(!response.ok)throw Object.assign(new Error(data?.error||`Master API request failed (${response.status})`),{status:response.status,code:data?.code});
  return data;
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
