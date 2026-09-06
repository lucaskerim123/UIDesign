<script lang="ts">
	let { data } = $props();
	const statusLabel = (engine: any) => {
		if (!engine.registered) return 'Not installed';
		if (!engine.licensed) return 'Licence required';
		if (!engine.attached) return 'Detached';
		if (engine.setupState !== 'complete') return 'Setup required';
		return engine.engineState === 'running' ? 'Running' : engine.engineState === 'stopped' ? 'Stopped' : 'Standby';
	};
</script>

<svelte:head><title>Engines · OrbitFS Engine Host</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<div class="app">
	<header>
		<a class="brand" href="/engines"><span class="mark">O</span><span><b>OrbitFS</b><small>Engine Host</small></span></a>
		<div class="account"><a class="config-link" href="/configuration">Configuration</a><div><b>{data.user.display_name || data.user.username}</b><small>{data.mainWorkspace?.name || 'No workspace'}</small></div><form method="POST" action="?/logout"><button>Sign out</button></form></div>
	</header>
	<main>
		<section class="hero">
			<div><p class="eyebrow">ENGINE SELECTOR</p><h1>Which engine would you like to manage?</h1><p>Engine Host is linked to your existing OrbitFS installation. Panel data stays in Panel; this site manages engine-specific setup, configuration, runtime, connections, monitoring and diagnostics.</p></div>
			<div class="installation"><span>Installation</span><code>{data.installationId}</code><small>{data.workspaceCount} accessible workspace{data.workspaceCount === 1 ? '' : 's'}</small><a href="/configuration">View host configuration →</a></div>
		</section>
		<section class="grid">
			{#each data.engines as engine}
				<a class:disabled={!engine.registered || !engine.licensed || !engine.attached} class="engine" href={engine.registered ? `/engines/${engine.id}` : '/engines'}>
					<div class="top"><div class="icon">{engine.name.slice(0,1)}</div><span class:ok={engine.attached && engine.licensed} class:warn={engine.registered && (!engine.attached || !engine.licensed)} class="badge">{statusLabel(engine)}</span></div>
					<h2>{engine.name}</h2><p>{engine.description}</p>
					<div class="facts"><span><small>Attached</small><b>{engine.attached ? 'Yes' : 'No'}</b></span><span><small>Setup</small><b>{engine.setupState.replaceAll('_',' ')}</b></span><span><small>Runtime</small><b>{engine.engineState}</b></span></div>
					<div class="foot"><span>{engine.workspaceName || data.mainWorkspace?.name || 'Workspace not linked'}</span><b>Manage →</b></div>
				</a>
			{/each}
		</section>
	</main>
</div>

<style>
	:global(html){background:#070a0f;color:#f6f7fb;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}:global(body){margin:0}.app{min-height:100vh;background:radial-gradient(circle at 50% -15%,#151d31 0,#090d14 40%,#06080c 100%)}
	header{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 36px;border-bottom:1px solid #202733;background:rgba(8,11,17,.82);backdrop-filter:blur(18px);position:sticky;top:0;z-index:5}.brand{display:flex;align-items:center;gap:11px;color:#fff;text-decoration:none}.brand span:last-child{display:grid}.brand small{color:#7e8999;font-size:11px}.mark{width:36px;height:36px;display:grid;place-items:center;border-radius:10px;font-weight:900;background:linear-gradient(135deg,#7c3aed,#d946ef)}.account{display:flex;align-items:center;gap:16px;text-align:right}.account div{display:grid}.account small{font-size:11px;color:#7e8999}.account button,.config-link{border:1px solid #303846;background:#0c1119;color:#c8d0dc;border-radius:9px;padding:8px 11px;cursor:pointer;text-decoration:none;font-size:12px}.config-link:hover{border-color:#55427f;color:#fff}
	main{max-width:1180px;margin:0 auto;padding:54px 28px 70px}.hero{display:flex;justify-content:space-between;gap:30px;align-items:end;margin-bottom:30px}.hero>div:first-child{max-width:760px}.eyebrow{margin:0 0 9px;color:#9c7cff;font-size:11px;font-weight:900;letter-spacing:.18em}.hero h1{margin:0;font-size:42px;letter-spacing:-.045em}.hero p:not(.eyebrow){margin:14px 0 0;color:#9ba6b5;line-height:1.6}.installation{min-width:250px;padding:15px 16px;border:1px solid #27303d;background:#0c1118;border-radius:14px;display:grid;gap:5px}.installation span,.installation small{font-size:11px;color:#7c8795}.installation code{font-size:12px;color:#d5dbe4;overflow:hidden;text-overflow:ellipsis}.installation a{margin-top:5px;color:#bca9ff;text-decoration:none;font-size:10px}
	.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.engine{min-height:300px;display:flex;flex-direction:column;box-sizing:border-box;padding:22px;border:1px solid #293241;border-radius:18px;background:linear-gradient(180deg,#111721,#0b1017);text-decoration:none;color:inherit;transition:.18s ease}.engine:hover{transform:translateY(-2px);border-color:#4a5363;box-shadow:0 18px 45px rgba(0,0,0,.28)}.engine.disabled{opacity:.62}.top{display:flex;align-items:center;justify-content:space-between}.icon{width:42px;height:42px;display:grid;place-items:center;border-radius:11px;background:#1d1834;color:#bfa8ff;font-weight:900}.badge{border:1px solid #354050;border-radius:999px;padding:6px 9px;font-size:10px;color:#9ea8b5}.badge.ok{border-color:#215a40;color:#6ee7a6;background:#0b2118}.badge.warn{border-color:#6b4b18;color:#f0c36b;background:#241a09}.engine h2{font-size:24px;margin:22px 0 7px}.engine>p{color:#8e99a8;line-height:1.55;margin:0 0 20px;min-height:48px}.facts{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #222b37;border-radius:12px;overflow:hidden}.facts span{padding:10px;border-right:1px solid #222b37;display:grid;gap:3px}.facts span:last-child{border-right:0}.facts small{color:#677383;font-size:9px;text-transform:uppercase}.facts b{font-size:11px;text-transform:capitalize}.foot{margin-top:auto;padding-top:17px;display:flex;justify-content:space-between;gap:12px;font-size:12px;color:#737f8e}.foot b{color:#bca9ff}
	@media(max-width:900px){.grid{grid-template-columns:1fr}.hero{align-items:stretch;flex-direction:column}.installation{min-width:0}.hero h1{font-size:34px}}@media(max-width:560px){header{padding:0 16px}.account div,.config-link{display:none}main{padding:36px 16px 55px}.hero h1{font-size:30px}.engine{padding:18px}.facts{grid-template-columns:1fr}.facts span{border-right:0;border-bottom:1px solid #222b37}.facts span:last-child{border-bottom:0}}
</style>
