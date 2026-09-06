<script lang="ts">
	let { data, form } = $props();
	const engine = data.engine;
	const doneCount = data.checks.filter((check: any) => check.ok).length;
	const totalCount = data.checks.length;
</script>

<svelte:head><title>{engine.name} Setup · OrbitFS Engine Host</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<div class="app">
	<header>
		<a class="brand" href="/engines"><span class="mark">O</span><span><b>OrbitFS</b><small>Engine Host</small></span></a>
		<div class="crumb"><a href="/engines">Engines</a><span>/</span><a href={`/engines/${engine.id}`}>{engine.name}</a><span>/</span><b>Setup</b></div>
	</header>
	<main>
		<section class="heading">
			<div><p class="eyebrow">FIRST-TIME SETUP</p><h1>{engine.fullName}</h1><p>Engine Host verifies the Panel pairing, licence, shared workspace and runtime before this engine can be marked ready.</p></div>
			<div class:ready={data.ready} class="score"><strong>{doneCount}/{totalCount}</strong><span>{data.ready ? 'Ready' : 'Checks passed'}</span></div>
		</section>

		{#if form?.error}<div class="alert error">{form.error}</div>{/if}
		{#if form?.message}<div class="alert success">{form.message}</div>{/if}

		<section class="flow">
			<div class:active={!engine.linked} class:done={engine.linked}><b>1</b><span><strong>Attach from Panel</strong><small>Panel confirms the licence and pairs this Engine Host to the correct installation and workspace.</small></span></div>
			<div class:active={engine.linked && engine.setupState !== 'complete'} class:done={engine.setupState === 'complete'}><b>2</b><span><strong>Validate Engine Host</strong><small>Run the shared-backend, runtime and engine-specific readiness checks below.</small></span></div>
			<div class:active={data.ready && engine.setupState !== 'complete'} class:done={engine.setupState === 'complete'}><b>3</b><span><strong>Complete setup</strong><small>Mark setup complete. Runtime may remain in Standby until Panel or an authorised user wakes it.</small></span></div>
		</section>

		<div class="layout">
			<section class="panel">
				<div class="panel-head"><div><p class="eyebrow">READINESS</p><h2>Preflight checks</h2></div><span class:ready={data.ready} class="pill">{data.ready ? 'Ready' : `${data.blocking.length} blocking`}</span></div>
				<div class="checks">
					{#each data.checks as check}
						<div class:ok={check.ok} class="check"><div class="status">{check.ok ? '✓' : '!'}</div><div><strong>{check.label}</strong><small>{check.description}</small></div><span>{check.ok ? 'Passed' : check.required ? 'Required' : 'Optional'}</span></div>
					{/each}
				</div>
				{#if data.canManage}
					<div class="actions">
						{#if engine.setupState === 'complete'}
							<form method="POST" action="?/rerun"><button>Run setup again</button></form>
					{:else}
							<form method="POST" action="?/begin"><button>Begin / continue setup</button></form>
							<form method="POST" action="?/complete"><button class="primary" disabled={!data.ready}>Complete setup</button></form>
						{/if}
					</div>
				{/if}
			</section>

			<aside>
				<div class="card"><span>Panel link</span><b>{engine.linked ? 'Connected' : 'Not connected'}</b><small>{engine.panelUrl || 'Attach from Panel first'}</small></div>
				<div class="card"><span>Workspace</span><b>{engine.workspaceName || 'Not assigned'}</b><small>{engine.workspaceId || 'No workspace link yet'}</small></div>
				<div class="card"><span>Licence</span><b>{engine.licensed ? 'Allowed' : 'Required'}</b><small>{engine.component || engine.id}</small></div>
				<div class="card"><span>Runtime</span><b>{engine.engineState}</b><small>Setup and runtime are independent.</small></div>
				{#if engine.id === 'mcp'}<div class="card"><span>MCP transport</span><b>/mcp</b><small>The protocol endpoint remains separate from this management UI.</small></div>{/if}
			</aside>
		</div>
	</main>
</div>

<style>
	:global(html){background:#070a0f;color:#f5f7fb;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}:global(body){margin:0}.app{min-height:100vh;background:radial-gradient(circle at 48% -18%,#151d31 0,#080c13 38%,#06080c 100%)}
	header{height:68px;padding:0 28px;border-bottom:1px solid #202733;display:flex;align-items:center;justify-content:space-between;background:rgba(8,11,17,.9);backdrop-filter:blur(16px)}.brand{display:flex;gap:10px;align-items:center;color:#fff;text-decoration:none}.brand>span:last-child{display:grid}.brand small{font-size:10px;color:#737e8c}.mark{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,#7c3aed,#d946ef);font-weight:900}.crumb{display:flex;gap:7px;align-items:center;font-size:11px;color:#647181}.crumb a{color:#95a0af;text-decoration:none}.crumb b{color:#d8dee7}
	main{max-width:1120px;margin:0 auto;padding:46px 24px 70px}.heading{display:flex;justify-content:space-between;align-items:end;gap:24px}.heading>div:first-child{max-width:760px}.eyebrow{font-size:10px;letter-spacing:.18em;color:#9878ff;font-weight:900;margin:0 0 7px}.heading h1{font-size:38px;letter-spacing:-.04em;margin:0}.heading p:not(.eyebrow){color:#8e99a8;line-height:1.6}.score{min-width:105px;border:1px solid #59421c;background:#211707;border-radius:14px;padding:13px 16px;display:grid;text-align:right}.score strong{font-size:22px}.score span{font-size:10px;color:#d8b46d}.score.ready{border-color:#205b3d;background:#092116}.score.ready span{color:#6ee7a6}
	.alert{margin:18px 0 0;padding:12px 14px;border-radius:10px;font-size:12px}.alert.error{border:1px solid #7f1d1d;background:#2a0d12;color:#fecaca}.alert.success{border:1px solid #1f6a45;background:#0c291b;color:#a7f3d0}.flow{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:26px 0}.flow>div{display:flex;gap:10px;border:1px solid #252d39;background:#0d1219;border-radius:13px;padding:14px;opacity:.7}.flow>div.active{opacity:1;border-color:#5d46a0}.flow>div.done{opacity:1;border-color:#20553b}.flow b{width:27px;height:27px;flex:0 0 27px;border-radius:8px;display:grid;place-items:center;background:#171e28;color:#8c97a4;font-size:11px}.flow .done b{background:#123322;color:#64e6a0}.flow span{display:grid}.flow strong{font-size:12px}.flow small{font-size:10px;line-height:1.45;color:#778291;margin-top:3px}
	.layout{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:16px}.panel,.card{border:1px solid #252e3a;background:linear-gradient(180deg,#0e141c,#0a0f15);border-radius:16px}.panel{padding:21px}.panel-head{display:flex;align-items:center;justify-content:space-between;gap:18px}.panel h2{margin:0;font-size:21px}.pill{font-size:10px;border:1px solid #6b4b18;color:#e6bf70;background:#211707;border-radius:999px;padding:6px 9px}.pill.ready{border-color:#205b3d;color:#6ee7a6;background:#092116}.checks{display:grid;gap:8px;margin-top:18px}.check{display:grid;grid-template-columns:32px 1fr auto;gap:10px;align-items:center;border:1px solid #26303c;background:#090e14;border-radius:11px;padding:11px}.status{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;background:#281b09;color:#efc06a;font-weight:900}.check.ok .status{background:#0e3020;color:#67e8a2}.check>div:nth-child(2){display:grid}.check strong{font-size:12px}.check small{font-size:10px;color:#748090;margin-top:2px;line-height:1.4}.check>span{font-size:9px;text-transform:uppercase;color:#758190}.check.ok>span{color:#63d99a}.actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px}.actions form{margin:0}button{border:1px solid #35404e;background:#111821;color:#d1d8e1;border-radius:9px;padding:9px 12px;font:inherit;font-size:11px;font-weight:800;cursor:pointer}button.primary{background:#6d28d9;border-color:#7c3aed;color:white}button:disabled{opacity:.4;cursor:not-allowed}aside{display:grid;gap:10px;align-content:start}.card{padding:14px;display:grid;gap:4px;overflow:hidden}.card span{font-size:9px;color:#687484;text-transform:uppercase}.card b{font-size:12px;text-transform:capitalize}.card small{font-size:10px;color:#7f8998;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
	@media(max-width:850px){.layout{grid-template-columns:1fr}.flow{grid-template-columns:1fr}.heading{align-items:stretch;flex-direction:column}.score{text-align:left;min-width:0;width:max-content}}@media(max-width:560px){header{padding:0 16px}.crumb{display:none}main{padding:34px 16px 55px}.heading h1{font-size:31px}.check{grid-template-columns:32px 1fr}.check>span{grid-column:2}}
</style>
