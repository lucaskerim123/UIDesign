<script lang="ts">
	let { data } = $props();
	const linkedCount = data.engines.filter((engine: any) => engine.linked).length;
	const setupCount = data.engines.filter((engine: any) => engine.setupState === 'complete').length;
	const runningCount = data.engines.filter((engine: any) => engine.engineState === 'running').length;
	const health = [
		{ label: 'Shared backend', ok: data.backend.supabaseConfigured, detail: data.backend.supabaseConfigured ? 'Supabase connection configured' : 'Supabase environment is incomplete' },
		{ label: 'Panel pairing', ok: data.backend.engineSecretConfigured, detail: data.backend.engineSecretConfigured ? 'Signed Panel ↔ Engine Host requests enabled' : 'ORBITFS_ENGINE_SECRET is not configured' },
		{ label: 'Installation', ok: Boolean(data.installationId), detail: data.installationId },
		{ label: 'Licence state', ok: data.license.licensed, detail: data.license.licensed ? 'Base entitlement is active' : `Licence state: ${data.license.status || 'unknown'}` }
	];
	const engineDescription: Record<string,string> = {
		mcp: 'OAuth, MCP clients, sessions, runtime, monitoring and diagnostics.',
		apex: 'Routing, processing and automation policy for the APEX runtime.',
		studio: 'Studio routing and analysis runtime settings. Studio data remains in Panel.'
	};
</script>

<svelte:head><title>Configuration · OrbitFS Engine Host</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<div class="app">
	<header>
		<a class="brand" href="/engines"><span class="mark">O</span><span><b>OrbitFS</b><small>Engine Host</small></span></a>
		<div class="head-actions"><a href={data.services.panelUrl} target="_blank" rel="noreferrer">Open Panel</a><a href="/engines">Engines</a></div>
	</header>

	<main>
		<section class="heading">
			<div><p class="eyebrow">ENGINE HOST CONFIGURATION</p><h1>OrbitFS Engine Host</h1><p>This page shows the actual cloud setup used by MCP, APEX and Studio. Deployment-owned settings are clearly separated from settings you manage inside each engine.</p></div>
			<div class="summary"><span>Installation</span><code>{data.installationId}</code><small>{data.mainWorkspace?.name || 'No workspace'} · {data.workspaceCount} accessible workspace{data.workspaceCount === 1 ? '' : 's'}</small></div>
		</section>

		<section class="status-grid">
			{#each health as item}
				<div class:warn={!item.ok} class="status-card"><div class="status-line"><span class:ok={item.ok}></span><b>{item.label}</b></div><p>{item.detail}</p></div>
			{/each}
		</section>

		<section class="panel">
			<div class="panel-head"><div><p class="eyebrow">CORE SERVICES</p><h2>Where OrbitFS services live</h2></div><span class="pill">Cloud managed</span></div>
			<p class="note">These are the canonical service addresses. They are deployment configuration, not per-user settings, so Engine Host shows them clearly rather than pretending they are editable application fields.</p>
			<div class="service-grid">
				<div><small>MAIN ORBITFS / PANEL</small><b>Panel authority</b><code>{data.services.panelUrl}</code><p>Users, workspaces, Library, Profiles, Projects, OSS/CCS, permissions and the main OrbitFS control plane.</p></div>
				<div><small>ENGINE HOST</small><b>Engine management</b><code>{data.services.engineHostUrl}</code><p>MCP, APEX and Studio setup, runtime, monitoring, logs and engine-specific configuration.</p></div>
				<div><small>MCP TRANSPORT</small><b>Client endpoint</b><code>{data.services.mcpUrl}</code><p>ChatGPT, Cursor and other MCP clients connect here. The management website and transport share the same host.</p></div>
				<div><small>LICENSING</small><b>Entitlement authority</b><code>{data.services.licenseProvider}</code><p>Engine availability is driven by the shared OrbitFS installation entitlement, not a second Engine Host licence system.</p></div>
			</div>
		</section>

		<section class="split">
			<div class="panel">
				<div class="panel-head"><div><p class="eyebrow">SHARED BACKEND</p><h2>Vercel + Supabase</h2></div><span class:bad={!data.backend.supabaseConfigured} class="pill">{data.backend.supabaseConfigured ? 'ready' : 'check setup'}</span></div>
				<div class="facts">
					<div><span>Compute</span><b>{data.backend.compute}</b><small>Request-driven application and engine functions.</small></div>
					<div><span>Database</span><b>{data.backend.database}</b><small>Shared OrbitFS account, workspace and engine state.</small></div>
					<div><span>Storage</span><b>{data.backend.storage}</b><small>Object storage for OrbitFS Library content where required.</small></div>
					<div><span>Filesystem model</span><b>{data.backend.filesystem}</b><small>No persistent VPS filesystem is recreated in the cloud edition.</small></div>
				</div>
			</div>
			<div class="panel">
				<div class="panel-head"><div><p class="eyebrow">PAIRING SECURITY</p><h2>Panel ↔ Engine Host</h2></div><span class:bad={!data.backend.engineSecretConfigured} class="pill">{data.backend.engineSecretConfigured ? 'configured' : 'action required'}</span></div>
				<p class="note">Attach and detach actions are server-to-server. The Panel sends a signed request and Engine Host validates the shared installation, workspace, user and engine entitlement before accepting the link.</p>
				<div class="security-flow"><span>Panel attach</span><b>→</b><span>Signed request</span><b>→</b><span>Installation + workspace validation</span><b>→</b><span>Engine linked</span></div>
				{#if !data.backend.engineSecretConfigured}<div class="warning"><b>Pairing is not ready.</b><span>Configure the same <code>ORBITFS_ENGINE_SECRET</code> in both Vercel projects before testing Attach.</span></div>{/if}
			</div>
		</section>

		<section class="panel">
			<div class="panel-head"><div><p class="eyebrow">ENGINES</p><h2>Engine configuration</h2></div><span class="pill">{linkedCount}/{data.engines.length} linked · {setupCount} setup · {runningCount} running</span></div>
			<p class="note">Only settings with real backend behaviour live here. Panel-owned workspace data is referenced from the shared backend instead of being copied into Engine Host.</p>
			<div class="engine-grid">
				{#each data.engines as engine}
					<div class="engine-card">
						<div class="engine-top"><div class="icon">{engine.name.slice(0,1)}</div><span class:ready={engine.linked && engine.licensed && engine.attached} class="badge">{!engine.registered ? 'Not installed' : !engine.licensed ? 'Licence required' : !engine.attached ? 'Detached' : engine.setupState !== 'complete' ? 'Setup required' : engine.engineState}</span></div>
						<h3>{engine.fullName}</h3><p>{engineDescription[engine.id] || engine.description}</p>
						<div class="mini-facts"><span>Panel link <b>{engine.linked ? 'Connected' : 'Not linked'}</b></span><span>Setup <b>{engine.setupState.replaceAll('_',' ')}</b></span><span>Runtime <b>{engine.engineState}</b></span></div>
						<div class="engine-actions"><a class="primary" href={`/engines/${engine.id}/configuration`}>Configure</a><a href={`/engines/${engine.id}`}>Manage engine</a></div>
					</div>
				{/each}
			</div>
		</section>

		<section class="panel">
			<div class="panel-head"><div><p class="eyebrow">OWNERSHIP</p><h2>What belongs where</h2></div></div>
			<div class="ownership">
				<div><b>OrbitFS Panel owns</b><span>Users and authentication</span><span>Workspaces and permissions</span><span>Library, Knowledge and Profiles</span><span>Projects, OSS and CCS</span><span>Normal Studio data and UI</span><span>Install, attach and licensing controls</span></div>
				<div><b>Engine Host owns</b><span>Engine first-time setup</span><span>Engine-specific configuration</span><span>Runtime controls</span><span>MCP OAuth and client/session management</span><span>Monitoring, logs and diagnostics</span><span>Engine processing/runtime settings</span></div>
			</div>
		</section>
	</main>
</div>

<style>
	:global(html){background:#070a0f;color:#f5f7fb;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}:global(body){margin:0}.app{min-height:100vh;background:radial-gradient(circle at 48% -18%,#151d31 0,#080c13 38%,#06080c 100%)}
	header{height:68px;padding:0 28px;border-bottom:1px solid #202733;display:flex;align-items:center;justify-content:space-between;background:rgba(8,11,17,.9);position:sticky;top:0;z-index:10}.brand{display:flex;gap:10px;align-items:center;color:#fff;text-decoration:none}.brand>span:last-child{display:grid}.brand small{font-size:10px;color:#737e8c}.mark{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,#7c3aed,#d946ef);font-weight:900}.head-actions{display:flex;gap:14px}.head-actions a{font-size:11px;color:#a1abb8;text-decoration:none}.head-actions a:hover{color:#fff}
	main{max-width:1180px;margin:0 auto;padding:46px 24px 70px}.heading{display:flex;justify-content:space-between;align-items:end;gap:28px;margin-bottom:24px}.heading>div:first-child{max-width:760px}.eyebrow{font-size:10px;letter-spacing:.18em;color:#9878ff;font-weight:900;margin:0 0 7px}.heading h1{font-size:40px;letter-spacing:-.045em;margin:0}.heading p:not(.eyebrow){color:#8e99a8;line-height:1.6}.summary{min-width:280px;border:1px solid #27303d;border-radius:14px;padding:14px;background:#0d1219;display:grid;gap:5px}.summary span,.summary small{font-size:10px;color:#738090}.summary code{font-size:11px;color:#d6dce5;overflow:hidden;text-overflow:ellipsis}
	.status-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}.status-card{border:1px solid #244434;background:#0b1812;border-radius:13px;padding:13px}.status-card.warn{border-color:#60451d;background:#1a1409}.status-line{display:flex;align-items:center;gap:8px}.status-line>span{width:8px;height:8px;border-radius:50%;background:#ef4444}.status-line>span.ok{background:#22c55e}.status-line b{font-size:11px}.status-card p{font-size:9px;color:#80908c;margin:6px 0 0;line-height:1.5;word-break:break-word}
	.panel{border:1px solid #252e3a;background:linear-gradient(180deg,#0e141c,#0a0f15);border-radius:16px;padding:21px;margin-top:16px}.panel-head{display:flex;align-items:center;justify-content:space-between;gap:15px}.panel h2{margin:0;font-size:21px}.pill{font-size:9px;border:1px solid #35404e;border-radius:999px;padding:6px 9px;color:#a9b3bf;text-transform:capitalize}.pill.bad{border-color:#6b4b18;color:#f0c36b}.note{font-size:10px;color:#758190;line-height:1.65;margin:12px 0 16px}.service-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.service-grid>div{border:1px solid #242d39;background:#0a0f15;border-radius:12px;padding:14px;display:grid;gap:5px}.service-grid small{font-size:9px;color:#6f7a89}.service-grid b{font-size:12px}.service-grid code{font-size:10px;color:#bcb1e8;word-break:break-all}.service-grid p{font-size:9px;color:#758190;line-height:1.55;margin:4px 0 0}
	.split{display:grid;grid-template-columns:1fr 1fr;gap:16px}.facts{display:grid;gap:8px;margin-top:16px}.facts>div{display:grid;grid-template-columns:120px 1fr;gap:4px 12px;padding:10px 0;border-bottom:1px solid #202833}.facts>div:last-child{border-bottom:0}.facts span{font-size:9px;color:#6f7b8a;text-transform:uppercase}.facts b{font-size:11px}.facts small{grid-column:2;font-size:9px;color:#6f7b8a;line-height:1.5}.security-flow{display:flex;align-items:center;flex-wrap:wrap;gap:7px;margin-top:14px}.security-flow span{border:1px solid #293240;background:#0a0f15;border-radius:8px;padding:8px 9px;font-size:9px;color:#aeb7c3}.security-flow b{color:#655889;font-size:10px}.warning{margin-top:14px;border:1px solid #6b4b18;background:#211708;border-radius:10px;padding:11px;display:grid;gap:4px}.warning b{font-size:10px;color:#f0c36b}.warning span{font-size:9px;color:#b99b65;line-height:1.5}.warning code{color:#f0c36b}
	.engine-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.engine-card{border:1px solid #252e3a;background:#0a0f15;border-radius:14px;padding:15px;display:flex;flex-direction:column;min-height:250px}.engine-top{display:flex;justify-content:space-between;align-items:center}.icon{width:36px;height:36px;display:grid;place-items:center;border-radius:9px;background:#1d1834;color:#bca9ff;font-weight:900}.badge{font-size:9px;border:1px solid #60451d;color:#e5b95e;border-radius:999px;padding:5px 8px;text-transform:capitalize}.badge.ready{border-color:#215a40;color:#6ee7a6}.engine-card h3{font-size:17px;margin:16px 0 5px}.engine-card>p{font-size:9px;color:#7b8795;line-height:1.55;margin:0 0 14px}.mini-facts{display:grid;gap:5px;padding:10px 0;border-top:1px solid #202833;border-bottom:1px solid #202833}.mini-facts span{display:flex;justify-content:space-between;gap:12px;font-size:9px;color:#6f7b8a}.mini-facts b{color:#b9c1cc;text-transform:capitalize}.engine-actions{display:flex;gap:8px;margin-top:auto;padding-top:14px}.engine-actions a{border:1px solid #303a47;border-radius:8px;padding:8px 10px;color:#b6c0cd;text-decoration:none;font-size:9px}.engine-actions a.primary{background:#6d4be8;border-color:#6d4be8;color:white}
	.ownership{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ownership>div{border:1px solid #242d39;background:#0a0f15;border-radius:12px;padding:14px;display:grid;gap:7px}.ownership b{font-size:11px;margin-bottom:3px}.ownership span{font-size:9px;color:#7b8795}.ownership span:before{content:'✓';color:#7c6bd3;margin-right:7px}
	@media(max-width:950px){.status-grid{grid-template-columns:repeat(2,1fr)}.engine-grid{grid-template-columns:1fr}.split{grid-template-columns:1fr}}@media(max-width:700px){main{padding:30px 16px 55px}.heading{align-items:stretch;flex-direction:column}.heading h1{font-size:32px}.summary{min-width:0}.service-grid,.ownership{grid-template-columns:1fr}}@media(max-width:500px){header{padding:0 16px}.head-actions a:first-child{display:none}.status-grid{grid-template-columns:1fr}.panel{padding:16px}.facts>div{grid-template-columns:1fr}.facts small{grid-column:1}.security-flow{align-items:stretch;flex-direction:column}.security-flow b{transform:rotate(90deg)}}
</style>
