/**
 * kie.ai (Nano Banana) client — the whole API surface this repo needs.
 *
 * The API is asynchronous: createTask hands back a task id, recordInfo is
 * polled until the state flips. Four things bite, and all four are handled
 * here so the generators can stay readable:
 *
 *  - tasks fail with a transient `failCode 500 / Internal Error` often enough
 *    that every job needs retrying (credits are not consumed on those);
 *  - a moderation refusal arrives through the same channel as a blip, and
 *    asking again only spends two more minutes reaching the same verdict, so
 *    PERMANENT tells them apart;
 *  - recordInfo echoes the request back inside a `param` string whose JSON is
 *    double-escaped, so the result URL comes out by regex, not JSON.parse;
 *  - the CDN that serves result URLs 403s a request without a browser
 *    User-Agent, which looks exactly like an expired link if you do not know.
 *
 * Mirrors src/services/images.ts in the app repo. That one runs on device and
 * generates on demand; this one runs here and generates the shipped files.
 */

import { writeFile } from 'node:fs/promises';

const BASE = 'https://api.kie.ai/api/v1/jobs';
const POLL_INTERVAL = 4000;
/**
 * Ten minutes. Generous because kie.ai's queue does genuinely stall — tasks
 * sit in `waiting` for many minutes and then all complete at once, and a
 * client that gave up at ninety seconds would have thrown away work it had
 * already paid for.
 */
const POLL_ATTEMPTS = 150;
const JOB_ATTEMPTS = 3;

/** A verdict, not a blip: the same prompt earns the same refusal. */
const PERMANENT =
  /moderat|policy|violat|nsfw|prohibit|not allowed|invalid prompt|unsupported/i;

export class Rejected extends Error {
  constructor(reason) {
    super(`kie.ai refused: ${reason}`);
    this.name = 'Rejected';
  }
}

const key = () => {
  const k = process.env.KIE_API_KEY;
  if (!k) throw new Error('KIE_API_KEY is not set — see README.');
  return k;
};

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${key()}`,
});

export const sleep = ms => new Promise(r => setTimeout(r, ms));

export const credits = async () => {
  const res = await fetch('https://api.kie.ai/api/v1/chat/credit', {
    headers: headers(),
  });
  return (await res.json()).data;
};

const createTask = async (prompt, ratio, refs) => {
  const res = await fetch(`${BASE}/createTask`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: refs?.length ? 'google/nano-banana-edit' : 'google/nano-banana',
      input: {
        prompt,
        output_format: 'png',
        image_size: ratio,
        ...(refs?.length ? { image_urls: refs } : null),
      },
    }),
  });
  const json = await res.json();
  const taskId = json?.data?.taskId;
  if (!taskId) throw new Error(`no taskId: ${JSON.stringify(json).slice(0, 300)}`);
  return taskId;
};

const pollTask = async (taskId, onWait) => {
  for (let i = 0; i < POLL_ATTEMPTS; i += 1) {
    await sleep(POLL_INTERVAL);
    const res = await fetch(`${BASE}/recordInfo?taskId=${taskId}`, {
      headers: headers(),
    }).catch(() => null);
    if (!res) continue;
    const raw = await res.text();
    const state = /"state":"(\w+)"/.exec(raw)?.[1];
    // Silence for ten minutes is indistinguishable from a hang, so say so.
    if (state === 'waiting' && i && i % 8 === 0)
      onWait?.(Math.round((i * POLL_INTERVAL) / 1000));
    if (state === 'success') {
      const url = /resultUrls\\":\[\\"([^\\]+)/.exec(raw)?.[1];
      if (!url) throw new Error('success without a result URL');
      return url;
    }
    if (state === 'fail') {
      const msg = /"failMsg":"([^"]*)"/.exec(raw)?.[1] ?? 'failed';
      if (PERMANENT.test(msg)) throw new Rejected(msg);
      throw new Error(msg);
    }
  }
  throw new Error('timed out');
};

/**
 * One image, start to finish. `refs` turns the job into an edit against a
 * reference photo, which is how a character keeps the same face across shots.
 */
export const generate = async (prompt, ratio = '3:4', refs, onWait) => {
  let last;
  for (let attempt = 0; attempt < JOB_ATTEMPTS; attempt += 1) {
    try {
      return await pollTask(await createTask(prompt, ratio, refs), onWait);
    } catch (err) {
      if (err instanceof Rejected) throw err;
      last = err;
      if (attempt < JOB_ATTEMPTS - 1) await sleep(2000 * (attempt + 1));
    }
  }
  throw last;
};

/** The CDN 403s anything without a browser User-Agent. */
export const download = async (url, path) => {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
    },
  });
  if (!res.ok) throw new Error(`download ${res.status} for ${url}`);
  await writeFile(path, Buffer.from(await res.arrayBuffer()));
};
