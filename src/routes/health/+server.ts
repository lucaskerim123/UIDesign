import { json } from '@sveltejs/kit';
export function GET(){ return json({ ok:true, service:'orbitfs-mcp', mode:'serverless', filesystem:false, storage:'supabase-library-memory' }); }
