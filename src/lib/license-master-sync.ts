import {licenseDb} from "@/lib/license-api";
import {masterIssue} from "@/lib/master-api";

function canonicalComponent(value:any){const key=String(value||"").trim().toLowerCase();if(key==="orbitfs_panel")return "orbitfs_base";if(key==="orbitfs_sorter")return "orbitfs_apex";return key}

export async function syncPaidOrderToLicenseMaster(orderId:string){
  const db=licenseDb();
  const {data:order,error:orderError}=await db.from("orders").select("id,order_number,auth_user_id,status,payment_status,fulfillment_status").eq("id",orderId).maybeSingle();
  if(orderError)throw orderError;
  if(!order)return {ok:false,skipped:true,reason:"order_not_found"};
  if(!["paid","active"].includes(String(order.payment_status||order.status||"").toLowerCase())&&String(order.status||"").toLowerCase()!=="active")return {ok:false,skipped:true,reason:"order_not_paid"};
  const {data:items,error:itemError}=await db.from("order_items").select("id,product_id,license_product_key,configuration").eq("order_id",orderId).order("id");
  if(itemError)throw itemError;
  const components:Record<string,boolean>={};
  for(const item of items||[]){const key=canonicalComponent(item.license_product_key);if(key.startsWith("orbitfs_"))components[key]=true;}
  if(!Object.keys(components).length)return {ok:true,skipped:true,reason:"no_orbitfs_entitlement"};
  if(components.orbitfs_apex||components.orbitfs_mcp||components.orbitfs_studio)components.orbitfs_base=true;
  const result=await masterIssue({orderRef:String(order.id),customerRef:String(order.auth_user_id||""),productCode:"orbitfs_base",components,maxInstallations:1,metadata:{billingOrderId:String(order.id),orderNumber:String(order.order_number||""),source:"v2_billing_store"}});
  return {ok:true,orderId:String(order.id),masterLicense:result?.licence||result?.license||null,result};
}
