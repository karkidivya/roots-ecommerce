import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
  // Defaults to in-memory cache. Switch to R2 once you create a bucket:
  //   import r2 from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
  //   incrementalCache: r2,
});
