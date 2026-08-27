/**
 * Generates companion photographs.
 *
 *   KIE_API_KEY=... node scripts/generate.mjs                 # everyone, every shot
 *   KIE_API_KEY=... node scripts/generate.mjs mia yuki         # only these two
 *   KIE_API_KEY=... node scripts/generate.mjs --shots 01,03    # only these shots
 *   KIE_API_KEY=... node scripts/generate.mjs mia --force      # redo hers
 *
 * Resumable by design: a file that already exists is skipped, so an
 * interrupted run costs nothing to restart, and a single bad portrait is
 * redone by deleting that one file rather than by regenerating a set.
 *
 * The anchor is generated first and every other shot is an edit against its
 * public URL. That URL is temporary — hours, not days — but it only has to
 * outlive the run that produced it. If an anchor exists on disk but its URL
 * has expired, `--force` on that companion regenerates the anchor too.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { credits, download, generate, Rejected } from './kie.mjs';
import { COMPANIONS } from './companions.mjs';
import { SHOTS } from './shots.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'companions');

const args = process.argv.slice(2);
const force = args.includes('--force');
const shotFilter = (() => {
  const i = args.indexOf('--shots');
  if (i === -1) return null;
  return args[i + 1].split(',').map(s => s.trim());
})();
const names = args.filter(a => !a.startsWith('--') && a !== shotFilter?.join(','));

const wanted = names.length
  ? COMPANIONS.filter(c => names.includes(c.id))
  : COMPANIONS;
const shots = shotFilter
  ? SHOTS.filter(s => shotFilter.some(f => s.name.startsWith(f)))
  : SHOTS;

if (!wanted.length) {
  console.error(`no companion matched ${names.join(', ')}`);
  process.exit(1);
}

/**
 * Anchor URLs from previous runs, so a second invocation can generate shot 04
 * without regenerating the face it has to match.
 */
const CACHE = join(ROOT, '.anchors.json');
const readCache = async () => {
  try {
    return JSON.parse(await readFile(CACHE, 'utf8'));
  } catch {
    return {};
  }
};

const log = (id, shot, msg) =>
  console.log(`${id.padEnd(7)} ${shot.padEnd(10)} ${msg}`);

const run = async () => {
  console.log(`credits: ${await credits()}`);
  const anchors = await readCache();
  const failed = [];

  for (const c of wanted) {
    const dir = join(OUT, c.id);
    await mkdir(dir, { recursive: true });

    for (const shot of shots) {
      const path = join(dir, `${shot.name}.png`);
      if (existsSync(path) && !force) {
        log(c.id, shot.name, 'exists, skipped');
        continue;
      }

      // Every non-anchor shot is an edit of the anchor, so it has to exist.
      let refs;
      if (!shot.anchor) {
        const ref = anchors[c.id];
        if (!ref) {
          log(c.id, shot.name, 'no anchor URL yet — run 01-anchor first');
          failed.push(`${c.id}/${shot.name}: missing anchor`);
          continue;
        }
        refs = [ref];
      }

      const started = Date.now();
      try {
        const url = await generate(shot.prompt(c), shot.ratio, refs, s =>
          log(c.id, shot.name, `still queued after ${s}s`),
        );
        await download(url, path);
        if (shot.anchor) {
          anchors[c.id] = url;
          await writeFile(CACHE, JSON.stringify(anchors, null, 2));
        }
        log(c.id, shot.name, `ok in ${Math.round((Date.now() - started) / 1000)}s`);
      } catch (err) {
        const why = err instanceof Rejected ? 'REFUSED' : 'failed';
        log(c.id, shot.name, `${why}: ${err.message}`);
        failed.push(`${c.id}/${shot.name}: ${err.message}`);
      }
    }
  }

  console.log(`\ncredits left: ${await credits()}`);
  if (failed.length) {
    console.log(`\n${failed.length} did not land:`);
    failed.forEach(f => console.log(`  ${f}`));
    process.exitCode = 1;
  }
};

run();
