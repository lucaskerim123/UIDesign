<script lang="ts">
	let { data, form } = $props();
	const engine=data.engine;
	const now=Date.now();
	const active=(token:any)=>!token.revoked_at && new Date(token.expires_at).getTime()>now;
	const activeCount=data.tokens.filter(active).length;
	const fmt=(value:any)=>value?new Date(value).toLocaleString():'Never';
	const scopeHelp:Record<string,string>={
		'orbitfs:read':'Read authorised OrbitFS workspace context and data.',
		'orbitfs:write':'Perform write operations when the MCP client and workspace also allow them.',
		'offline_access':'Allow refresh tokens so the client can renew access without another login each hour.'
	};
</script>
<svelte:head><title>{engine.name} OAuth · OrbitFS Engine Host</title><meta name="robots" content="noindex,nofollow" /></svelte:head>
<div class="app">
	<header><a class="brand" href="/engines"><span class="mark">O</span><span><b>OrbitFS</b><small>Engine Host</small></span></a><div class="crumb"><a href="/configuration">Host configuration</a><span>/</span><a href={`/engines/${engine.id}`}>{engine.name}</a><span>/</span><b>OAuth</b></div></header>
	<main>
		<div class="heading"><p class="eyebrow">MCP AUTHENTICATION</p><h1>OAuth</h1><p>OrbitFS Panel is the identity and OAuth authority. Engine Host advertises the MCP resource, receives authorised MCP requests and lets administrators inspect clients and revoke their active tokens.</p></div>
		{#if !data.applicable}<div class="notice">OAuth is an MCP connection feature and is not used by this engine.</div>{:else}
			{#if form?.error}<div class="notice error">{form.error}</div>{/if}{#if form?.message}<div class="notice ok">{form.message}</div>{/if}
			<section class="cards"><div><small>REGISTERED CLIENTS</small><b>{data.clients.length}</b><span>OAuth applications</span></div><div><small>ACTIVE TOKENS</small><b>{activeCount}</b><span>currently usable</span></div><div><small>AUTHORITY</small><b>OrbitFS Panel</b><span>{data.endpoints.issuer}</span></div><div><small>RESOURCE</small><b>/mcp</b><span>{data.endpoints.resource}</span></div></section>

			<section class="panel">
				<div class="panel-head"><div><p class="eyebrow">CONNECTION FLOW</p><h2>How an MCP client signs in</h2></div><span class="pill">OAuth 2.1 · PKCE S256</span></div>
				<div class="flow"><div><b>1</b><span><strong>Client opens MCP</strong><small>{data.endpoints.resource}</small></span></div><i>→</i><div><b>2</b><span><strong>Panel authenticates user</strong><small>Existing OrbitFS credentials and consent.</small></span></div><i>→</i><div><b>3</b><span><strong>Code exchanged</strong><small>PKCE-bound authorization code.</small></span></div><i>→</i><div><b>4</b><span><strong>Client calls MCP</strong><small>Bearer token is bound to the Engine Host MCP resource.</small></span></div></div>
			</section>

			<section class="split">
				<div class="panel compact">
					<div class="panel-head"><div><p class="eyebrow">ENDPOINTS</p><h2>Published metadata</h2></div></div>
					<div class="details"><span>Issuer</span><code>{data.endpoints.issuer}</code><span>Resource</span><code>{data.endpoints.resource}</code><span>Authorization</span><code>{data.endpoints.authorization}</code><span>Token</span><code>{data.endpoints.token}</code><span>Dynamic registration</span><code>{data.endpoints.registration}</code></div>
				</div>
				<div class="panel compact">
					<div class="panel-head"><div><p class="eyebrow">SCOPES</p><h2>What clients can request</h2></div></div>
					<div class="scopes">{#each data.endpoints.scopes as scope}<div><code>{scope}</code><span>{scopeHelp[scope] || 'OrbitFS MCP scope.'}</span></div>{/each}</div>
				</div>
			</section>

			<section class="panel">
				<div class="panel-head"><div><p class="eyebrow">CLIENTS</p><h2>Registered OAuth clients</h2></div><span class="pill">Registration is protocol-managed</span></div>
				<p class="help">Clients register through the OAuth registration endpoint. Engine Host does not create fake manual client records here; this page manages the real registrations and their issued access.</p>
				{#if data.clients.length}<div class="clients">{#each data.clients as client}<div class="client"><div class="client-head"><div><b>{client.client_name || client.client_id}</b><code>{client.client_id}</code></div><form method="POST" action="?/revoke"><input type="hidden" name="clientId" value={client.client_id}/><button title="Revokes all currently active tokens issued to this client">Revoke active tokens</button></form></div><div class="facts"><span>Scope</span><code>{client.scope || 'orbitfs:read'}</code><span>Redirect URIs</span><code>{Array.isArray(client.redirect_uris)?client.redirect_uris.join(', '):'None'}</code><span>Application type</span><code>{client.application_type || 'web'}</code><span>Updated</span><code>{fmt(client.updated_at || client.created_at)}</code></div></div>{/each}</div>{:else}<div class="empty">No OAuth clients have registered yet.</div>{/if}
			</section>
			<section class="panel">
				<div class="panel-head"><div><p class="eyebrow">TOKENS</p><h2>Recent grants</h2></div><span class="pill">Token values and hashes are hidden</span></div>
				<div class="tokens">{#each data.tokens.slice(0,50) as token}<div><span class:good={active(token)} class="dot"></span><b>{token.client_id}</b><small>{token.scope}</small><code>{active(token)?'Active':token.revoked_at?'Revoked':'Expired'} · last used {fmt(token.last_used_at)}</code></div>{/each}{#if !data.tokens.length}<div class="empty">No OAuth tokens have been issued yet.</div>{/if}</div>
			</section>
		{/if}
		<div class="actions"><a href={`/engines/${engine.id}`}>Overview</a><a href={`/engines/${engine.id}/connections`}>Connections</a><a href={`/engines/${engine.id}/monitoring`}>Monitoring</a><a href={`/engines/${engine.id}/logs`}>Logs</a></div>
	</main>
</div>
<style>
	:global(html){background:#070a0f;color:#f5f7fb;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}:global(body){margin:0}.app{min-height:100vh;background:radial-gradient(circle at 50% -20%,#141d31,#070a0f 42%)}header{height:68px;padding:0 28px;border-bottom:1px solid #202733;display:flex;align-items:center;justify-content:space-between;background:#090d13}.brand{display:flex;gap:10px;align-items:center;color:#fff;text-decoration:none}.brand>span:last-child{display:grid}.brand small{font-size:10px;color:#737e8c}.mark{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,#7c3aed,#d946ef);font-weight:900}.crumb{display:flex;gap:8px;font-size:11px;color:#657181}.crumb a{color:#9aa5b4;text-decoration:none}.crumb b{color:#d8dee7}main{max-width:1120px;margin:0 auto;padding:46px 24px 70px}.heading{max-width:800px}.eyebrow{font-size:10px;letter-spacing:.18em;color:#9878ff;font-weight:900;margin:0 0 7px}.heading h1{font-size:38px;letter-spacing:-.04em;margin:0}.heading>p:last-child{color:#8e99a8;line-height:1.6}.notice{border:1px solid #35404e;background:#0d1219;border-radius:11px;padding:12px 14px;color:#aeb8c4;font-size:12px;margin:18px 0}.notice.error{border-color:#7f1d1d;background:#2a0d12;color:#fecaca}.notice.ok{border-color:#215a40;background:#0b2118;color:#6ee7a6}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:24px 0}.cards>div{border:1px solid #252e3a;background:#0d1219;border-radius:13px;padding:15px;display:grid;gap:5px;min-width:0}.cards small{font-size:9px;color:#687484}.cards b{font-size:14px}.cards span{font-size:8px;color:#637080;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.panel{border:1px solid #252e3a;background:#0c1118;border-radius:16px;padding:21px;margin-top:16px}.panel.compact{margin-top:0}.panel-head{display:flex;justify-content:space-between;align-items:center;gap:15px}.panel h2{margin:0;font-size:21px}.pill{font-size:9px;border:1px solid #35404e;border-radius:999px;padding:6px 9px;color:#9ca7b4}.flow{display:flex;align-items:center;gap:8px;margin-top:17px}.flow>div{flex:1;min-width:0;border:1px solid #242d39;background:#090e14;border-radius:11px;padding:11px;display:flex;gap:8px}.flow>div>b{width:25px;height:25px;flex:0 0 auto;border-radius:7px;background:#1d1834;color:#b9a6ff;display:grid;place-items:center;font-size:10px}.flow span{display:grid;gap:3px}.flow strong{font-size:10px}.flow small{font-size:8px;color:#6c7887;line-height:1.4;word-break:break-word}.flow i{font-style:normal;color:#5d536e}.split{display:grid;grid-template-columns:1.15fr .85fr;gap:16px;margin-top:16px}.details,.facts{display:grid;grid-template-columns:120px 1fr;gap:9px 14px;margin-top:16px}.details span,.facts span{font-size:10px;color:#6d7988}.details code,.facts code{font-size:10px;color:#cbd3dd;overflow:hidden;text-overflow:ellipsis}.scopes{display:grid;gap:8px;margin-top:15px}.scopes>div{border:1px solid #222b36;background:#090e14;border-radius:9px;padding:10px;display:grid;gap:4px}.scopes code{font-size:9px;color:#bca9ff}.scopes span{font-size:9px;color:#758190;line-height:1.45}.help{font-size:10px;color:#74808f;line-height:1.55}.clients{display:grid;margin-top:14px}.client{border-top:1px solid #222b36;padding:14px 2px}.client:first-child{border-top:0}.client-head{display:flex;justify-content:space-between;gap:15px;align-items:center}.client-head>div{display:grid;gap:3px}.client-head b{font-size:12px}.client-head code{font-size:9px;color:#758190}button{border:1px solid #65451b;background:#211707;color:#f0c36b;border-radius:8px;padding:7px 9px;font:inherit;font-size:9px;font-weight:800;cursor:pointer}.tokens{display:grid;margin-top:14px}.tokens>div{display:grid;grid-template-columns:auto 160px 1fr 1.4fr;gap:10px;align-items:center;border-top:1px solid #222b36;padding:10px 2px}.tokens>div:first-child{border-top:0}.tokens b{font-size:10px}.tokens small,.tokens code{font-size:9px;color:#758190}.dot{width:7px;height:7px;border-radius:50%;background:#ef4444}.dot.good{background:#22c55e}.empty{padding:26px;text-align:center;color:#758190;font-size:11px}.actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px}.actions a{border:1px solid #35404e;background:#111821;color:#d1d8e1;border-radius:9px;padding:9px 12px;font-size:11px;font-weight:800;text-decoration:none}@media(max-width:900px){.flow{align-items:stretch;flex-direction:column}.flow i{transform:rotate(90deg);align-self:center}.split{grid-template-columns:1fr}}@media(max-width:760px){.cards{grid-template-columns:repeat(2,1fr)}.tokens>div{grid-template-columns:auto 1fr}.tokens code,.tokens small{grid-column:2}}@media(max-width:560px){header{padding:0 16px}.crumb{display:none}main{padding:34px 16px 55px}.heading h1{font-size:31px}.cards{grid-template-columns:1fr}.details,.facts{grid-template-columns:1fr}.client-head{align-items:flex-start;flex-direction:column}}
</style>
