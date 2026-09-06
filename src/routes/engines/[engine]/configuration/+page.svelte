<script lang="ts">
	let { data, form } = $props();
	const engine = data.engine;
	const cfg = engine.id === 'studio' ? data.settings?.settings : data.settings;
	const engineBlocks = engine.id === 'mcp'
		? [
			['Transport', 'https://orbitfsengine.vercel.app/mcp', 'Engine Host'],
			['OAuth authority', 'https://orbitfs.vercel.app', 'Panel'],
			['OAuth clients and sessions', 'Shared Supabase runtime state', 'Engine Host'],
			['Startup/context bundles', 'Shared workspace state', 'Panel + MCP runtime'],
			['Library and profiles', 'Shared Supabase data', 'Panel']
		]
		: engine.id === 'apex'
			? [
				['Routing and processing', 'APEX cloud runtime', 'Engine Host'],
				['Automation policy', 'orbitfs_settings / apex.cloud.policy', 'Engine Host'],
				['Library and profiles', 'Shared Supabase data', 'Panel'],
				['Projects / OSS / CCS', 'Shared workspace data', 'Panel']
			]
			: [
				['Routing and analysis', 'studio_settings', 'Engine Host'],
				['Processing', 'Request-driven serverless runtime', 'Engine Host'],
				['Studio documents and normal UI', 'Shared workspace data', 'Panel'],
				['Library and profiles', 'Shared Supabase data', 'Panel']
			];
	const actions = [
		['First-time setup',`/engines/${engine.id}/setup`,true],
		['Connections',`/engines/${engine.id}/connections`,false],
		...(engine.id==='mcp' ? [['OAuth',`/engines/${engine.id}/oauth`,false]] : []),
		['Runtime',`/engines/${engine.id}/runtime`,false],
		['Monitoring',`/engines/${engine.id}/monitoring`,false],
		['Logs',`/engines/${engine.id}/logs`,false],
		['Diagnostics',`/engines/${engine.id}/diagnostics`,false]
	];
</script>

<svelte:head><title>{engine.name} Configuration · OrbitFS Engine Host</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<div class="app">
	<header>
		<a class="brand" href="/engines"><span class="mark">O</span><span><b>OrbitFS</b><small>Engine Host</small></span></a>
		<div class="crumb"><a href="/engines">Engines</a><span>/</span><a href={`/engines/${engine.id}`}>{engine.name}</a><span>/</span><b>Configuration</b></div>
	</header>
	<main>
		<section class="heading"><div><p class="eyebrow">CONFIGURATION</p><h1>{engine.fullName}</h1><p>Engine Host owns engine-specific runtime configuration. Panel-owned workspace systems stay in Panel and are referenced through the shared Supabase backend.</p></div></section>

		{#if form?.error}<div class="notice error">{form.error}</div>{/if}
		{#if form?.message}<div class="notice ok">{form.message}</div>{/if}

		<section class="cards">
			<div><small>PANEL LINK</small><b>{engine.linked ? 'Connected' : 'Not linked'}</b><span>{engine.panelUrl || 'Attach from Panel first'}</span></div>
			<div><small>SETUP</small><b>{engine.setupState.replaceAll('_',' ')}</b><span>Version {engine.setupVersion}</span></div>
			<div><small>RUNTIME</small><b>{engine.engineState}</b><span>{engine.state?.compute || 'vercel'} · {engine.state?.database || 'supabase'}</span></div>
			<div><small>WORKSPACE</small><b>{engine.workspaceName || 'Unassigned'}</b><span>{engine.workspaceId || 'No workspace link'}</span></div>
		</section>

		{#if engine.id === 'apex' && cfg}
			<section class="panel">
				<div class="panel-head"><div><p class="eyebrow">APEX POLICY</p><h2>Routing and automation</h2></div><span class="pill">Real cloud policy</span></div>
				<p class="note">These settings write directly to the existing <code>apex.cloud.policy</code> global setting. APEX still operates on Panel-owned Library, Profiles and project data.</p>
				<form method="POST" action="?/save" class="config-form">
					<label class="field"><span>Service mode</span><select name="serviceMode"><option value="on_demand" selected={cfg.serviceMode !== 'automatic'}>On demand</option><option value="automatic" selected={cfg.serviceMode === 'automatic'}>Automatic</option></select><small>Controls whether APEX only runs when requested or can process automatically.</small></label>
					<label class="field"><span>Idle timeout (ms)</span><input name="idleTimeoutMs" type="number" min="5000" max="300000" step="1000" value={cfg.idleTimeoutMs || 10000}/><small>Serverless idle policy, clamped between 5 seconds and 5 minutes.</small></label>
					<div class="toggles">
						<label><input name="standby" type="checkbox" checked={cfg.standby !== false}/><span><b>Standby enabled</b><small>Allow the engine to remain ready without doing work.</small></span></label>
						<label><input name="blockAutomation" type="checkbox" checked={cfg.blockAutomation === true}/><span><b>Block automation</b><small>Require manual APEX requests even when automatic mode is selected.</small></span></label>
						<label class="danger-toggle"><input name="fullShutdown" type="checkbox" checked={cfg.fullShutdown === true}/><span><b>Full shutdown</b><small>Hard-block APEX analysis until this setting is cleared.</small></span></label>
					</div>
					<div class="form-footer"><span>Manual scan enforcement stays enabled by the existing APEX policy.</span><button disabled={!engine.attached || !engine.linked}>Save APEX configuration</button></div>
				</form>
			</section>
		{:else if engine.id === 'studio' && cfg}
			<section class="panel">
				<div class="panel-head"><div><p class="eyebrow">STUDIO RUNTIME</p><h2>Routing and analysis</h2></div><span class="pill">Shared Studio settings</span></div>
				<p class="note">These controls use the existing global Studio runtime settings. Studio documents, journals, sessions and normal workspace UI remain in Panel.</p>
				<form method="POST" action="?/save" class="config-form">
					<div class="toggles">
						<label><input name="routingEnabled" type="checkbox" checked={cfg.routingEnabled !== false}/><span><b>Routing enabled</b><small>Use the cloud routing engine during Studio processing.</small></span></label>
						<label><input name="routingAutoAnalyzeCreate" type="checkbox" checked={cfg.routingAutoAnalyzeCreate !== false}/><span><b>Analyse on create</b><small>Automatically run routing analysis for newly created Studio content.</small></span></label>
						<label><input name="routingAutoAnalyzeUpdate" type="checkbox" checked={cfg.routingAutoAnalyzeUpdate !== false}/><span><b>Analyse on update</b><small>Automatically rerun analysis when Studio content changes.</small></span></label>
					</div>
					<div class="fields-grid">
						<label class="field"><span>General confidence</span><input name="routingMinConfidence" type="number" min="0" max="1" step="0.01" value={cfg.routingMinConfidence}/></label>
						<label class="field"><span>Profile confidence</span><input name="routingProfileConfidence" type="number" min="0" max="1" step="0.01" value={cfg.routingProfileConfidence}/></label>
						<label class="field"><span>Incident confidence</span><input name="routingIncidentConfidence" type="number" min="0" max="1" step="0.01" value={cfg.routingIncidentConfidence}/></label>
						<label class="field"><span>Timeline confidence</span><input name="routingTimelineConfidence" type="number" min="0" max="1" step="0.01" value={cfg.routingTimelineConfidence}/></label>
						<label class="field"><span>Max suggestions</span><input name="routingMaxSuggestions" type="number" min="1" max="20" step="1" value={cfg.routingMaxSuggestions}/></label>
						<label class="field"><span>Max characters</span><input name="routingMaxCharacters" type="number" min="1000" max="200000" step="1000" value={cfg.routingMaxCharacters}/></label>
					</div>
					<div class="runtime-facts"><span>Matcher</span><b>{cfg.matcherType || 'deterministic'}</b><span>Semantic provider</span><b>{cfg.semanticProviderStatus || 'not configured'}</b><span>Processing</span><b>Serverless / request driven</b></div>
					<div class="form-footer"><span>Analysis policy, storage and canonical Studio data remain shared with Panel.</span><button disabled={!engine.attached || !engine.linked}>Save Studio configuration</button></div>
				</form>
			</section>
		{:else if engine.id === 'mcp'}
			<section class="panel">
				<div class="panel-head"><div><p class="eyebrow">MCP CONFIGURATION</p><h2>Connection-driven controls</h2></div><span class="pill">No duplicate settings</span></div>
				<p class="note">MCP configuration is intentionally split across its real systems: OAuth authority and grants, registered clients/sessions, runtime state, and Panel-owned startup/context bundle configuration. Engine Host does not create a second copy of workspace permissions or Library settings.</p>
				<div class="quick-grid"><a href={`/engines/${engine.id}/oauth`}><b>OAuth</b><span>Issuer, resource, clients and token revocation</span></a><a href={`/engines/${engine.id}/connections`}><b>Connections</b><span>MCP clients, sessions and workspace grants</span></a><a href={`/engines/${engine.id}/runtime`}><b>Runtime</b><span>Run, Standby, Restart and Stop</span></a><a href="https://orbitfs.vercel.app" target="_blank" rel="noreferrer"><b>Panel</b><span>Startup, bundles, workspace permissions and Library</span></a></div>
			</section>
		{/if}

		<section class="panel">
			<div class="panel-head"><div><p class="eyebrow">OWNERSHIP MAP</p><h2>What is configured where</h2></div></div>
			<div class="table"><div class="row head"><span>Area</span><span>Source</span><span>Authority</span></div>{#each engineBlocks as block}<div class="row"><span><b>{block[0]}</b></span><span>{block[1]}</span><span><strong class:host={block[2] === 'Engine Host'}>{block[2]}</strong></span></div>{/each}</div>
		</section>

		<section class="panel">
			<div class="panel-head"><div><p class="eyebrow">MANAGEMENT</p><h2>Engine configuration flow</h2></div></div>
			<div class="actions">{#each actions as action}<a class:primary={action[2] === true} href={action[1]}>{action[0]}</a>{/each}</div>
			<p class="note">Controls are only exposed when they have real backend behaviour. Panel data is never cloned into Engine Host.</p>
		</section>
	</main>
</div>

<style>
	:global(html){background:#070a0f;color:#f5f7fb;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}:global(body){margin:0}.app{min-height:100vh;background:radial-gradient(circle at 48% -18%,#151d31 0,#080c13 38%,#06080c 100%)}
	header{height:68px;padding:0 28px;border-bottom:1px solid #202733;display:flex;align-items:center;justify-content:space-between;background:rgba(8,11,17,.9)}.brand{display:flex;gap:10px;align-items:center;color:#fff;text-decoration:none}.brand>span:last-child{display:grid}.brand small{font-size:10px;color:#737e8c}.mark{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,#7c3aed,#d946ef);font-weight:900}.crumb{display:flex;gap:7px;align-items:center;font-size:11px;color:#647181}.crumb a{color:#95a0af;text-decoration:none}.crumb b{color:#d8dee7}
	main{max-width:1120px;margin:0 auto;padding:46px 24px 70px}.heading{max-width:780px}.eyebrow{font-size:10px;letter-spacing:.18em;color:#9878ff;font-weight:900;margin:0 0 7px}.heading h1{font-size:38px;letter-spacing:-.04em;margin:0}.heading p:not(.eyebrow){color:#8e99a8;line-height:1.6}.notice{padding:11px 13px;border-radius:10px;margin:14px 0;font-size:12px}.notice.error{border:1px solid #7f1d1d;background:#2a0d12;color:#fecaca}.notice.ok{border:1px solid #215a40;background:#0b2118;color:#6ee7a6}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:24px 0}.cards>div{border:1px solid #252e3a;background:#0d1219;border-radius:14px;padding:14px;display:grid;gap:5px;min-width:0}.cards small{font-size:9px;color:#687484}.cards b{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-transform:capitalize}.cards span{font-size:10px;color:#758190;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.panel{border:1px solid #252e3a;background:linear-gradient(180deg,#0e141c,#0a0f15);border-radius:16px;padding:21px;margin-top:16px}.panel-head{display:flex;align-items:center;justify-content:space-between;gap:15px}.panel h2{margin:0;font-size:21px}.pill{font-size:9px;border:1px solid #35404e;border-radius:999px;padding:6px 9px;color:#a9b3bf}.note{font-size:10px;color:#758190;line-height:1.6;margin:12px 0}.config-form{margin-top:18px;display:grid;gap:16px}.field{display:grid;gap:6px}.field>span{font-size:11px;font-weight:800;color:#cdd5df}.field small{font-size:9px;color:#697584;line-height:1.5}input[type="number"],select{width:100%;box-sizing:border-box;border:1px solid #303a47;background:#080c12;color:#edf1f7;border-radius:9px;padding:9px 10px;font:inherit;font-size:11px;outline:none}input[type="number"]:focus,select:focus{border-color:#7c3aed}.fields-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.toggles{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.toggles label{display:flex;gap:10px;align-items:flex-start;border:1px solid #242d39;background:#0a0f15;border-radius:11px;padding:12px}.toggles label.danger-toggle{border-color:#4b2529}.toggles input{margin-top:2px;accent-color:#7c3aed}.toggles span{display:grid}.toggles b{font-size:11px}.toggles small{font-size:9px;color:#718090;line-height:1.45;margin-top:3px}.form-footer{display:flex;justify-content:space-between;align-items:center;gap:15px;border-top:1px solid #232c37;padding-top:15px}.form-footer span{font-size:9px;color:#758190}.form-footer button{border:1px solid #7c3aed;background:#6d28d9;color:white;border-radius:9px;padding:9px 12px;font:inherit;font-size:10px;font-weight:900;cursor:pointer}.form-footer button:disabled{opacity:.45;cursor:not-allowed}.runtime-facts{display:grid;grid-template-columns:auto 1fr auto 1fr auto 1fr;gap:8px 12px;border:1px solid #242d39;background:#0a0f15;border-radius:10px;padding:11px}.runtime-facts span{font-size:9px;color:#687484}.runtime-facts b{font-size:9px;color:#c6cfda}.quick-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:16px}.quick-grid a{display:grid;gap:4px;padding:12px;border:1px solid #26303c;border-radius:10px;background:#0a0f15;color:#d7dee8;text-decoration:none}.quick-grid a:hover{border-color:#55427f}.quick-grid b{font-size:11px}.quick-grid span{font-size:9px;color:#718090;line-height:1.45}.table{display:grid;margin-top:16px}.row{display:grid;grid-template-columns:1.4fr 1.2fr .8fr;gap:12px;padding:11px 8px;border-top:1px solid #222b36;font-size:11px;color:#aab3bf}.row.head{border-top:0;color:#667383;text-transform:uppercase;font-size:9px}.row strong{color:#9ca7b4}.row strong.host{color:#c4b5fd}.actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:17px}.actions a{border:1px solid #35404e;background:#111821;color:#d1d8e1;border-radius:9px;padding:9px 12px;font-size:11px;font-weight:800;text-decoration:none}.actions a.primary{background:#6d28d9;border-color:#7c3aed;color:#fff}
	@media(max-width:900px){.cards{grid-template-columns:repeat(2,1fr)}.fields-grid{grid-template-columns:repeat(2,1fr)}.toggles,.quick-grid{grid-template-columns:1fr}.runtime-facts{grid-template-columns:auto 1fr}}
	@media(max-width:560px){header{padding:0 16px}.crumb{display:none}main{padding:34px 16px 55px}.heading h1{font-size:31px}.cards,.fields-grid{grid-template-columns:1fr}.row{grid-template-columns:1fr}.row.head{display:none}.form-footer{align-items:stretch;flex-direction:column}.form-footer button{width:100%}}
</style>
