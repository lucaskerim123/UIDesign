<script lang="ts">
	let { data, form } = $props();
	const engine = data.engine;
</script>

<svelte:head><title>{engine.name} Runtime · OrbitFS Engine Host</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<div class="app">
	<header>
		<a class="brand" href="/engines"><span class="mark">O</span><span><b>OrbitFS</b><small>Engine Host</small></span></a>
		<div class="crumb"><a href="/engines">Engines</a><span>/</span><a href={`/engines/${engine.id}`}>{engine.name}</a><span>/</span><b>Runtime</b></div>
	</header>
	<main>
		<section class="heading"><div><p class="eyebrow">RUNTIME CONTROL</p><h1>{engine.fullName}</h1><p>Runtime state is separate from setup. Standby keeps the engine available without active work; permitted workspace users can wake Standby engines, while Stop/Restart and administrative state changes remain administrator-only.</p></div><div class:running={engine.engineState === 'running'} class:stopped={engine.engineState === 'stopped'} class="state"><span></span><strong>{engine.engineState}</strong></div></section>

		{#if form?.error}<div class="alert error">{form.error}</div>{/if}
		{#if form?.message}<div class="alert success">{form.message}</div>{/if}
		{#if !engine.linked}<div class="alert warn"><b>Panel link required.</b> Runtime control stays locked until this engine is attached and paired from OrbitFS Panel.</div>{/if}
		{#if !data.canManage && engine.engineState === 'stopped'}<div class="alert warn"><b>Stopped by administration.</b> Workspace users can wake Standby engines, but a fully Stopped engine must be started by an OrbitFS administrator.</div>{/if}

		<section class="stats">
			<div><small>GENERATION</small><b>{engine.state?.generation || 1}</b><span>Increments after restart.</span></div>
			<div><small>SETUP</small><b>{engine.setupState.replaceAll('_', ' ')}</b><span>Setup and runtime are independent.</span></div>
			<div><small>LAST REQUEST</small><b>{engine.state?.lastRequestAt || 'None yet'}</b><span>Latest recorded engine request.</span></div>
			<div><small>YOUR ACCESS</small><b>{data.canManage ? 'Administrator' : `${data.accessWorkspaceCount} workspace${data.accessWorkspaceCount === 1 ? '' : 's'}`}</b><span>{data.canManage ? 'Full runtime control' : 'May wake from Standby'}</span></div>
		</section>

		<section class="panel">
			<div class="panel-head"><div><p class="eyebrow">ENGINE STATE</p><h2>Runtime mode</h2></div><span class="pill">{engine.engineState}</span></div>
			<div class="modes">
				<div class:active={engine.engineState === 'running'}><strong>Running</strong><p>Engine accepts normal work and requests.</p></div>
				<div class:active={engine.engineState === 'standby'}><strong>Standby</strong><p>Engine stays available but idle. A permitted workspace user can wake it when needed.</p></div>
				<div class:active={engine.engineState === 'stopped'}><strong>Stopped</strong><p>Administrative hard stop. Workspace users cannot wake the engine until an administrator starts it again.</p></div>
			</div>
			{#if data.canManage}
				<div class="actions">
					<form method="POST" action="?/control"><input type="hidden" name="action" value="running" /><button class="primary">Run</button></form>
					<form method="POST" action="?/control"><input type="hidden" name="action" value="standby" /><button>Standby</button></form>
					<form method="POST" action="?/control"><input type="hidden" name="action" value="restart" /><button>Restart</button></form>
					<form method="POST" action="?/control"><input type="hidden" name="action" value="stopped" /><button class="danger">Stop</button></form>
				</div>
			{:else if data.canWake}
				<div class="wake-box"><div><b>Engine is in Standby</b><span>Your OrbitFS workspace permission allows you to wake this engine. This does not grant administrative Stop/Restart controls.</span></div><form method="POST" action="?/control"><input type="hidden" name="action" value="running" /><button class="primary">Wake {engine.name}</button></form></div>
			{/if}
		</section>

		<section class="panel details">
			<div class="panel-head"><div><p class="eyebrow">RUNTIME DETAILS</p><h2>Deployment</h2></div></div>
			<div class="rows"><span>Compute</span><code>{engine.state?.compute || 'vercel'}</code><span>Database</span><code>{engine.state?.database || 'supabase'}</code><span>Deployment</span><code>{engine.state?.deployment || 'ready'}</code><span>Workspace link</span><code>{engine.workspaceName || engine.workspaceId || 'Not linked'}</code>{#if engine.transportPath}<span>Transport</span><code>{engine.transportPath}</code>{/if}</div>
		</section>
	</main>
</div>

<style>
	:global(html){background:#070a0f;color:#f5f7fb;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}:global(body){margin:0}.app{min-height:100vh;background:radial-gradient(circle at 48% -18%,#151d31 0,#080c13 38%,#06080c 100%)}
	header{height:68px;padding:0 28px;border-bottom:1px solid #202733;display:flex;align-items:center;justify-content:space-between;background:rgba(8,11,17,.9)}.brand{display:flex;gap:10px;align-items:center;color:#fff;text-decoration:none}.brand>span:last-child{display:grid}.brand small{font-size:10px;color:#737e8c}.mark{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,#7c3aed,#d946ef);font-weight:900}.crumb{display:flex;gap:7px;align-items:center;font-size:11px;color:#647181}.crumb a{color:#95a0af;text-decoration:none}.crumb b{color:#d8dee7}
	main{max-width:1120px;margin:0 auto;padding:46px 24px 70px}.heading{display:flex;justify-content:space-between;align-items:end;gap:24px}.heading>div:first-child{max-width:760px}.eyebrow{font-size:10px;letter-spacing:.18em;color:#9878ff;font-weight:900;margin:0 0 7px}.heading h1{font-size:38px;letter-spacing:-.04em;margin:0}.heading p:not(.eyebrow){color:#8e99a8;line-height:1.6}.state{min-width:120px;border:1px solid #6b4b18;background:#211707;border-radius:14px;padding:13px 15px;display:flex;align-items:center;gap:9px;text-transform:capitalize}.state span{width:9px;height:9px;border-radius:50%;background:#f59e0b}.state.running{border-color:#205b3d;background:#092116}.state.running span{background:#22c55e}.state.stopped{border-color:#6d2028;background:#2a1014}.state.stopped span{background:#ef4444}
	.alert{margin:18px 0 0;padding:12px 14px;border-radius:10px;font-size:12px}.alert.error{border:1px solid #7f1d1d;background:#2a0d12;color:#fecaca}.alert.success{border:1px solid #1f6a45;background:#0c291b;color:#a7f3d0}.alert.warn{border:1px solid #6b4b18;background:#211707;color:#e7c783}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:24px 0}.stats>div{border:1px solid #252e3a;background:#0d1219;border-radius:14px;padding:14px;display:grid;gap:5px;min-width:0}.stats small{font-size:9px;color:#687484}.stats b{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-transform:capitalize}.stats span{font-size:10px;color:#758190;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
	.panel{border:1px solid #252e3a;background:linear-gradient(180deg,#0e141c,#0a0f15);border-radius:16px;padding:21px;margin-top:16px}.panel-head{display:flex;align-items:center;justify-content:space-between;gap:18px}.panel h2{margin:0;font-size:21px}.pill{font-size:10px;border:1px solid #374151;border-radius:999px;padding:6px 9px;color:#a9b3bf;text-transform:capitalize}.modes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px}.modes>div{border:1px solid #26303b;background:#090e14;border-radius:12px;padding:14px}.modes>div.active{border-color:#6546bd;background:#151126}.modes strong{font-size:13px}.modes p{font-size:10px;color:#778291;line-height:1.45;margin:6px 0 0}.actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:18px}.actions form{margin:0}button{border:1px solid #35404e;background:#111821;color:#d1d8e1;border-radius:9px;padding:9px 12px;font:inherit;font-size:11px;font-weight:800;cursor:pointer}button.primary{background:#6d28d9;border-color:#7c3aed;color:white}button.danger{background:#2a1014;border-color:#6e2029;color:#fecaca}.wake-box{display:flex;justify-content:space-between;align-items:center;gap:18px;margin-top:18px;border:1px solid #3f3564;background:#151126;border-radius:12px;padding:14px}.wake-box>div{display:grid;gap:4px}.wake-box b{font-size:11px}.wake-box span{font-size:9px;color:#8f88aa;line-height:1.5}.wake-box form{margin:0;flex:0 0 auto}.rows{display:grid;grid-template-columns:130px 1fr;gap:9px 14px;margin-top:16px}.rows span{font-size:10px;color:#6d7988}.rows code{font-size:10px;color:#c7ced7;overflow:hidden;text-overflow:ellipsis}
	@media(max-width:850px){.stats{grid-template-columns:repeat(2,1fr)}.modes{grid-template-columns:1fr}.heading{align-items:stretch;flex-direction:column}.state{width:max-content}}@media(max-width:560px){header{padding:0 16px}.crumb{display:none}main{padding:34px 16px 55px}.heading h1{font-size:31px}.stats{grid-template-columns:1fr}.rows{grid-template-columns:1fr}.rows span{margin-top:6px}.wake-box{align-items:stretch;flex-direction:column}.wake-box button{width:100%}}
</style>
