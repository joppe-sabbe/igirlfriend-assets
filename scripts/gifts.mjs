/**
 * Generates the gift catalogue artwork.
 *
 *   KIE_API_KEY=... node scripts/gifts.mjs             # everything missing
 *   KIE_API_KEY=... node scripts/gifts.mjs rose ring    # only these
 *   KIE_API_KEY=... node scripts/gifts.mjs rose --force # redo it
 *
 * Writes `gifts/<id>-raw.png` — the object on a green screen. The alpha is cut
 * afterwards by `scripts/cutout.py`, because nano-banana cannot output an
 * alpha channel: ask it for "a transparent background" and it paints a
 * checkerboard, which is a picture of transparency rather than the thing.
 *
 * Resumable in the same way as generate.mjs: a file on disk is skipped.
 */

import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { credits, download, generate, Rejected } from './kie.mjs';
import { GIFTS, promptFor } from './giftlist.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'gifts');

const args = process.argv.slice(2);
const force = args.includes('--force');
const names = args.filter(a => !a.startsWith('--'));
const wanted = names.length ? GIFTS.filter(g => names.includes(g.id)) : GIFTS;

if (!wanted.length) {
  console.error(`no gift matched ${names.join(', ')}`);
  process.exit(1);
}

const run = async () => {
  console.log(`credits: ${await credits()}`);
  await mkdir(OUT, { recursive: true });
  const failed = [];

  for (const g of wanted) {
    const path = join(OUT, `${g.id}-raw.png`);
    if (existsSync(path) && !force) {
      console.log(`${g.id.padEnd(10)} exists, skipped`);
      continue;
    }
    const started = Date.now();
    try {
      const url = await generate(promptFor(g), '1:1', undefined, secs =>
        console.log(`${g.id.padEnd(10)} still queued after ${secs}s`),
      );
      await download(url, path);
      console.log(
        `${g.id.padEnd(10)} done in ${Math.round((Date.now() - started) / 1000)}s`,
      );
    } catch (err) {
      failed.push(g.id);
      console.log(
        `${g.id.padEnd(10)} ${err instanceof Rejected ? 'REFUSED' : 'FAILED'}: ${err.message}`,
      );
    }
  }

  if (failed.length) {
    console.log(`\nfailed: ${failed.join(', ')}`);
    process.exit(1);
  }
};

run();
