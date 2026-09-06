<script lang="ts">
	let { data } = $props();
	const engine = data.engine;
</script>

<svelte:head><title>{engine.name} Connections · OrbitFS Engine Host</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<div class="app">
	<header>
		<a class="brand" href="/engines"><span class="mark">O</span><span><b>OrbitFS</b><small>Engine Host</small></span></a>
		<div class="crumb"><a href="/engines">Engines</a><span>/</span><a href={`/engines/${engine.id}`}>{engine.name}</a><span>/</span><b>Connections</b></div>
	</header>
	<main>
		<section class="heading"><div><p class="eyebrow">CONNECTIONS</p><h1>{engine.fullName}</h1><p>Connection state is scoped to the Engine Host. Panel remains the authority for the OrbitFS user, workspace and licence that this engine belongs to.</p></div></section>

		<section class="cards">
			<div><small>PANEL</small><b>{engine.linked ? 'Connected' : 'Not linked'}</b><span>{engine.panelUrl || 'Attach from Panel first'}</span></div>
			<div><small>WORKSPACE</small><b>{engine.workspaceName || 'Unassigned'}</b><span>{engine.workspaceId || 'No workspace link'}</span></div>
			<div><small>LICENCE</small><b>{engine.licensed ? 'Allowed' : 'Required'}</b><span>{engine.component || engine.id}</span></div>
			<div><small>LAST SYNC</small><b>{engine.lastSyncAt || 'Never'}</b><span>Panel ↔ Engine Host pairing</span></div>
		</section>

		{#if engine.id === 'mcp'}
			<section class="panel">
				<div class="panel-head"><div><p class="eyebrow">MCP CLIENTS</p><h2>Registered clients</h2></div><span class="pill">{data.clients.length}</span></div>
				{#if data.clients.length}
					<div class="table"><div class="row head"><span>Name</span><span>Status</span><span>Read</span><span>Write</span><span>Workspaces</span></div>{#each data.clients as client}<div class="row"><span><b>{client.client_name || client.id}</b><small>{client.id}</small></span><span>{client.status || 'active'}</span><span>{client.permissions?.read === false ? 'No' : 'Yes'}</span><span>{client.permissions?.write === false ? 'No' : 'Yes'}</span><span>{Array.isArray(client.workspace_ids) && client.workspace_ids.length ? client.workspace_ids.length : 'All allowed'}</span></div>{/each}</div>
				{:else}<div class="empty">No MCP clients are registered yet.</div>{/if}
			</section>

			<section class="panel">
				<div class="panel-head"><div><p class="eyebrow">SESSIONS</p><h2>Recent MCP sessions</h2></div><span class="pill">{data.sessions.length}</span></div>
				{#if data.sessions.length}
					<div class="table sessions"><div class="row head"><span>User</span><span>Client</span><span>Workspace</span><span>Status</span><span>Requests</span><span>Last seen</span></div>{#each data.sessions as session}<div class="row"><span>{session.username || session.user_id}</span><span>{session.client_id || session.provider || 'chatgpt'}</span><span>{session.workspace_id || '—'}</span><span>{session.status || 'active'}</span><span>{session.request_count || 0}</span><span>{session.last_seen_at || '—'}</span></div>{/each}</div>
				{:else}<div class="empty">No MCP sessions have been recorded yet.</div>{/if}
			</section>
		{:else}
			<section class="panel"><div class="panel-head"><div><p class="eyebrow">ENGINE CONNECTION MODEL</p><h2>Shared OrbitFS backend</h2></div></div><p class="muted">{engine.name} does not use the MCP client/session model. Its Engine Host connection is the secure Panel pairing plus the shared Supabase workspace data. Engine-specific providers and deeper connections will live here as their runtime modules are wired in.</p></section>
		{/if}
	</main>
</div>

<style>
	:global(html){background:#070a0f;color:#f5f7fb;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}:global(body){margin:0}.app{min-height:100vh;background:radial-gradient(circle at 48% -18%,#151d31 0,#080c13 38%,#06080c 100%)}
	header{height:68px;padding:0 28px;border-bottom:1px solid #202733;display:flex;align-items:center;justify-content:space-between;background:rgba(8,11,17,.9)}.brand{display:flex;gap:10px;align-items:center;color:#fff;text-decoration:none}.brand>span:last-child{display:grid}.brand small{font-size:10px;color:#737e8c}.mark{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,#7c3aed,#d946ef);font-weight:900}.crumb{display:flex;gap:7px;align-items:center;font-size:11px;color:#647181}.crumb a{color:#95a0af;text-decoration:none}.crumb b{color:#d8dee7}
	main{max-width:1120px;margin:0 auto;padding:46px 24px 70px}.heading{max-width:760px}.eyebrow{font-size:10px;letter-spacing:.18em;color:#9878ff;font-weight:900;margin:0 0 7px}.heading h1{font-size:38px;letter-spacing:-.04em;margin:0}.heading p:not(.eyebrow){color:#8e99a8;line-height:1.6}.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:24px 0}.cards>div{border:1px solid #252e3a;background:#0d1219;border-radius:14px;padding:14px;display:grid;gap:5px;min-width:0}.cards small{font-size:9px;color:#687484}.cards b{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cards span{font-size:10px;color:#758190;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.panel{border:1px solid #252e3a;background:linear-gradient(180deg,#0e141c,#0a0f15);border-radius:16px;padding:21px;margin-top:16px;overflow:hidden}.panel-head{display:flex;align-items:center;justify-content:space-between;gap:18px}.panel h2{margin:0;font-size:21px}.pill{font-size:10px;border:1px solid #374151;border-radius:999px;padding:6px 9px;color:#a9b3bf}.muted{color:#7f8a99;font-size:12px;line-height:1.6}.table{display:grid;margin-top:16px;overflow:auto}.row{min-width:720px;display:grid;grid-template-columns:1.7fr .8fr .6fr .6fr .9fr;border-top:1px solid #222b36;padding:10px 8px;gap:10px;align-items:center;font-size:10px;color:#aab3bf}.sessions .row{grid-template-columns:1.1fr 1fr 1.1fr .7fr .6fr 1.5fr}.row.head{border-top:0;color:#667383;text-transform:uppercase;font-size:9px}.row span:first-child{display:grid}.row small{color:#667383;font-size:9px;margin-top:2px}.empty{margin-top:16px;border:1px dashed #2a3441;border-radius:11px;padding:18px;color:#778292;font-size:11px;text-align:center}
	@media(max-width:850px){.cards{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){header{padding:0 16px}.crumb{display:none}main{padding:34px 16px 55px}.heading h1{font-size:31px}.cards{grid-template-columns:1fr}}
</style>
