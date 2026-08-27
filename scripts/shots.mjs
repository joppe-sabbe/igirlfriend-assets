/**
 * The six photographs every companion needs, and how each one is worded.
 *
 * The anchor comes first and alone: it is the only shot generated from text
 * only, and every other shot is an *edit* of it, so her face carries across
 * the set. Generating six independent portraits from the same description
 * produces six different women — close enough to look like a mistake rather
 * than a character.
 *
 * Wording rules that are not style preferences but hard requirements:
 *  - never a number beside an appearance (see companions.mjs);
 *  - the camera language ("85mm, f/1.8, shallow depth of field") is what keeps
 *    the output on the photographic side of the model rather than the
 *    illustrated one;
 *  - "natural skin texture, visible pores" fights the default plastic
 *    retouched look, which is the single biggest tell that a face is generated.
 */

/** Shared tail: the difference between a photograph and a render. */
const CRAFT =
  'photorealistic, shot on a full-frame camera with an 85mm lens at f/1.8, shallow depth of field, natural skin texture with visible pores and fine hair detail, subtle film grain, no retouching. Single subject. No text, no watermark, no logo, no collage, no border.';

/** Applied to every edit so the model keeps the face instead of reinventing it. */
const SAME_PERSON =
  'Keep the exact same woman from the reference photograph — identical face, bone structure, eye colour, hair colour and length, freckles, marks and jewellery. Do not change her identity.';

export const SHOTS = [
  {
    name: '01-anchor',
    ratio: '1:1',
    /** The reference every other shot is generated against. */
    anchor: true,
    prompt: c =>
      `Photorealistic portrait photograph of ${c.look}. Head and shoulders, square crop, facing the camera directly, relaxed natural expression, eye contact with the lens. Plain uncluttered background, softly out of focus. Even soft window light from one side. ${c.grade}. ${CRAFT}`,
  },
  {
    name: '02-card',
    ratio: '3:4',
    prompt: c =>
      `${SAME_PERSON} Three-quarter length portrait, vertical composition, standing in ${c.city} with the street far behind her thrown completely out of focus. She is ${c.traits}, and it shows in how she holds herself. Soft directional daylight. ${c.grade}. ${CRAFT}`,
  },
  {
    name: '03-avatar',
    ratio: '1:1',
    prompt: c =>
      `${SAME_PERSON} Tight square crop on her face and shoulders for a small circular profile picture, warm soft smile, direct eye contact, dark uncluttered background so she reads clearly at very small sizes. ${c.grade}. ${CRAFT}`,
  },
  {
    name: '04-casual',
    ratio: '3:4',
    prompt: c =>
      `${SAME_PERSON} Candid photograph of her ${c.activity}. Unposed, caught mid-moment, natural daylight, vertical composition. ${c.grade}. ${CRAFT}`,
  },
  {
    name: '05-selfie',
    ratio: '3:4',
    prompt: c =>
      `${SAME_PERSON} A front-camera selfie she took herself and sent in a message: held at arm's length, slightly off-centre framing, mildly imperfect, close to her face, warm indoor light, a hint of her room behind her. Vertical phone photograph, slightly soft, the way a real phone camera looks in low light. ${c.grade}. No text, no watermark, single subject.`,
  },
  {
    name: '06-evening',
    ratio: '3:4',
    prompt: c =>
      `${SAME_PERSON} Photograph of her ${c.evening}. Evening, warm practical lights, cinematic. Vertical composition, room at the top of the frame for an overlay. ${c.grade}. ${CRAFT}`,
  },
];
