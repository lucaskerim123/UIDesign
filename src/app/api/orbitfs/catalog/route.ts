import {licenseDb,reply} from "@/lib/license-api";
import {masterRequest} from "@/lib/master-api";

export const dynamic="force-dynamic";

export async function GET(req:Request){
  try{
    const master=await masterRequest("/api/products",{method:"GET"});
    const products=Array.isArray(master?.products)?master.products:[];
    const db=licenseDb();
    const {data:local,error}=await db.from("products").select("*").in("license_product_key",products.map((p:any)=>String(p.code||"")).filter(Boolean));
    if(error)throw error;
    const byCode=new Map((local||[]).map((p:any)=>[String(p.license_product_key),p]));
    const merged=products.map((m:any)=>{
      const l=byCode.get(String(m.code));
      return {...l, id:l?.id||null, master_id:m.id, master_code:m.code, name:m.name, slug:m.slug, description:m.description, short_description:m.shortDescription, price_cents:Math.round(Number(m.priceAmount||0)*100), currency:m.priceCurrency||"AUD", active:!!m.active, purchasable:!!m.purchasable, public:!!m.public, license_product_key:m.code, metadata:{...(l?.metadata||{}),...(m.metadata||{}),component:m.componentKey||l?.metadata?.component||null}, master:m};
    });
    const slug=new URL(req.url).searchParams.get("slug");
    if(slug){const product=merged.find((p:any)=>p.slug===slug);if(!product)return reply({error:"Product not found"},404);return reply({product});}
    return reply({authority:"orbitfs-license-master-v2",products:merged});
  }catch(e:any){return reply({error:e?.message||"License Master catalogue unavailable"},503)}
}
