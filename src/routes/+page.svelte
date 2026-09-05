<script lang="ts">
	let { data, form } = $props();
</script>

<svelte:head><title>OrbitFS MCP Engine</title><meta name="viewport" content="width=device-width,initial-scale=1" /></svelte:head>

<div class="shell">
	<header><div><div class="eyebrow">OrbitFS MCP</div><h1>Engine Control</h1><p>Standalone Vercel MCP runtime connected to OrbitFS.</p></div><a href="https://orbitconvert.vercel.app/admin/mcp/settings">Open main OrbitFS</a></header>

	<section class="status">
		<div class="state {data.engine.mode}"><span></span>{data.engine.mode}</div>
		<div class="grid">
			<div><small>Transport</small><strong>/mcp</strong></div>
			<div><small>Compute</small><strong>Vercel</strong></div>
			<div><small>Storage</small><strong>Supabase</strong></div>
			<div><small>Generation</small><strong>{data.engine.generation}</strong></div>
		</div>
		<p class="hint">{data.engine.mode === 'stopped' ? 'MCP requests are blocked.' : data.engine.mode === 'standby' ? 'Ready for on-demand MCP requests.' : 'MCP engine is enabled for runtime work.'}</p>
		{#if data.engine.lastRequestAt}<p class="meta">Last request: {new Date(data.engine.lastRequestAt).toLocaleString()}</p>{/if}
	</section>

	{#if data.user && ['owner','admin'].includes(data.user.role)}
		<section>
			<div class="section-title"><div><h2>Engine controls</h2><p>These controls change the real MCP request gate stored in Supabase.</p></div><div class="user">{data.user.username} · {data.user.role}</div></div>
			<div class="controls">
				<form method="POST" action="?/control"><input type="hidden" name="mode" value="running"><button class:active={data.engine.mode==='running'}>Run</button></form>
				<form method="POST" action="?/control"><input type="hidden" name="mode" value="standby"><button class:active={data.engine.mode==='standby'}>Standby</button></form>
				<form method="POST" action="?/control"><input type="hidden" name="mode" value="stopped"><button class="danger" class:active={data.engine.mode==='stopped'}>Stop</button></form>
				<form method="POST" action="?/control"><input type="hidden" name="mode" value="restart"><button>Restart</button></form>
			</div>
			{#if form?.controlError}<div class="error">{form.controlError}</div>{/if}
			<form class="logout" method="POST" action="?/logout"><button>Sign out</button></form>
		</section>
	{:else}
		<section>
			<h2>Admin access</h2><p>Sign in with an OrbitFS owner/admin account to control the MCP engine.</p>
			<form class="login" method="POST" action="?/login">
				<input name="identity" placeholder="Username or email" autocomplete="username" required>
				<input name="credential" type="password" placeholder="Password / PIN" autocomplete="current-password" required>
				<button>Sign in</button>
			</form>
			{#if form?.loginError}<div class="error">{form.loginError}</div>{/if}
		</section>
	{/if}

	<section class="links"><a href="/health">Health</a><a href="/mcp">MCP transport</a><a href="/.well-known/oauth-protected-resource">OAuth metadata</a></section>
</div>

<style>
	:global(html){background:#090a0c;color:#f5f7fa;font-family:Inter,ui-sans-serif,system-ui,sans-serif} :global(body){margin:0}
	.shell{max-width:920px;margin:0 auto;padding:32px 18px 70px} header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:24px} header a,.links a{color:#a7b5ff;text-decoration:none} .eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.16em;color:#8992a3} h1{font-size:34px;margin:6px 0} h2{margin:0 0 6px} p{color:#9da6b5;margin:4px 0}
	section{border:1px solid #242831;background:#101216;border-radius:16px;padding:20px;margin-top:16px}.status{background:#0d0f12}.state{display:inline-flex;align-items:center;gap:9px;text-transform:capitalize;font-weight:700;border:1px solid #30343e;border-radius:999px;padding:8px 12px}.state span{width:9px;height:9px;border-radius:50%;background:#888}.state.running span{background:#34d399}.state.standby span{background:#fbbf24}.state.stopped span{background:#f87171}
	.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px}.grid div{border:1px solid #242831;border-radius:12px;padding:14px}.grid small{display:block;color:#7f899a;text-transform:uppercase;font-size:10px;letter-spacing:.1em}.grid strong{display:block;margin-top:6px}.hint{margin-top:16px}.meta{font-size:12px}.section-title{display:flex;justify-content:space-between;gap:16px;align-items:start}.user{font-size:12px;color:#8e97a6}
	.controls{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px}.controls form,.logout{margin:0}button{width:100%;border:1px solid #303641;background:#171a20;color:#f4f6fa;border-radius:10px;padding:12px 14px;font-weight:650;cursor:pointer}button:hover,button.active{background:#252b36;border-color:#576078}.danger{border-color:#5a2d32;color:#ffb0b6}.danger.active{background:#3a171b}.logout{margin-top:14px;max-width:130px}.login{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;margin-top:16px}.login input{min-width:0;background:#0c0e11;color:#fff;border:1px solid #2d323c;border-radius:10px;padding:12px}.login button{width:auto}.error{margin-top:12px;color:#ff9ca4}.links{display:flex;gap:18px;flex-wrap:wrap;font-size:14px}
	@media(max-width:700px){header{flex-direction:column}.grid{grid-template-columns:1fr 1fr}.controls{grid-template-columns:1fr 1fr}.login{grid-template-columns:1fr}.login button{width:100%}h1{font-size:28px}}
</style>
