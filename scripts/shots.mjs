/**
 * The five photographs every companion needs, and how each one is worded.
 *
 * The anchor comes first and alone: it is the only shot generated from text
 * only, and every other shot is an *edit* of it, so her face carries across
 * the set. Generating independent portraits from the same description gives
 * you several different women — near enough to each other to read as a bug
 * rather than as a character.
 *
 * There is no separate avatar shot. The anchor is already a square
 * head-and-shoulders portrait on a plain background, which is exactly what a
 * small circular avatar wants; asking the model for a "tighter crop of this"
 * gave back the anchor again, at the price of a job. The app crops it.
 *
 * Wording rules that are requirements rather than taste:
 *  - never a number beside an appearance (see companions.mjs);
 *  - the camera language ("85mm, f/1.8, shallow depth of field") is what keeps
 *    the output photographic instead of illustrated;
 *  - "natural skin texture, visible pores" fights the default retouched
 *    plastic look, which is the single biggest tell that a face is generated;
 *  - **every shot names its own outfit.** Clothing is deliberately kept out of
 *    `look` and put in `wardrobe`, because an edit inherits whatever the
 *    reference was wearing — and a woman in the same shirt on the street, at
 *    her easel and on a rooftop at midnight reads as one photoshoot, not as
 *    someone with a life.
 */

/** Shared tail: the difference between a photograph and a render. */
const CRAFT =
  'photorealistic, shot on a full-frame camera with an 85mm lens at f/1.8, shallow depth of field, natural skin texture with visible pores and fine hair detail, subtle film grain, no retouching. Single subject. No text, no watermark, no logo, no collage, no border.';

/**
 * Applied to every edit. The first half keeps the face; the second half is
 * there because without it the model returns the reference almost unchanged —
 * it treats "same person" as "same photograph".
 */
const sameWoman = outfit =>
  `Keep the exact same woman from the reference photograph — identical face, bone structure, eye colour, hair colour, freckles and marks. Do not change her identity. This is a completely new photograph taken on a different day: new location, new pose, new framing, and she is wearing ${outfit}.`;

export const SHOTS = [
  {
    name: '01-anchor',
    ratio: '1:1',
    /** The reference every other shot is generated against, and the avatar. */
    anchor: true,
    prompt: c =>
      `Photorealistic portrait photograph of ${c.look}, wearing ${c.wardrobe.anchor}. Head and shoulders, square crop, facing the camera directly, relaxed natural expression, eye contact with the lens. Plain uncluttered background, softly out of focus. Even soft window light from one side. ${c.grade}. ${CRAFT}`,
  },
  {
    name: '02-card',
    ratio: '3:4',
    prompt: c =>
      `${sameWoman(c.wardrobe.out)} Three-quarter length portrait, vertical composition, standing outdoors in ${c.city} with the street far behind her thrown completely out of focus. She is ${c.traits}, and it shows in how she holds herself. Soft directional daylight. ${c.grade}. ${CRAFT}`,
  },
  {
    name: '03-casual',
    ratio: '3:4',
    prompt: c =>
      `${sameWoman(c.wardrobe.casual)} Candid photograph of her ${c.activity}. Unposed, caught mid-moment, not looking at the lens, natural daylight, vertical composition. ${c.grade}. ${CRAFT}`,
  },
  {
    name: '04-selfie',
    ratio: '3:4',
    prompt: c =>
      `${sameWoman(c.wardrobe.selfie)} A selfie she took on her own phone and sent in a message. Shot from slightly above at arm's length with a front-facing phone camera: her arm is visible reaching towards the lens, the framing is a little off-centre and tilted, her face is close and large in the frame, mild wide-angle distortion. She is at home in the evening, warm lamplight, a glimpse of her own room behind her — bed, shelves, a doorway — nothing styled. Slightly soft and noisy the way a real phone camera is in low light. Not a professional portrait. No text, no watermark, single subject.`,
  },
  {
    name: '05-evening',
    ratio: '3:4',
    prompt: c =>
      `${sameWoman(c.wardrobe.evening)} Photograph of her ${c.evening}. Evening, warm practical lights, cinematic, wide enough to show where she is. Vertical composition, room at the top of the frame for an overlay. ${c.grade}. ${CRAFT}`,
  },
];
