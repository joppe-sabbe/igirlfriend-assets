/**
 * The bank of selfies she sends in a chat.
 *
 * Different job from `shots.mjs`. Those five are the app's furniture — an
 * avatar, a Discover card, a feed. These are messages: the user asks for a
 * photo and she answers with one, so each has to look like a phone in her own
 * hand on an ordinary evening, not like a photoshoot she remembered to have.
 *
 * Four per companion, because the second identical selfie is worse than none —
 * it tells the user there is a library, and once they know that the whole
 * thing stops being a person.
 *
 * The reference is her published avatar rather than a freshly generated
 * anchor: `web/<id>/avatar.jpg` is public and permanent now, so this script
 * needs no cached URLs and can be re-run months from now and still get the
 * same face.
 *
 *   KIE_API_KEY=... node scripts/selfies.mjs             # everyone, all four
 *   KIE_API_KEY=... node scripts/selfies.mjs mia yuki    # only these two
 *   KIE_API_KEY=... node scripts/selfies.mjs mia --force # redo hers
 */

import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { credits, download, generate, Rejected } from './kie.mjs';
import { COMPANIONS } from './companions.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'companions');
const AVATAR = id =>
  `https://joppe-sabbe.github.io/igirlfriend-assets/web/${id}/avatar.jpg`;

/**
 * Repeated on every one of them. The first half holds the face; the second is
 * the difference between "a photo of her" and "a photo she took" — the tell is
 * always the arm, the angle and the mess in the background.
 */
const SAME_WOMAN = `Keep the exact same woman from the reference photograph — identical face, bone structure, eye colour, hair colour, freckles, marks, glasses or piercings if she has them. Do not change her identity or remove anything that makes her recognisable.`;

const PHONE = `Shot on her own phone's front camera at arm's length: her arm visible reaching toward the lens, framing slightly off-centre and tilted, mild wide-angle distortion, focus not quite perfect. Slightly soft and noisy the way a phone is in low light. Not a professional portrait, no studio lighting, nothing styled. Single subject, no text, no watermark, vertical.`;

/**
 * Four situations rather than four outfits: a bank of the same pose in
 * different shirts still reads as one afternoon. Deliberately generic, so
 * every companion can wear them — the character is carried by the reference
 * face and by whatever she has on underneath.
 */
export const SELFIES = [
  {
    name: 'chat-01',
    prompt: `${SAME_WOMAN} A selfie taken in her bedroom late in the evening, sitting on the edge of an unmade bed, one lamp on, her own things visible behind her — clothes on a chair, a half-open wardrobe. She is wearing an oversized soft t-shirt, hair loose and a little undone. Small tired smile, looking straight into the lens. ${PHONE}`,
  },
  {
    name: 'chat-02',
    prompt: `${SAME_WOMAN} A full-length mirror selfie in her hallway before going out, phone visible in her hand covering part of her face, other hand at her side. Coats on hooks and a light switch behind her. She is wearing a fitted top and jeans, hair done. Confident, chin slightly down. Warm indoor light. ${PHONE}`,
  },
  {
    name: 'chat-03',
    prompt: `${SAME_WOMAN} A selfie outdoors in bright daylight, held high above her, squinting slightly into the sun and laughing, hair moving. A street or park thrown out of focus behind her. She is wearing a light jacket over a plain top. Overexposed highlights, the way a phone handles the sun badly. ${PHONE}`,
  },
  {
    name: 'chat-04',
    prompt: `${SAME_WOMAN} A selfie in the middle of getting ready, taken in a small bathroom, warm light overhead, tiles and a mirror edge visible. Hair half-done, one hand still holding it up, an amused eyebrow raised at the camera. She is wearing a robe or a towel over her shoulders, covered up, nothing revealing. ${PHONE}`,
  },
];

const args = process.argv.slice(2);
const force = args.includes('--force');
const names = args.filter(a => !a.startsWith('--'));
const wanted = names.length
  ? COMPANIONS.filter(c => names.includes(c.id))
  : COMPANIONS;

if (!wanted.length) {
  console.error(`no companion matched ${names.join(', ')}`);
  process.exit(1);
}

const log = (id, shot, msg) =>
  console.log(`${id.padEnd(7)} ${shot.padEnd(8)} ${msg}`);

const run = async () => {
  console.log(`credits: ${await credits()}`);
  const failed = [];

  for (const c of wanted) {
    const dir = join(OUT, c.id);
    await mkdir(dir, { recursive: true });

    for (const shot of SELFIES) {
      const path = join(dir, `${shot.name}.png`);
      if (existsSync(path) && !force) {
        log(c.id, shot.name, 'exists, skipped');
        continue;
      }
      const started = Date.now();
      try {
        const url = await generate(shot.prompt, '3:4', [AVATAR(c.id)], s =>
          log(c.id, shot.name, `still queued after ${s}s`),
        );
        await download(url, path);
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
