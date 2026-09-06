<script lang="ts">
	let { data } = $props();
	const engine = data.engine;
</script>

<svelte:head><title>{engine.name} Diagnostics · OrbitFS Engine Host</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<div class="app">
	<header>
		<a class="brand" href="/engines"><span class="mark">O</span><span><b>OrbitFS</b><small>Engine Host</small></span></a>
		<div class="crumb"><a href="/engines">Engines</a><span>/</span><a href={`/engines/${engine.id}`}>{engine.name}</a><span>/</span><b>Diagnostics</b></div>
	</header>
	<main>
		<section class="heading"><div><p class="eyebrow">DIAGNOSTICS</p><h1>{engine.fullName}</h1><p>Read-only health and pairing details for this Engine Host. Nothing here changes Panel-owned OrbitFS data.</p></div><div class:ready={data.ready} class="health"><span></span><b>{data.ready ? 'Healthy' : 'Attention required'}</b></div></section>

		<section class="grid">
			<div class="panel">
				<div class="panel-head"><div><p class="eyebrow">PREFLIGHT</p><h2>Readiness checks</h2></div><span class="pill">{data.checks.filter((c:any)=>c.ok).length}/{data.checks.length}</span></div>
				<div class="checks">{#each data.checks as check}<div class:ok={check.ok}><b>{check.ok ? '✓' : '!'}</b><span><strong>{check.label}</strong><small>{check.description}</small></span><em>{check.ok ? 'Pass' : 'Fail'}</em></div>{/each}</div>
			</div>
			<aside>
				<div class="card"><span>Panel link</span><b>{engine.linked ? 'Connected' : 'Not linked'}</b><code>{engine.panelUrl || '—'}</code></div>
				<div class="card"><span>Installation</span><b>{engine.state?.installationId || engine.installationId || 'Current OrbitFS installation'}</b><code>{engine.workspaceId || 'No workspace link'}</code></div>
				<div class="card"><span>Setup</span><b>{engine.setupState.replaceAll('_',' ')}</b><code>version {engine.setupVersion}</code></div>
				<div class="card"><span>Runtime</span><b>{engine.engineState}</b><code>{engine.state?.deployment || 'ready'} · {engine.state?.compute || 'vercel'}</code></div>
				<div class="card"><span>Last Panel sync</span><b>{engine.lastSyncAt || 'Never'}</b><code>{engine.workspaceName || 'No workspace assigned'}</code></div>
				{#if engine.transportPath}<div class="card"><span>Transport</span><b>{engine.transportPath}</b><code>Protocol endpoint</code></div>{/if}
			</aside>
		</section>
	</main>
</div>

<style>
	:global(html){background:#070a0f;color:#f5f7fb;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}:global(body){margin:0}.app{min-height:100vh;background:radial-gradient(circle at 48% -18%,#151d31 0,#080c13 38%,#06080c 100%)}
	header{height:68px;padding:0 28px;border-bottom:1px solid #202733;display:flex;align-items:center;justify-content:space-between;background:rgba(8,11,17,.9)}.brand{display:flex;gap:10px;align-items:center;color:#fff;text-decoration:none}.brand>span:last-child{display:grid}.brand small{font-size:10px;color:#737e8c}.mark{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,#7c3aed,#d946ef);font-weight:900}.crumb{display:flex;gap:7px;align-items:center;font-size:11px;color:#647181}.crumb a{color:#95a0af;text-decoration:none}.crumb b{color:#d8dee7}
	main{max-width:1120px;margin:0 auto;padding:46px 24px 70px}.heading{display:flex;align-items:end;justify-content:space-between;gap:24px}.heading>div:first-child{max-width:760px}.eyebrow{font-size:10px;letter-spacing:.18em;color:#9878ff;font-weight:900;margin:0 0 7px}.heading h1{font-size:38px;letter-spacing:-.04em;margin:0}.heading p:not(.eyebrow){color:#8e99a8;line-height:1.6}.health{border:1px solid #6b4b18;background:#211707;border-radius:13px;padding:11px 13px;display:flex;gap:8px;align-items:center;font-size:11px}.health span{width:8px;height:8px;border-radius:50%;background:#f59e0b}.health.ready{border-color:#205b3d;background:#092116}.health.ready span{background:#22c55e}
	.grid{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:16px;margin-top:24px}.panel,.card{border:1px solid #252e3a;background:linear-gradient(180deg,#0e141c,#0a0f15);border-radius:16px}.panel{padding:21px}.panel-head{display:flex;align-items:center;justify-content:space-between}.panel h2{margin:0;font-size:21px}.pill{font-size:10px;border:1px solid #374151;border-radius:999px;padding:6px 9px;color:#a9b3bf}.checks{display:grid;gap:8px;margin-top:16px}.checks>div{display:grid;grid-template-columns:30px 1fr auto;gap:10px;align-items:center;border:1px solid #26303c;background:#090e14;border-radius:11px;padding:11px}.checks>div>b{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;background:#281b09;color:#efc06a}.checks>div.ok>b{background:#0e3020;color:#67e8a2}.checks span{display:grid}.checks strong{font-size:12px}.checks small{font-size:10px;color:#748090;margin-top:2px}.checks em{font-style:normal;font-size:9px;text-transform:uppercase;color:#9a7440}.checks .ok em{color:#63d99a}aside{display:grid;gap:10px;align-content:start}.card{padding:14px;display:grid;gap:4px;overflow:hidden}.card span{font-size:9px;color:#687484;text-transform:uppercase}.card b{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.card code{font-size:9px;color:#7f8998;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
	@media(max-width:850px){.grid{grid-template-columns:1fr}.heading{align-items:stretch;flex-direction:column}.health{width:max-content}}@media(max-width:560px){header{padding:0 16px}.crumb{display:none}main{padding:34px 16px 55px}.heading h1{font-size:31px}.checks>div{grid-template-columns:30px 1fr}.checks em{grid-column:2}}
</style>
