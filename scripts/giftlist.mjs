/**
 * The gift catalogue, as pictures. Ids and order mirror `src/data/gifts.ts` in
 * the app — a gift without a file here falls back to its vector glyph, so the
 * two lists are allowed to drift for one release, never for two.
 *
 * Every prompt is written against the same studio: one object, floating, lit
 * warm from the left with a rose rim from the right, on a chroma key green
 * field that `cutout.py` keys out. The lighting is deliberate — these are cut
 * out and dropped onto a near-black plum background, where a flatly lit object
 * reads as a sticker and a rim-lit one reads as an object in the room.
 */
export const GIFTS = [
  {
    id: 'rose',
    subject:
      'a single long-stemmed deep crimson rose in full bloom with dewdrops on the velvet petals, a few dark green leaves, the stem tied with a thin gold ribbon, lying at a slight diagonal',
  },
  {
    id: 'letter',
    subject:
      'a folded cream handwritten love letter tucked into an open ivory envelope sealed with a deep rose-red wax seal embossed with a small heart, the handwriting soft and illegible, resting at a slight angle',
  },
  {
    id: 'chocolate',
    subject:
      'an open matte black box of luxury assorted chocolates with a gold rim, glossy truffles dusted with cocoa inside, a deep red satin ribbon spilling over the edge of the box',
  },
  {
    id: 'teddy',
    subject:
      'a soft caramel-brown plush teddy bear sitting upright, hugging a small red satin heart cushion, stitched smile, visible fur texture',
  },
  {
    id: 'perfume',
    subject:
      'a faceted rose-pink glass perfume bottle with a polished gold cap and a small gold atomiser bulb, the liquid inside catching the light, hovering in mid-air, clean glass with no spray, no mist and no vapour around it',
  },
  {
    id: 'necklace',
    subject:
      'a substantial polished gold chain necklace with visible chunky links, arranged in a loose open S-curve that fills the frame, a large teardrop diamond pendant hanging from it and throwing sparkle',
  },
  {
    id: 'trip',
    subject:
      'a small tan leather weekend travel bag with brass buckles seen from a slight three-quarter angle, two paper boarding passes and a passport tucked under the handle, hovering in mid-air well clear of any surface',
  },
  {
    id: 'ring',
    subject:
      'a platinum solitaire engagement ring standing upright, a large brilliant-cut diamond throwing rainbow sparkle, the band polished to a mirror',
  },
];

export const promptFor = g =>
  `Premium product photograph of ${g.subject}. The object floats centred and fills about seventy percent of the square frame. ` +
  `Isolated on a completely flat, solid, uniform pure chroma key green screen background, hex #00FF00, edge to edge. ` +
  `The object floats in empty space with nothing underneath it: no ground plane, no surface, no contact shadow, no cast shadow, no reflection, no glow, no light bloom, no mist, no smoke, no atmospheric haze, no sparkle particles and no gradient anywhere on the background, which stays one single perfectly uniform colour from corner to corner. ` +
  `Light falls on the object only. Studio product lighting: a warm amber key light from the upper left and a soft rose-pink rim light from the right, gentle specular highlights, rich saturated colour, crisp focus across the whole object, shallow depth of field only far behind it. ` +
  `No people, no hands, no table, no props other than described, no text, no logo, no watermark, no border.`;
