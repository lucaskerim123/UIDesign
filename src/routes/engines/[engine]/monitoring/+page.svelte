<script lang="ts">
	let { data } = $props();
	const engine = data.engine;
	const m = data.metrics;
	const cards = engine.id === 'mcp'
		? [
			['Active clients', m.activeClients, `${m.clients || 0} registered`],
			['Active sessions', m.activeSessions, `${m.totalRequests || 0} recorded requests`],
			['OAuth tokens', m.oauthActive, 'currently valid access tokens'],
			['Audit activity', m.auditEvents24h, 'events in the last 24 hours']
		]
		: [
			['Runtime', m.engineState, 'current engine mode'],
			['Setup', m.setupState, 'independent setup state'],
			['Generation', m.generation, 'runtime generation'],
			['Readiness', data.readiness.ready ? 'Ready' : 'Blocked', data.readiness.ready ? 'all required checks pass' : `${data.readiness.blocking.length} blocking checks`]
		];
	const fmt=(value:any)=>value ? new Date(value).toLocaleString() : 'None yet';
	const resultLabel = (check:any) => check.ok ? 'Pass' : check.required ? 'Required' : 'Recommended';
</script>

<svelte:head><title>{engine.name} Monitoring · OrbitFS Engine Host</title><meta name="robots" content="noindex,nofollow" /></svelte:head>
<div class="app">
	<header><a class="brand" href="/engines"><span class="mark">O</span><span><b>OrbitFS</b><small>Engine Host</small></span></a><div class="crumb"><a href="/configuration">Host configuration</a><span>/</span><a href={`/engines/${engine.id}`}>{engine.name}</a><span>/</span><b>Monitoring</b></div></header>
	<main>
		<div class="heading"><p class="eyebrow">MONITORING</p><h1>{engine.fullName}</h1><p>Current engine and connection state from the shared OrbitFS backend. Required failures block readiness; recommendations are clearly marked but do not stop setup.</p></div>
		<section class="cards">{#each cards as card}<div><small>{card[0]}</small><strong>{card[1]}</strong><span>{card[2]}</span></div>{/each}</section>
		<section class="panel">
			<div class="panel-head"><div><p class="eyebrow">READINESS</p><h2>Engine health checks</h2></div><span class:ok={data.readiness.ready} class="pill">{data.readiness.ready ? 'Required checks pass' : 'Needs attention'}</span></div>
			<div class="checks">{#each data.readiness.checks as check}<div class:optional={!check.required && !check.ok}><span class:ok={check.ok} class:optional={!check.required && !check.ok} class="dot"></span><div><b>{check.label}</b><small>{check.description}</small></div><strong class:recommended={!check.required && !check.ok}>{resultLabel(check)}</strong></div>{/each}</div>
		</section>
		<section class="panel">
			<div class="panel-head"><div><p class="eyebrow">ACTIVITY</p><h2>Recent timestamps</h2></div></div>
			<div class="details"><span>Last engine request</span><code>{fmt(m.lastRequestAt)}</code><span>Last runtime control</span><code>{fmt(m.lastControlAt)}</code><span>Last Panel sync</span><code>{fmt(m.lastSyncAt)}</code>{#if engine.id==='mcp'}<span>Last client seen</span><code>{fmt(m.lastClientSeenAt)}</code><span>Last session seen</span><code>{fmt(m.lastSessionSeenAt)}</code>{/if}</div>
		</section>
		<div class="actions"><a href={`/engines/${engine.id}`}>Overview</a><a href={`/engines/${engine.id}/runtime`}>Runtime</a><a href={`/engines/${engine.id}/logs`}>Logs</a><a href={`/engines/${engine.id}/diagnostics`}>Diagnostics</a></div>
	</main>
</div>
<style>
	:global(html){background:#070a0f;color:#f5f7fb;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}:global(body){margin:0}.app{min-height:100vh;background:radial-gradient(circle at 50% -20%,#152033,#080c13 40%,#06080c 100%)}header{height:68px;padding:0 28px;border-bottom:1px solid #202733;display:flex;align-items:center;justify-content:space-between;background:#090d13}.brand{display:flex;gap:10px;align-items:center;color:#fff;text-decoration:none}.brand>span:last-child{display:grid}.brand small{font-size:10px;color:#737e8c}.mark{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,#7c3aed,#d946ef);font-weight:900}.crumb{display:flex;gap:8px;font-size:11px;color:#657181}.crumb a{color:#9aa5b4;text-decoration:none}.crumb b{color:#d8dee7}main{max-width:1120px;margin:0 auto;padding:46px 24px 70px}.heading{max-width:760px}.eyebrow{font-size:10px;letter-spacing:.18em;color:#9878ff;font-weight:900;margin:0 0 7px}.heading h1{font-size:38px;letter-spacing:-.04em;margin:0}.heading>p:last-child{color:#8e99a8;line-height:1.6}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:24px 0}.cards>div{border:1px solid #252e3a;background:#0d1219;border-radius:14px;padding:16px;display:grid;gap:6px}.cards small{font-size:9px;color:#687484;text-transform:uppercase}.cards strong{font-size:21px;text-transform:capitalize}.cards span{font-size:10px;color:#758190}.panel{border:1px solid #252e3a;background:linear-gradient(180deg,#0e141c,#0a0f15);border-radius:16px;padding:21px;margin-top:16px}.panel-head{display:flex;justify-content:space-between;align-items:center;gap:16px}.panel h2{margin:0;font-size:21px}.pill{font-size:10px;border:1px solid #65451b;color:#f0c36b;border-radius:999px;padding:6px 9px}.pill.ok{border-color:#215a40;color:#6ee7a6}.checks{display:grid;margin-top:16px}.checks>div{display:grid;grid-template-columns:auto 1fr auto;gap:11px;align-items:center;padding:11px 4px;border-top:1px solid #222b36}.checks>div:first-child{border-top:0}.checks>div.optional{opacity:.85}.dot{width:8px;height:8px;border-radius:50%;background:#f59e0b}.dot.ok{background:#22c55e}.dot.optional{background:#8b5cf6}.checks div div{display:grid}.checks b{font-size:12px}.checks small{font-size:10px;color:#758190;margin-top:3px}.checks strong{font-size:10px;color:#d6a84f}.checks strong.recommended{color:#a78bfa}.checks .ok+div+strong{color:#63d99a}.details{display:grid;grid-template-columns:170px 1fr;gap:10px 14px;margin-top:16px}.details span{font-size:10px;color:#6d7988}.details code{font-size:10px;color:#cbd3dd}.actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px}.actions a{border:1px solid #35404e;background:#111821;color:#d1d8e1;border-radius:9px;padding:9px 12px;font-size:11px;font-weight:800;text-decoration:none}@media(max-width:820px){.cards{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){header{padding:0 16px}.crumb{display:none}main{padding:34px 16px 55px}.heading h1{font-size:31px}.cards{grid-template-columns:1fr}.details{grid-template-columns:1fr}.details span{margin-top:7px}}
</style>
