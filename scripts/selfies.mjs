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
 * The two universal shots still need twelve different outfits. The first pass
 * hard-coded "an oversized t-shirt" and "a fitted top and jeans" and produced
 * nine women in the same black top — and these are slots 1 and 2, the ones
 * every user is served first, so they are the worst place in the bank to
 * repeat yourself. Rotated by roster position rather than at random, so a
 * re-run reproduces the same set.
 */
const INDOORS = [
  'an oversized faded band t-shirt',
  'a worn grey hoodie with the sleeves pushed up',
  'a soft cropped sweatshirt and pyjama shorts',
  'an old linen shirt, half the buttons undone over a vest',
  'a striped long-sleeved top that is too big for her',
  'a plain white tank top and flannel pyjama bottoms',
];

const GOING_OUT = [
  'a fitted black top and straight blue jeans',
  'a cream knit jumper tucked into wide trousers',
  'a leather jacket over a plain tee and black jeans',
  'a short floral dress and boots',
  'an oversized blazer over a vest and jeans',
  'a ribbed polo neck and a long skirt',
];

/** Deterministic per companion: her position in the roster picks the outfit. */
const pick = (list, c) => list[COMPANIONS.indexOf(c) % list.length];

/**
 * The location clause of a casting-sheet line — everything before the first
 * comma. `activity` and `evening` are written for a photographer ("painting at
 * an easel by a tall window, brush in hand, half turned toward the camera"),
 * and the tail contradicts a selfie, where she is holding the phone and
 * looking into it. The head of the line is the part worth keeping.
 */
const where = (line) => line.split(',')[0].trim();

/**
 * Four situations rather than four outfits: a bank of the same pose in
 * different shirts still reads as one afternoon.
 *
 * The first two are deliberately universal — everyone's camera roll has a tired
 * one on the bed and a mirror one before going out. The last two are hers: the
 * first pass made all twelve generic, and twelve women in the same denim jacket
 * in the same park is the same "one photoshoot" failure one level up, visible
 * the moment you put the sets side by side.
 */
export const SELFIES = [
  {
    name: 'chat-01',
    prompt: c =>
      `${SAME_WOMAN} A selfie taken in her bedroom late in the evening, sitting on the edge of an unmade bed, one lamp on, her own things visible behind her — clothes on a chair, a half-open wardrobe. She is wearing ${pick(INDOORS, c)}, hair loose and a little undone. Small tired smile, looking straight into the lens. ${PHONE}`,
  },
  {
    name: 'chat-02',
    prompt: c =>
      `${SAME_WOMAN} A full-length mirror selfie in her hallway before going out, phone visible in her hand covering part of her face, other hand at her side. Coats on hooks and a light switch behind her. She is wearing ${pick(GOING_OUT, c)}, hair done. Confident, chin slightly down. Warm indoor light. ${PHONE}`,
  },
  {
    name: 'chat-03',
    /** Mid-thing, in the place she actually spends her days. */
    prompt: c =>
      `${SAME_WOMAN} A selfie she took in the middle of what she was doing — ${where(c.activity)} — turning to the camera for a second, a little pleased with herself. Her real surroundings are visible and untidy. Daylight from a window. She is wearing ordinary clothes for the task, fully dressed. ${PHONE}`,
  },
  {
    name: 'chat-04',
    /** Out in her own city at night, which is where she stops being a stock photo. */
    prompt: c =>
      `${SAME_WOMAN} A selfie she took at night ${where(c.evening)}, holding the phone up and looking into it, the place behind her out of focus and lit by whatever light is actually there. She is dressed for being out, coat or jacket on. Grainy and imperfect the way a phone is at night. ${PHONE}`,
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
        const url = await generate(shot.prompt(c), '3:4', [AVATAR(c.id)], s =>
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
