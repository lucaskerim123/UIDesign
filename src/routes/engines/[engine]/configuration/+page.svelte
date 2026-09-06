<script lang="ts">
	let { data } = $props();
	const engine = data.engine;
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
				['Routing and processing', 'APEX runtime', 'Engine Host'],
				['Base placement rules', 'APEX setup', 'Engine Host'],
				['Library and profiles', 'Shared Supabase data', 'Panel'],
				['Projects / OSS / CCS', 'Shared workspace data', 'Panel']
			]
			: [
				['Processing and analysis', 'Studio runtime', 'Engine Host'],
				['Advanced runtime', 'Studio setup', 'Engine Host'],
				['Studio data and normal UI', 'Shared workspace data', 'Panel'],
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
		<section class="heading"><div><p class="eyebrow">CONFIGURATION</p><h1>{engine.fullName}</h1><p>Engine Host only owns engine-specific configuration. Panel-owned OrbitFS systems stay in Panel and are referenced through the shared backend.</p></div></section>

		<section class="cards">
			<div><small>PANEL LINK</small><b>{engine.linked ? 'Connected' : 'Not linked'}</b><span>{engine.panelUrl || 'Attach from Panel first'}</span></div>
			<div><small>SETUP</small><b>{engine.setupState.replaceAll('_',' ')}</b><span>Version {engine.setupVersion}</span></div>
			<div><small>RUNTIME</small><b>{engine.engineState}</b><span>{engine.state?.compute || 'vercel'} · {engine.state?.database || 'supabase'}</span></div>
			<div><small>WORKSPACE</small><b>{engine.workspaceName || 'Unassigned'}</b><span>{engine.workspaceId || 'No workspace link'}</span></div>
		</section>

		<section class="panel">
			<div class="panel-head"><div><p class="eyebrow">OWNERSHIP MAP</p><h2>What is configured where</h2></div></div>
			<div class="table"><div class="row head"><span>Area</span><span>Source</span><span>Authority</span></div>{#each engineBlocks as block}<div class="row"><span><b>{block[0]}</b></span><span>{block[1]}</span><span><strong class:host={block[2] === 'Engine Host'}>{block[2]}</strong></span></div>{/each}</div>
		</section>

		<section class="panel">
			<div class="panel-head"><div><p class="eyebrow">MANAGEMENT</p><h2>Engine configuration flow</h2></div></div>
			<div class="actions">{#each actions as action}<a class:primary={action[2] === true} href={action[1]}>{action[0]}</a>{/each}</div>
			<p class="note">Controls are only added here when they have real backend behaviour. Panel data is never cloned into Engine Host.</p>
		</section>
	</main>
</div>

<style>
	:global(html){background:#070a0f;color:#f5f7fb;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}:global(body){margin:0}.app{min-height:100vh;background:radial-gradient(circle at 48% -18%,#151d31 0,#080c13 38%,#06080c 100%)}
	header{height:68px;padding:0 28px;border-bottom:1px solid #202733;display:flex;align-items:center;justify-content:space-between;background:rgba(8,11,17,.9)}.brand{display:flex;gap:10px;align-items:center;color:#fff;text-decoration:none}.brand>span:last-child{display:grid}.brand small{font-size:10px;color:#737e8c}.mark{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,#7c3aed,#d946ef);font-weight:900}.crumb{display:flex;gap:7px;align-items:center;font-size:11px;color:#647181}.crumb a{color:#95a0af;text-decoration:none}.crumb b{color:#d8dee7}
	main{max-width:1120px;margin:0 auto;padding:46px 24px 70px}.heading{max-width:760px}.eyebrow{font-size:10px;letter-spacing:.18em;color:#9878ff;font-weight:900;margin:0 0 7px}.heading h1{font-size:38px;letter-spacing:-.04em;margin:0}.heading p:not(.eyebrow){color:#8e99a8;line-height:1.6}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:24px 0}.cards>div{border:1px solid #252e3a;background:#0d1219;border-radius:14px;padding:14px;display:grid;gap:5px;min-width:0}.cards small{font-size:9px;color:#687484}.cards b{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-transform:capitalize}.cards span{font-size:10px;color:#758190;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.panel{border:1px solid #252e3a;background:linear-gradient(180deg,#0e141c,#0a0f15);border-radius:16px;padding:21px;margin-top:16px}.panel-head{display:flex;align-items:center;justify-content:space-between}.panel h2{margin:0;font-size:21px}.table{display:grid;margin-top:16px}.row{display:grid;grid-template-columns:1.4fr 1.2fr .8fr;gap:12px;padding:11px 8px;border-top:1px solid #222b36;font-size:11px;color:#aab3bf}.row.head{border-top:0;color:#667383;text-transform:uppercase;font-size:9px}.row strong{color:#9ca7b4}.row strong.host{color:#c4b5fd}.actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:17px}.actions a{border:1px solid #35404e;background:#111821;color:#d1d8e1;border-radius:9px;padding:9px 12px;font-size:11px;font-weight:800;text-decoration:none}.actions a.primary{background:#6d28d9;border-color:#7c3aed;color:#fff}.note{font-size:10px;color:#758190;line-height:1.55;margin:14px 0 0}
	@media(max-width:850px){.cards{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){header{padding:0 16px}.crumb{display:none}main{padding:34px 16px 55px}.heading h1{font-size:31px}.cards{grid-template-columns:1fr}.row{grid-template-columns:1fr}.row.head{display:none}}
</style>
