# iGirlfriend — companion assets

Photographs of the twelve companions in the **iGirlfriend** iOS app, and the
pipeline that produces them. Kept out of the app repo because image sets churn
— a face gets rejected, regenerated, recropped — and none of that belongs in
the history of the application.

**This repository is also the app's image server.** Nothing here ships inside
the IPA; the app fetches `web/` over HTTPS from GitHub Pages, which is why the
repository is public. Replacing a face is a push, not a release.

## Layout

`companions/` holds the masters — the negatives. Every crop and re-encode comes
from these, never from a JPEG.

```
companions/<id>/01-anchor.png    1:1   the reference face — and the avatar
                02-card.png      3:4   Discover card
                03-casual.png    3:4   candid, doing the thing she actually does
                04-selfie.png    3:4   what she "sends" in a chat
                05-evening.png   3:4   Moments feed
```

`web/` is what the phone downloads: 98 MB of PNG compressed to 7.5 MB of
progressive JPEG by `scripts/derivatives.py`, in two widths because the same
photograph is a full-bleed hero and a 118pt gallery tile.

```
web/<id>/avatar.jpg      512x512    every circular avatar in the app
         card.jpg        864x1184   and card-sm.jpg at 432x592
         casual.jpg      864x1184   and casual-sm.jpg
         selfie.jpg      864x1184   and selfie-sm.jpg
         evening.jpg     864x1184   and evening-sm.jpg
```

Served at:

```
https://joppe-sabbe.github.io/igirlfriend-assets/web/<id>/<shot>.jpg
```

The app builds those URLs in `src/data/media.ts` and picks the width from the
box it is drawing into. Change the layout here and that file changes with it.

```sh
python3 scripts/derivatives.py            # after adding or replacing a master
python3 scripts/derivatives.py --force    # re-encode everything
```

## Generating

```sh
export KIE_API_KEY=...            # kie.ai, same key as the app's config.local.ts
node scripts/generate.mjs                  # everyone, every shot
node scripts/generate.mjs mia yuki         # two of them
node scripts/generate.mjs --shots 01       # anchors only, for the whole roster
node scripts/generate.mjs mia --force      # redo hers from scratch
```

Resumable: an existing file is skipped, so an interrupted run restarts for
free and one bad portrait is fixed by deleting that one file. Anchor URLs are
cached in `.anchors.json` (gitignored, and they expire in hours) so a later
run can generate shot 04 without redoing the face it has to match.

## How the faces stay the same face

Only `01-anchor` is generated from text. Everything else is a
`google/nano-banana-edit` job against the anchor's URL, carrying an explicit
"same woman, do not change her identity" instruction. Six independent
portraits from one description give you several different women — near enough
to each other to read as a bug rather than a character.

There is no separate avatar file. The anchor is already a square
head-and-shoulders portrait on a plain background, which is what a small
circular avatar wants; asking the model for "a tighter crop of this" returned
the anchor again at the price of a job. The app crops it.

**Clothing lives in `wardrobe`, never in `look`.** An edit inherits whatever
the reference was wearing, so the first pass put the same linen shirt on the
street, at the easel and on a rooftop at midnight — one photoshoot rather than
a person with a life. Each shot now names its own outfit, and the edit prompt
says in as many words that this is a new photograph taken on a different day.

## Two rules the API enforces the hard way

- **Never put a number next to an appearance.** `a beautiful 24 year old woman
  with long hair` is refused by moderation, and the refusal is final — retrying
  spends two minutes arriving at the same answer. Adulthood is established in
  words ("a woman in her late twenties"); the numeric age lives in the app's
  `companions.ts`, not in a prompt.
- **The result CDN 403s a request with no browser `User-Agent`**, which looks
  exactly like an expired link. `scripts/kie.mjs` sends one.

Transient `failCode 500 / Internal Error` is common and costs no credits;
whole jobs retry three times.

## Editing a character's look

`scripts/companions.mjs` is the casting sheet — one entry per companion, and
the `id`/`city`/`traits` fields mirror `src/data/companions.ts` in the app
repo. Keep them in step: the bio someone reads and the face they see have to
be the same person.

Every look carries at least one distinguishing mark — a gap tooth, a scar
through an eyebrow, a nose stud, freckles. Twelve unmarked pretty faces read
as stock photography, which is the opposite of what the app is selling.

`scripts/shots.mjs` holds the six framings and the shared camera language.
