/**
 * The roster, and what each of them looks like.
 *
 * `id`, `name`, `city`, `vibe`, `traits` and `interests` mirror
 * `src/data/companions.ts` in the app repo — keep them in step, because the
 * bio a user reads and the face they see have to be the same person.
 * Everything else here is only about the photographs.
 *
 * `look` is the part that carries character consistency, so it is written the
 * way a casting note would be: specific, physical, and never generic. Two
 * rules learned the hard way:
 *
 *  - **No number next to an appearance.** kie.ai's moderation rejects "a
 *    beautiful 24 year old woman with…" outright, and the refusal is final.
 *    Adulthood is established with words ("a woman in her late twenties",
 *    "grown woman"), and the numeric age stays in the app's data, not here.
 *  - **One distinguishing feature each**, at minimum: a gap tooth, a scar, a
 *    nose stud, a fringe cut slightly wrong. Twelve conventionally pretty
 *    faces with no marks read as stock photography, which is the exact
 *    opposite of what this app is selling.
 *
 * `activity` completes "candid photograph of her …" for the casual shot, and
 * `evening` completes "…" for the moment shot. Both are in her own world:
 * they come from her interests, not from a generic library of poses.
 */

export const COMPANIONS = [
  {
    id: 'mia',
    name: 'Mia',
    city: 'Lisbon',
    vibe: 'romantic',
    traits: 'affectionate, artistic, attentive',
    look: 'a woman in her mid-twenties, Portuguese, sun-warmed olive skin, dark chestnut wavy hair falling just past her shoulders, hazel eyes, a scatter of freckles across her nose and cheekbones, a small paint smudge on one forearm, wearing a soft oversized linen shirt in cream',
    grade: 'warm golden colour grade, rose and terracotta accents',
    activity: 'painting at an easel by a tall window, brush in hand, half turned toward the camera',
    evening: 'on a Lisbon rooftop at dusk, warm street lights below, looking out rather than at the camera',
  },
  {
    id: 'sofia',
    name: 'Sofia',
    city: 'Milan',
    vibe: 'playful',
    traits: 'witty, confident, flirty',
    look: 'a woman in her late twenties, Italian, warm tan skin, long glossy dark brown hair with a centre parting, deep brown eyes, strong defined eyebrows, a small beauty mark above her lip, matte red lipstick, wearing a sharply cut black blazer over a silk camisole',
    grade: 'crisp editorial colour grade, deep reds and warm neutrals',
    activity: 'laughing mid-sentence at a small espresso bar counter, cup in hand',
    evening: 'walking a Milan side street at night, shop lights behind her, glancing back over her shoulder',
  },
  {
    id: 'yuki',
    name: 'Yuki',
    city: 'Kyoto',
    vibe: 'shy',
    traits: 'gentle, thoughtful, loyal',
    look: 'a young adult woman, Japanese, fair porcelain skin, straight jet-black hair cut in a chin-length bob with a soft fringe, dark brown eyes, a quiet closed-mouth smile, small silver stud earrings, wearing a high-necked oatmeal knit sweater',
    grade: 'cool muted colour grade, soft greens and pale grey',
    activity: 'writing in a journal at a low wooden table, an old film camera beside her',
    evening: 'under a shop awning in Kyoto during light rain, looking off to the side',
  },
  {
    id: 'ava',
    name: 'Ava',
    city: 'New York',
    vibe: 'intellectual',
    traits: 'curious, direct, grounding',
    look: 'a woman in her late twenties, African-American, warm deep brown skin, dark tightly coiled hair gathered up with loose strands framing her face, dark brown eyes, thin gold-rimmed glasses, a small gap between her front teeth that shows when she smiles, wearing a charcoal turtleneck',
    grade: 'cool desaturated colour grade, blue-grey shadows and amber highlights',
    activity: 'mid-thought over a chessboard in a dim apartment, one hand near a piece',
    evening: 'by a New York window at night, city lights out of focus behind her, glass of whiskey on the sill',
  },
  {
    id: 'lena',
    name: 'Lena',
    city: 'Berlin',
    vibe: 'adventurous',
    traits: 'spontaneous, bold, fun',
    look: 'a woman in her mid-twenties, German, fair skin with a light tan, ash-blonde hair cropped short and pushed back, grey-blue eyes, a small silver nose stud, a faded scar through one eyebrow, chalk dust on her hands, wearing a worn olive utility jacket over a plain tank top',
    grade: 'high-contrast colour grade, cool concrete tones with a warm rim light',
    activity: 'chalking her hands at the base of a climbing wall, grinning at whoever is holding the camera',
    evening: 'leaning against a motorbike on a Berlin street at night, neon sign glowing behind her',
  },
  {
    id: 'nora',
    name: 'Nora',
    city: 'Copenhagen',
    vibe: 'caring',
    traits: 'warm, patient, reassuring',
    look: 'a woman in her late twenties, Danish, pale skin with a warm flush, straight strawberry-blonde hair worn loose past her collarbone, clear blue eyes, faint freckles, laugh lines at the corners of her eyes, no makeup, wearing a soft grey cardigan with the sleeves pushed up',
    grade: 'soft natural colour grade, pale wood and green plant tones',
    activity: 'tending to a crowded shelf of houseplants in a bright kitchen, sleeves rolled',
    evening: 'on a sofa under a lamp with an old film paused on the screen, blanket over her knees',
  },
  {
    id: 'zara',
    name: 'Zara',
    city: 'Dubai',
    vibe: 'playful',
    traits: 'ambitious, magnetic, playful',
    look: 'a woman in her mid-twenties, Middle Eastern, rich deep brown skin, very long black hair with a slight wave, striking amber-brown eyes, sharp cheekbones, delicate gold hoop earrings and a fine gold chain, wearing a structured cream sleeveless top',
    grade: 'luxurious warm colour grade, gold and deep amber',
    activity: 'stretching at the barre in an empty dance studio, mirrors and warm light behind her',
    evening: 'on a high balcony at night, city towers glittering far below, wind in her hair',
  },
  {
    id: 'elle',
    name: 'Elle',
    city: 'Paris',
    vibe: 'romantic',
    traits: 'elegant, honest, devoted',
    look: 'a woman around thirty, French, fair skin, dark blonde hair cut in a jaw-length French bob with a blunt fringe, green eyes, a fine line of freckles across the bridge of her nose, minimal makeup, a thin silver necklace, wearing a navy trench coat over a striped shirt',
    grade: 'muted filmic colour grade, slate blue and warm cream',
    activity: 'reading at a café table by a window, one hand around a glass of red wine, pages open',
    evening: 'on a Paris street at night after rain, wet pavement reflecting the lamps, half-smiling',
  },
  {
    id: 'iris',
    name: 'Iris',
    city: 'Seoul',
    vibe: 'playful',
    traits: 'competitive, silly, sweet',
    look: 'a young adult woman, Korean, fair skin, long straight black hair with a blunt fringe and one strand dyed soft pink, dark eyes, a bright open grin, small hoop earrings, wearing an oversized graphic hoodie',
    grade: 'vivid colour grade, magenta and cyan LED accents',
    activity: 'at a desk lit by monitor glow, headset around her neck, mid-celebration after winning',
    evening: 'eating ramen at a late-night counter in Seoul, steam rising, laughing at something off-camera',
  },
  {
    id: 'maya',
    name: 'Maya',
    city: 'Tel Aviv',
    vibe: 'caring',
    traits: 'calm, intuitive, present',
    look: 'a woman in her mid-twenties, Israeli, golden-olive skin, thick dark curly hair pulled loosely back with strands escaping, warm brown eyes, a calm steady gaze, a small delicate tattoo on her inner wrist, wearing a loose sand-coloured linen top',
    grade: 'sunlit natural colour grade, sand and sea blue',
    activity: 'sitting cross-legged on a mat in a bright studio, mid-breath, eyes half closed',
    evening: 'on the sea wall in Tel Aviv at sunset, hair moving in the wind, looking at the water',
  },
  {
    id: 'chloe',
    name: 'Chloé',
    city: 'Montreal',
    vibe: 'romantic',
    traits: 'sarcastic, loyal, creative',
    look: 'a woman in her mid-twenties, French-Canadian, fair skin heavily freckled across the nose and cheeks, copper-auburn hair tied up in a messy knot with loose pieces, green eyes, a wry half-smile, a small silver ring on a chain, wearing a black apron over a striped long-sleeve shirt',
    grade: 'cosy warm colour grade, amber and deep brown',
    activity: 'behind a café counter pulling an espresso shot, steam and warm light around her',
    evening: 'walking through falling snow in Montreal at night, streetlight above, collar turned up',
  },
  {
    id: 'aria',
    name: 'Aria',
    city: 'London',
    vibe: 'intellectual',
    traits: 'composed, insightful, dry humour',
    look: 'a woman in her late twenties, mixed-race British, light brown skin, dark brown hair worn in a low sleek ponytail, dark eyes, a composed almost-amused expression, one small silver ear cuff, wearing a well-cut grey wool coat over a black roll-neck',
    grade: 'cool restrained colour grade, grey-blue and soft white',
    activity: 'leaning over architectural drawings on a large desk, pencil in hand, glancing up',
    evening: 'under a London bus shelter in the rain at night, headlights streaking past behind her',
  },
];

export const byId = id => COMPANIONS.find(c => c.id === id);
