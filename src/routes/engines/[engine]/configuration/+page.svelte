<script lang="ts">
	let { data, form } = $props();
	const engine = data.engine;
	const cfg = engine.id === 'studio' ? data.settings?.settings : data.settings;
	const pct = (value: unknown, fallback = 50) => Math.round(Number(value ?? fallback / 100) * 100);
	const ownership = engine.id === 'mcp'
		? [
			['MCP transport', 'Engine Host', 'https://orbitfsengine.vercel.app/mcp'],
			['OAuth authority', 'Panel', 'https://orbitfs.vercel.app'],
			['Clients and sessions', 'Engine Host', 'Shared Supabase runtime state'],
			['Startup and context bundles', 'Panel + MCP', 'Shared workspace configuration'],
			['Library and Profiles', 'Panel', 'Shared Supabase data']
		]
		: engine.id === 'apex'
			? [
				['Routing and processing', 'Engine Host', 'APEX cloud runtime'],
				['Automation policy', 'Engine Host', 'Shared APEX policy setting'],
				['Library and Profiles', 'Panel', 'Shared Supabase data'],
				['Projects / OSS / CCS', 'Panel', 'Shared workspace systems']
			]
			: [
				['Routing and analysis', 'Engine Host', 'Shared Studio runtime settings'],
				['Processing runtime', 'Engine Host', 'Request-driven Vercel runtime'],
				['Documents and normal Studio UI', 'Panel', 'Shared workspace data'],
				['Library and Profiles', 'Panel', 'Shared Supabase data']
			];
</script>

<svelte:head><title>{engine.name} Configuration · OrbitFS Engine Host</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<div class="app">
	<header>
		<a class="brand" href="/engines"><span class="mark">O</span><span><b>OrbitFS</b><small>Engine Host</small></span></a>
		<div class="crumb"><a href="/configuration">Host configuration</a><span>/</span><a href={`/engines/${engine.id}`}>{engine.name}</a><span>/</span><b>Configuration</b></div>
	</header>

	<main>
		<section class="heading">
			<div><p class="eyebrow">{engine.id.toUpperCase()} CONFIGURATION</p><h1>{engine.fullName}</h1><p>Only settings that actually belong to this engine are editable here. Workspace data and Panel-owned systems stay in the main OrbitFS Panel.</p></div>
			<a class="host-link" href="/configuration">← Host configuration</a>
		</section>

		{#if form?.error}<div class="notice error">{form.error}</div>{/if}
		{#if form?.message}<div class="notice ok">{form.message}</div>{/if}

		<section class="status-grid">
			<div><small>PANEL LINK</small><b>{engine.linked ? 'Connected' : 'Not linked'}</b><span>{engine.panelUrl || 'Attach from Panel first'}</span></div>
			<div><small>SETUP</small><b>{engine.setupState.replaceAll('_',' ')}</b><span>Setup version {engine.setupVersion}</span></div>
			<div><small>RUNTIME</small><b>{engine.engineState}</b><span>{engine.state?.compute || 'Vercel'} · {engine.state?.database || 'Supabase'}</span></div>
			<div><small>WORKSPACE</small><b>{engine.workspaceName || 'Unassigned'}</b><span>{engine.workspaceId || 'No workspace link'}</span></div>
		</section>

		{#if !engine.attached || !engine.linked}
			<div class="warning"><b>Configuration is locked.</b><span>Install and Attach this engine from OrbitFS Panel first. Engine Host will then bind the correct installation and workspace.</span></div>
		{/if}

		{#if engine.id === 'apex' && cfg}
			<section class="panel">
				<div class="panel-head"><div><p class="eyebrow">APEX BEHAVIOUR</p><h2>Processing and automation</h2></div><span class="pill">Editable</span></div>
				<p class="note">These are the real APEX runtime policy settings. They control when APEX may process work, but do not move or duplicate Library, Profile, Project, OSS or CCS data.</p>
				<form method="POST" action="?/save" class="config-form">
					<div class="fields two">
						<label class="field"><span>Processing mode</span><select name="serviceMode"><option value="on_demand" selected={cfg.serviceMode !== 'automatic'}>On demand</option><option value="automatic" selected={cfg.serviceMode === 'automatic'}>Automatic</option></select><small><b>On demand:</b> APEX only works when requested. <b>Automatic:</b> APEX may process eligible work automatically.</small></label>
						<label class="field"><span>Idle timeout</span><div class="with-unit"><input name="idleTimeoutSeconds" type="number" min="5" max="300" step="1" value={Math.round(Number(cfg.idleTimeoutMs || 10000) / 1000)}/><em>seconds</em></div><small>How long APEX can stay idle before returning to its standby behaviour. Range: 5–300 seconds.</small></label>
					</div>
					<div class="toggles">
						<label><input name="standby" type="checkbox" checked={cfg.standby !== false}/><span><b>Allow standby</b><small>Keep APEX ready without actively processing work.</small></span></label>
						<label><input name="blockAutomation" type="checkbox" checked={cfg.blockAutomation === true}/><span><b>Manual requests only</b><small>Block automatic processing even if Processing mode is Automatic.</small></span></label>
						<label class="danger"><input name="fullShutdown" type="checkbox" checked={cfg.fullShutdown === true}/><span><b>Disable APEX processing</b><small>Hard-block APEX analysis until this is turned off again.</small></span></label>
					</div>
					<div class="save-row"><span>Changes are stored in the existing APEX cloud policy.</span><button disabled={!engine.attached || !engine.linked}>Save APEX configuration</button></div>
				</form>
			</section>
		{:else if engine.id === 'studio' && cfg}
			<section class="panel">
				<div class="panel-head"><div><p class="eyebrow">STUDIO ENGINE</p><h2>Routing and analysis</h2></div><span class="pill">Editable</span></div>
				<p class="note">These settings control the Studio processing engine only. Studio documents, journals, sessions and the normal Studio workspace interface remain in Panel.</p>
				<form method="POST" action="?/save" class="config-form">
					<div class="toggles">
						<label><input name="routingEnabled" type="checkbox" checked={cfg.routingEnabled !== false}/><span><b>Enable routing</b><small>Use the routing engine when Studio content is processed.</small></span></label>
						<label><input name="routingAutoAnalyzeCreate" type="checkbox" checked={cfg.routingAutoAnalyzeCreate !== false}/><span><b>Analyse new content</b><small>Automatically analyse newly created Studio content.</small></span></label>
						<label><input name="routingAutoAnalyzeUpdate" type="checkbox" checked={cfg.routingAutoAnalyzeUpdate !== false}/><span><b>Re-analyse updates</b><small>Run analysis again when Studio content changes.</small></span></label>
					</div>
					<div class="subhead"><h3>Confidence thresholds</h3><p>Higher percentages make Studio more selective before it accepts a routing suggestion.</p></div>
					<div class="fields four">
						<label class="field"><span>General</span><div class="with-unit"><input name="routingMinConfidencePercent" type="number" min="0" max="100" step="1" value={pct(cfg.routingMinConfidence)}/><em>%</em></div></label>
						<label class="field"><span>Profiles</span><div class="with-unit"><input name="routingProfileConfidencePercent" type="number" min="0" max="100" step="1" value={pct(cfg.routingProfileConfidence)}/><em>%</em></div></label>
						<label class="field"><span>Incidents</span><div class="with-unit"><input name="routingIncidentConfidencePercent" type="number" min="0" max="100" step="1" value={pct(cfg.routingIncidentConfidence)}/><em>%</em></div></label>
						<label class="field"><span>Timeline</span><div class="with-unit"><input name="routingTimelineConfidencePercent" type="number" min="0" max="100" step="1" value={pct(cfg.routingTimelineConfidence)}/><em>%</em></div></label>
					</div>
					<div class="subhead"><h3>Processing limits</h3><p>Controls how much Studio work is considered in one routing pass.</p></div>
					<div class="fields two">
						<label class="field"><span>Maximum suggestions</span><input name="routingMaxSuggestions" type="number" min="1" max="20" step="1" value={cfg.routingMaxSuggestions || 5}/><small>Maximum routing suggestions returned from one analysis.</small></label>
						<label class="field"><span>Maximum characters</span><input name="routingMaxCharacters" type="number" min="1000" max="200000" step="1000" value={cfg.routingMaxCharacters || 50000}/><small>Upper character limit considered during one analysis pass.</small></label>
					</div>
					<div class="runtime-facts"><span>Matcher <b>{cfg.matcherType || 'deterministic'}</b></span><span>Semantic provider <b>{cfg.semanticProviderStatus || 'not configured'}</b></span><span>Processing <b>Vercel / request driven</b></span></div>
					<div class="save-row"><span>Canonical Studio data remains in Panel and shared Supabase storage.</span><button disabled={!engine.attached || !engine.linked}>Save Studio configuration</button></div>
				</form>
			</section>
		{:else if engine.id === 'mcp'}
			<section class="panel">
				<div class="panel-head"><div><p class="eyebrow">MCP CONFIGURATION</p><h2>Manage the real MCP systems</h2></div><span class="pill">Split by function</span></div>
				<p class="note">MCP does not need a giant duplicate settings form. Its configuration already belongs to several real systems, so each control links directly to the place that owns it.</p>
				<div class="mcp-grid">
					<a href={`/engines/${engine.id}/oauth`}><small>AUTHENTICATION</small><b>OAuth</b><span>Issuer, protected resource, registered clients, grants and token revocation.</span></a>
					<a href={`/engines/${engine.id}/connections`}><small>CLIENT ACCESS</small><b>Connections</b><span>Registered MCP clients, sessions, workspace binding and client state.</span></a>
					<a href={`/engines/${engine.id}/runtime`}><small>ENGINE STATE</small><b>Runtime</b><span>Run, Standby, Restart and Stop the MCP engine independently from setup.</span></a>
					<a href={`/engines/${engine.id}/monitoring`}><small>OBSERVABILITY</small><b>Monitoring</b><span>Runtime, requests, clients, sessions and readiness information.</span></a>
					<a href="https://orbitfs.vercel.app" target="_blank" rel="noreferrer"><small>WORKSPACE CONFIG</small><b>OrbitFS Panel</b><span>Startup system, context bundles, workspace permissions, Library and Profiles.</span></a>
					<a href="/configuration"><small>HOST CONFIG</small><b>Engine Host</b><span>Service URLs, Supabase backing, pairing security and engine overview.</span></a>
				</div>
			</section>
		{/if}

		<section class="panel">
			<div class="panel-head"><div><p class="eyebrow">CONFIGURATION OWNERSHIP</p><h2>What this engine controls</h2></div></div>
			<div class="ownership-table"><div class="row head"><span>Area</span><span>Managed by</span><span>Storage / source</span></div>{#each ownership as item}<div class="row"><span><b>{item[0]}</b></span><span><strong class:host={item[1] === 'Engine Host'}>{item[1]}</strong></span><span>{item[2]}</span></div>{/each}</div>
		</section>

		<section class="manage-grid">
			<a href={`/engines/${engine.id}/setup`}><small>FIRST TIME</small><b>Setup</b><span>Validate link, configuration and readiness.</span></a>
			<a href={`/engines/${engine.id}/connections`}><small>ACCESS</small><b>Connections</b><span>Panel/workspace binding and client/provider state.</span></a>
			<a href={`/engines/${engine.id}/runtime`}><small>ENGINE</small><b>Runtime</b><span>Run, Standby, Restart and Stop.</span></a>
			<a href={`/engines/${engine.id}/diagnostics`}><small>HEALTH</small><b>Diagnostics</b><span>Pairing, deployment and readiness checks.</span></a>
		</section>
	</main>
</div>

<style>
	:global(html){background:#070a0f;color:#f5f7fb;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}:global(body){margin:0}.app{min-height:100vh;background:radial-gradient(circle at 48% -18%,#151d31 0,#080c13 38%,#06080c 100%)}
	header{height:68px;padding:0 28px;border-bottom:1px solid #202733;display:flex;align-items:center;justify-content:space-between;background:rgba(8,11,17,.9);position:sticky;top:0;z-index:10}.brand{display:flex;gap:10px;align-items:center;color:#fff;text-decoration:none}.brand>span:last-child{display:grid}.brand small{font-size:10px;color:#737e8c}.mark{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,#7c3aed,#d946ef);font-weight:900}.crumb{display:flex;gap:7px;align-items:center;font-size:11px;color:#647181}.crumb a{color:#95a0af;text-decoration:none}.crumb b{color:#d8dee7}
	main{max-width:1120px;margin:0 auto;padding:46px 24px 70px}.heading{display:flex;justify-content:space-between;align-items:end;gap:24px}.heading>div{max-width:760px}.eyebrow{font-size:10px;letter-spacing:.18em;color:#9878ff;font-weight:900;margin:0 0 7px}.heading h1{font-size:38px;letter-spacing:-.04em;margin:0}.heading p:not(.eyebrow){color:#8e99a8;line-height:1.6}.host-link{font-size:11px;color:#b8a5ff;text-decoration:none;white-space:nowrap}.notice,.warning{padding:11px 13px;border-radius:10px;margin:14px 0;font-size:11px;line-height:1.55}.notice.error{border:1px solid #7f1d1d;background:#2a0d12;color:#fecaca}.notice.ok{border:1px solid #215a40;background:#0b2118;color:#6ee7a6}.warning{border:1px solid #6b4b18;background:#211708;color:#d9b66d;display:grid;gap:4px}.warning b{color:#f0c36b}
	.status-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:24px 0}.status-grid>div{border:1px solid #252e3a;background:#0d1219;border-radius:14px;padding:14px;display:grid;gap:5px;min-width:0}.status-grid small{font-size:9px;color:#687484}.status-grid b{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-transform:capitalize}.status-grid span{font-size:9px;color:#758190;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
	.panel{border:1px solid #252e3a;background:linear-gradient(180deg,#0e141c,#0a0f15);border-radius:16px;padding:21px;margin-top:16px}.panel-head{display:flex;align-items:center;justify-content:space-between;gap:15px}.panel h2{margin:0;font-size:21px}.pill{font-size:9px;border:1px solid #35404e;border-radius:999px;padding:6px 9px;color:#a9b3bf}.note{font-size:10px;color:#758190;line-height:1.65;margin:12px 0 16px}.config-form{display:grid;gap:18px}.fields{display:grid;gap:12px}.fields.two{grid-template-columns:repeat(2,1fr)}.fields.four{grid-template-columns:repeat(4,1fr)}.field{display:grid;gap:6px}.field>span{font-size:10px;font-weight:800;color:#cdd5df}.field small{font-size:9px;color:#697584;line-height:1.5}.field small b{color:#9ea9b7}input[type="number"],select{width:100%;box-sizing:border-box;border:1px solid #303a47;background:#080c12;color:#edf1f7;border-radius:9px;padding:10px;font:inherit;font-size:11px;outline:none}input[type="number"]:focus,select:focus{border-color:#7c3aed}.with-unit{display:flex;align-items:center;border:1px solid #303a47;background:#080c12;border-radius:9px;overflow:hidden}.with-unit input{border:0;border-radius:0}.with-unit em{font-style:normal;font-size:9px;color:#778392;padding:0 10px;border-left:1px solid #303a47}.toggles{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.toggles label{display:flex;gap:10px;align-items:flex-start;border:1px solid #242d39;background:#0a0f15;border-radius:11px;padding:12px}.toggles label.danger{border-color:#5b2b31;background:#160c10}.toggles input{margin-top:2px}.toggles span{display:grid;gap:4px}.toggles b{font-size:10px}.toggles small{font-size:9px;color:#6f7b89;line-height:1.45}.subhead{border-top:1px solid #202833;padding-top:15px}.subhead h3{font-size:12px;margin:0}.subhead p{font-size:9px;color:#707c8b;margin:4px 0 0}.runtime-facts{display:flex;gap:8px;flex-wrap:wrap}.runtime-facts span{border:1px solid #293240;background:#0a0f15;border-radius:8px;padding:8px 9px;font-size:9px;color:#6f7b89}.runtime-facts b{color:#b8c1cd;margin-left:4px}.save-row{display:flex;align-items:center;justify-content:space-between;gap:15px;border-top:1px solid #202833;padding-top:15px}.save-row span{font-size:9px;color:#707c8b}.save-row button{border:1px solid #7254e8;background:#7254e8;color:#fff;border-radius:9px;padding:9px 12px;font-weight:800;font-size:10px;cursor:pointer}.save-row button:disabled{opacity:.4;cursor:not-allowed}
	.mcp-grid,.manage-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.mcp-grid a,.manage-grid a{border:1px solid #252e3a;background:#0a0f15;border-radius:12px;padding:14px;color:#d7dee8;text-decoration:none;display:grid;gap:5px}.mcp-grid a:hover,.manage-grid a:hover{border-color:#55427f;background:#11101c}.mcp-grid small,.manage-grid small{font-size:8px;color:#7668a5;letter-spacing:.12em}.mcp-grid b,.manage-grid b{font-size:12px}.mcp-grid span,.manage-grid span{font-size:9px;color:#74808f;line-height:1.5}.manage-grid{margin-top:16px;grid-template-columns:repeat(4,1fr)}
	.ownership-table{display:grid;border:1px solid #222b36;border-radius:11px;overflow:hidden}.row{display:grid;grid-template-columns:1.1fr .8fr 1.4fr;gap:12px;padding:10px 12px;border-bottom:1px solid #202833;font-size:9px;color:#7c8896}.row:last-child{border-bottom:0}.row.head{background:#0a0f15;color:#5f6b79;text-transform:uppercase;font-weight:800}.row b{color:#c8d0da}.row strong{color:#aab4c1}.row strong.host{color:#bca9ff}
	@media(max-width:900px){.status-grid{grid-template-columns:repeat(2,1fr)}.fields.four{grid-template-columns:repeat(2,1fr)}.mcp-grid{grid-template-columns:repeat(2,1fr)}.manage-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:650px){main{padding:30px 16px 55px}.heading{align-items:stretch;flex-direction:column}.host-link{align-self:flex-start}.status-grid,.fields.two,.fields.four,.toggles,.mcp-grid,.manage-grid{grid-template-columns:1fr}.save-row{align-items:stretch;flex-direction:column}.save-row button{width:100%}.row{grid-template-columns:1fr}.row.head{display:none}.row span:nth-child(2):before{content:'Managed by: ';color:#596675}.row span:nth-child(3):before{content:'Source: ';color:#596675}.crumb a:first-child,.crumb>span:first-of-type{display:none}}
</style>
