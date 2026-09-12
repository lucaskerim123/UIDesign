-- OrbitFS release channel hardening.
-- latest = public/stable releases, beta = public + beta releases, internal = all published releases.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.orbitfs_release_system_settings'::regclass
      AND conname='orbitfs_release_channel_check'
  ) THEN
    ALTER TABLE public.orbitfs_release_system_settings DROP CONSTRAINT orbitfs_release_channel_check;
  END IF;

  ALTER TABLE public.orbitfs_release_system_settings
    ADD CONSTRAINT orbitfs_release_channel_check
    CHECK (release_channel IN ('latest','beta','internal'));
END $$;

-- Keep existing/legacy aliases out of persisted settings while allowing the
-- application layer to normalize them when encountered during migration.
UPDATE public.orbitfs_release_system_settings
SET release_channel='latest'
WHERE release_channel IS NULL
   OR lower(trim(release_channel)) IN ('stable','public');

-- Deployment mutations must be performed by staff with management authority;
-- read-only licensing staff may still view the deployment control plane.
-- The API enforces this distinction; this migration documents the intended
-- permission boundary without changing existing permission definitions.
