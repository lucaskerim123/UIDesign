<script lang="ts">
	let { data, form } = $props();
	const engine = data.engine;
	const setupLabel = engine.setupState === 'complete' ? 'Setup complete' : engine.setupState === 'in_progress' ? 'Setup in progress' : 'Setup required';
	const nav = [
		['Overview', `/engines/${engine.id}`],
		['Setup', `/engines/${engine.id}/setup`],
		['Configuration', `/engines/${engine.id}/configuration`],
		['Connections', `/engines/${engine.id}/connections`],
		...(engine.id === 'mcp' ? [['OAuth', `/engines/${engine.id}/oauth`]] : []),
		['Runtime', `/engines/${engine.id}/runtime`],
		['Monitoring', `/engines/${engine.id}/monitoring`],
		['Logs', `/engines/${engine.id}/logs`],
		['Diagnostics', `/engines/${engine.id}/diagnostics`]
	];
	const flow = [
		['1','First-time setup','Validate Panel pairing, licence, workspace and runtime readiness.',`/engines/${engine.id}/setup`],
		['2','Configuration','Engine-specific configuration only. Panel-owned systems stay in Panel.',`/engines/${engine.id}/configuration`],
		['3','Connections',engine.id === 'mcp' ? 'MCP clients, sessions and Panel binding.' : 'Panel binding and engine-specific providers.',`/engines/${engine.id}/connections`],
		...(engine.id === 'mcp' ? [['4','OAuth','Panel authority, MCP resource metadata, grants and token controls.',`/engines/${engine.id}/oauth`]] : []),
		[engine.id === 'mcp' ? '5':'4','Runtime','Run, Standby, Restart or Stop independently from setup.',`/engines/${engine.id}/runtime`],
		[engine.id === 'mcp' ? '6':'5','Monitoring','Read live engine, client and readiness telemetry.',`/engines/${engine.id}/monitoring`],
		[engine.id === 'mcp' ? '7':'6','Logs','Inspect recent engine activity from shared audit data.',`/engines/${engine.id}/logs`],
		[engine.id === 'mcp' ? '8':'7','Diagnostics','Read-only deployment, pairing and readiness health.',`/engines/${engine.id}/diagnostics`]
	];
</script>

<svelte:head><title>{engine.name} · OrbitFS Engine Host</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<div class="app">
	<header>
		<a class="brand" href="/engines"><span class="mark">O</span><span><b>OrbitFS</b><small>Engine Host</small></span></a>
		<div class="head-actions"><a href="/configuration">Host configuration</a>{#if engine.panelUrl}<a href={engine.panelUrl}>Open Panel</a>{/if}<a href="/engines">← All engines</a></div>
	</header>
	<div class="layout">
		<aside>
			<div class="engine-title"><div class="icon">{engine.name.slice(0,1)}</div><div><small>ENGINE</small><b>{engine.fullName}</b></div></div>
			<nav>{#each nav as item}<a class:active={item[0] === 'Overview'} href={item[1]}>{item[0]}</a>{/each}</nav>
			<div class="side-status"><span>Workspace</span><b>{engine.workspaceName || 'Not linked'}</b><span>Panel</span><b>{engine.panelUrl || 'Not linked'}</b><span>Storage</span><b>Supabase / shared</b></div>
		</aside>
		<main>
			<section class="heading">
				<div><p class="eyebrow">{engine.id.toUpperCase()} ENGINE</p><h1>{engine.fullName}</h1><p>{engine.description}</p></div>
				<div class="state"><span class:good={engine.engineState === 'running'} class:stopped={engine.engineState === 'stopped'}></span><b>{engine.engineState}</b><small>{engine.linked ? 'Linked to Panel' : 'Waiting for Panel link'}</small></div>
			</section>

			{#if form?.error}<div class="alert error">{form.error}</div>{/if}
			{#if !engine.linked}<div class="alert warn"><b>Panel link required.</b> Install and attach this engine from OrbitFS Panel to bind the correct installation and workspace.</div>{/if}
			{#if !engine.licensed}<div class="alert warn"><b>Licence required.</b> The canonical OrbitFS licence does not currently allow this engine on this installation.</div>{/if}

			<section class="cards">
				<div class="card"><small>ATTACHED</small><strong>{engine.attached ? 'Yes' : 'No'}</strong><span>{engine.linked ? 'Panel handshake confirmed' : 'No active pairing'}</span></div>
				<div class="card"><small>SETUP</small><strong>{setupLabel}</strong><span>Version {engine.setupVersion}</span></div>
				<div class="card"><small>RUNTIME</small><strong>{engine.engineState}</strong><span>{engine.state?.deployment || 'ready'} · {engine.state?.compute || 'vercel'}</span></div>
				<div class="card"><small>WORKSPACE</small><strong>{engine.workspaceName || 'Unassigned'}</strong><span>{engine.workspaceId || 'Attach from Panel first'}</span></div>
			</section>

			<section class="panel">
				<div class="panel-head"><div><p class="eyebrow">MANAGEMENT FLOW</p><h2>Engine Host responsibilities</h2></div></div>
				<div class="flow">
					{#each flow as item}<a href={item[3]}><b>{item[0]}</b><span><strong>{item[1]}</strong><small>{item[2]}</small></span></a>{/each}
				</div>
			</section>

			<section class="panel">
				<div class="panel-head"><div><p class="eyebrow">CURRENT LINK</p><h2>Panel ↔ Engine Host</h2></div><span class="pill">{engine.linked ? 'linked' : 'not linked'}</span></div>
				<div class="details"><span>Panel URL</span><code>{engine.panelUrl || 'Not linked'}</code><span>Workspace</span><code>{engine.workspaceName || engine.workspaceId || 'Not linked'}</code><span>Last sync</span><code>{engine.lastSyncAt || 'Never'}</code>{#if engine.transportPath}<span>Transport</span><code>{engine.transportPath}</code>{/if}</div>
			</section>
		</main>
	</div>
</div>

<style>
	:global(html){background:#06090e;color:#f5f7fb;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}:global(body){margin:0}.app{min-height:100vh;background:#070a0f}header{height:68px;padding:0 28px;border-bottom:1px solid #212833;display:flex;align-items:center;justify-content:space-between;background:#090d13;position:sticky;top:0;z-index:10}.brand{display:flex;gap:10px;align-items:center;color:#fff;text-decoration:none}.brand>span:last-child{display:grid}.brand small{font-size:10px;color:#737e8c}.mark{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,#7c3aed,#d946ef);font-weight:900}.head-actions{display:flex;gap:14px}.head-actions a{color:#9aa5b4;text-decoration:none;font-size:12px}.layout{display:grid;grid-template-columns:245px 1fr;min-height:calc(100vh - 69px)}aside{border-right:1px solid #202733;padding:24px 16px;background:#090d13}.engine-title{display:flex;align-items:center;gap:11px;padding:0 8px 20px;border-bottom:1px solid #202733}.engine-title .icon{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;background:#1d1834;color:#bea8ff;font-weight:900}.engine-title div:last-child{display:grid}.engine-title small{font-size:9px;color:#687483}.engine-title b{font-size:13px}nav{display:grid;padding:16px 0}nav a{padding:9px 10px;border-radius:8px;text-decoration:none;color:#8e99a8;font-size:12px}nav a:hover,nav a.active{background:#111821;color:#fff}.side-status{border-top:1px solid #202733;padding:16px 8px;display:grid;gap:4px;overflow:hidden}.side-status span{font-size:9px;color:#657181;text-transform:uppercase;margin-top:7px}.side-status b{font-size:10px;color:#9ba5b2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}main{padding:38px;max-width:1180px;width:100%;box-sizing:border-box;margin:0 auto}.heading{display:flex;justify-content:space-between;align-items:end;gap:25px;margin-bottom:24px}.eyebrow{font-size:10px;letter-spacing:.18em;color:#9878ff;font-weight:900;margin:0 0 7px}.heading h1{font-size:36px;letter-spacing:-.04em;margin:0}.heading p:not(.eyebrow){color:#8f9aa8;margin:9px 0 0}.state{min-width:150px;border:1px solid #27303d;border-radius:12px;padding:12px 14px;background:#0d1219;display:grid;grid-template-columns:auto 1fr;column-gap:8px;align-items:center;text-transform:capitalize}.state small{grid-column:2;color:#758090;font-size:10px}.state>span{width:8px;height:8px;border-radius:50%;background:#f59e0b}.state>span.good{background:#22c55e}.state>span.stopped{background:#ef4444}.alert{padding:12px 14px;border-radius:11px;margin:12px 0;font-size:12px;line-height:1.5}.alert.warn{background:#221909;border:1px solid #6a4a16;color:#e7c783}.alert.error{background:#2a0d12;border:1px solid #7f1d1d;color:#fecaca}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:24px 0}.card{border:1px solid #242d39;border-radius:14px;background:#0d1219;padding:16px;display:grid;gap:7px}.card small{font-size:9px;color:#667382;letter-spacing:.08em}.card strong{font-size:15px;text-transform:capitalize}.card span{font-size:10px;color:#7e8998;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.panel{border:1px solid #252e3a;background:linear-gradient(180deg,#0e141c,#0a0f15);border-radius:16px;padding:21px;margin-top:16px}.panel-head{display:flex;align-items:center;justify-content:space-between;gap:20px}.panel h2{margin:0;font-size:20px}.pill{font-size:10px;text-transform:capitalize;border:1px solid #374151;border-radius:999px;padding:6px 9px;color:#a9b3bf}.flow{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:18px}.flow a{border:1px solid #222b36;background:#0a0f15;padding:12px;border-radius:11px;color:#d7dde6;text-decoration:none;display:grid;gap:9px}.flow a:hover{border-color:#55427f;background:#11101c}.flow a>b{width:27px;height:27px;border-radius:8px;display:grid;place-items:center;background:#161d27;color:#9a87d4;font-size:11px}.flow span{display:grid}.flow strong{font-size:11px}.flow small{font-size:9px;color:#75808f;margin-top:3px;line-height:1.45}.details{display:grid;grid-template-columns:120px 1fr;gap:9px 14px;margin-top:16px;align-items:center}.details span{font-size:10px;color:#6d7988}.details code{font-size:10px;color:#c7ced7;overflow:hidden;text-overflow:ellipsis}
	@media(max-width:1050px){.flow{grid-template-columns:repeat(2,1fr)}}@media(max-width:900px){.layout{grid-template-columns:1fr}aside{display:none}main{padding:28px 18px}.cards{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){header{padding:0 16px}.head-actions a:nth-child(2){display:none}.heading{align-items:stretch;flex-direction:column}.heading h1{font-size:30px}.cards,.flow{grid-template-columns:1fr}.details{grid-template-columns:1fr}.details span{margin-top:7px}}
</style>
