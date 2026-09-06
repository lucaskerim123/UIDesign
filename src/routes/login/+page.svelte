<script lang="ts">
	let { form } = $props();
</script>

<svelte:head>
	<title>OrbitFS Engine Host</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="shell">
	<div class="glow glow-a"></div>
	<div class="glow glow-b"></div>
	<main class="card">
		<div class="brand">
			<div class="mark">O</div>
			<div>
				<div class="eyebrow">ORBITFS</div>
				<h1>Engine Host</h1>
			</div>
		</div>
		<p class="lead">Manage your OrbitFS engine setup, runtime and connections.</p>
		<div class="notice"><span>✓</span> Uses your existing OrbitFS Panel account</div>
		<form method="POST">
			<label>
				<span>Username or email</span>
				<input name="identity" autocomplete="username" value={form?.identity || ''} placeholder="OrbitFS account" required />
			</label>
			<label>
				<span>Password</span>
				<input name="credential" type="password" autocomplete="current-password" placeholder="Password" required />
			</label>
			{#if form?.error}<div class="error">{form.error}</div>{/if}
			<button type="submit">Continue to Engine Host <span>→</span></button>
		</form>
		<p class="fine">No separate MCP, APEX or Studio account is created.</p>
	</main>
</div>

<style>
	:global(html){background:#06090f;color:#f7f8fb;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
	:global(body){margin:0;min-width:320px}
	.shell{min-height:100vh;display:grid;place-items:center;padding:32px 18px;position:relative;overflow:hidden;background:radial-gradient(circle at 50% -10%,#11182a 0,#080c14 38%,#05070b 100%)}
	.glow{position:absolute;border-radius:999px;filter:blur(70px);opacity:.2;pointer-events:none}.glow-a{width:360px;height:360px;background:#8b5cf6;top:-170px;left:12%}.glow-b{width:300px;height:300px;background:#38bdf8;right:8%;bottom:-160px}
	.card{width:min(100%,470px);box-sizing:border-box;padding:34px;border:1px solid #283140;border-radius:24px;background:linear-gradient(180deg,rgba(18,23,32,.96),rgba(10,14,21,.96));box-shadow:0 28px 90px rgba(0,0,0,.45);position:relative}
	.brand{display:flex;align-items:center;gap:15px}.mark{width:46px;height:46px;border-radius:13px;display:grid;place-items:center;font-weight:900;font-size:20px;background:linear-gradient(135deg,#8b5cf6,#d946ef);box-shadow:0 0 28px rgba(168,85,247,.35)}
	.eyebrow{font-size:11px;letter-spacing:.22em;color:#9ca3af;font-weight:800}h1{margin:2px 0 0;font-size:28px;letter-spacing:-.03em}.lead{color:#aeb7c5;line-height:1.55;margin:22px 0 18px}.notice{display:flex;align-items:center;gap:9px;border:1px solid #273244;background:#0d131d;border-radius:12px;padding:11px 13px;color:#c7d0dc;font-size:13px;margin-bottom:22px}.notice span{color:#4ade80}
	form{display:grid;gap:15px}label{display:grid;gap:7px}label span{font-size:12px;color:#aeb7c5;font-weight:700}input{box-sizing:border-box;width:100%;border:1px solid #313b4a;background:#080c12;color:#fff;border-radius:12px;padding:13px 14px;font:inherit;outline:none}input:focus{border-color:#8b5cf6;box-shadow:0 0 0 3px rgba(139,92,246,.14)}
	button{margin-top:4px;border:0;border-radius:12px;padding:13px 16px;font:inherit;font-weight:800;color:white;background:linear-gradient(135deg,#7c3aed,#9333ea);cursor:pointer;display:flex;justify-content:center;gap:8px;box-shadow:0 10px 28px rgba(124,58,237,.28)}button:hover{filter:brightness(1.08)}.error{border:1px solid #7f1d1d;background:#2b0e13;color:#fecaca;padding:10px 12px;border-radius:10px;font-size:13px}.fine{text-align:center;color:#6f7b8b;font-size:12px;margin:18px 0 0}
	@media(max-width:520px){.card{padding:26px 20px;border-radius:20px}.shell{padding:18px}h1{font-size:25px}}
</style>
