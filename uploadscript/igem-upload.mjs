#!/usr/bin/env node
// Node.js 20+. No packages required. Uses the existing iGEM login session.
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: {
  file: { type: 'string' }, folder: { type: 'string', default: '' },
  team: { type: 'string', default: '6133' }, repo: { type: 'string' },
  overwrite: { type: 'boolean', default: false },
  help: { type: 'boolean', default: false },
} });

if (values.help) {
  console.log('Set IGEM_COOKIE to the Cookie header of an authenticated api.igem.org request.\n'
    + 'node igem-upload.mjs --file "C:\\path\\image.png" --folder "project/results" [--team 6133] [--repo UUID] [--overwrite]\n'
    + 'Use --folder "" for Root. Folder paths are relative to the team wiki storage.');
  process.exit(0);
}

const api = 'https://api.igem.org/v1';
const cookie = process.env.IGEM_COOKIE?.trim();
const folder = values.folder.replaceAll('\\', '/').replace(/^\/+|\/+$/g, '');
const mimeTypes = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.json': 'application/json',
  '.css': 'text/css', '.js': 'text/javascript', '.csv': 'text/csv',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.otf': 'font/otf', '.vtt': 'text/vtt', '.srt': 'application/x-subrip',
};

async function request(route, options = {}) {
  const response = await fetch(`${api}/${route}`, {
    ...options,
    headers: { Accept: 'application/json', Cookie: cookie,
      Origin: 'https://teams.igem.org', Referer: 'https://teams.igem.org/',
      ...options.headers },
    // Prevent forwarding a session cookie to a redirect destination.
    redirect: 'error', signal: AbortSignal.timeout(120000),
  });
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!response.ok) {
    const reason = response.status === 401 || response.status === 403
      ? 'Refresh IGEM_COOKIE from your logged-in browser and check team upload permissions.'
      : String(data?.message ?? data?.error ?? response.statusText);
    throw new Error(`HTTP ${response.status}: ${reason}`);
  }
  if (text && data === null) throw new Error('Expected a JSON response from the iGEM API.');
  return data;
}

async function main() {
  if (!values.file) throw new Error('--file is required. Use --help for usage.');
  if (!cookie || !/(^|;\s*)__Host-session=/.test(cookie)) {
    throw new Error('Set IGEM_COOKIE to the authenticated API Cookie header (__Host-session=...).');
  }
  if (!/^\d+$/.test(values.team)) throw new Error('--team must be a numeric team ID.');
  if (folder && folder.split('/').some(p => !p || p === '.' || p === '..')) {
    throw new Error('Use a relative folder path, e.g. project/results, without . or .. segments.');
  }
  const filePath = path.resolve(values.file);
  const info = await stat(filePath);
  if (!info.isFile() || info.size === 0) throw new Error('Select a nonempty regular file.');
  if (info.size > 10 * 1024 * 1024) throw new Error('The upload UI limits files to 10 MB.');
  const name = path.basename(filePath);
  const extension = path.extname(name).toLowerCase();
  const repository = values.repo ?? (await request(`teams/${values.team}/wiki`))?.uuid;
  if (!repository || !/^[0-9a-f-]{36}$/i.test(repository)) {
    throw new Error('No active wiki repository found. Supply --repo UUID if needed.');
  }
  const route = `teams/${values.team}/repositories/${repository}/files`
    + (folder ? `?directory=${encodeURIComponent(folder)}` : '');
  const before = await request(route);
  // PNG/JPEG uploads are converted to AVIF. Avoid overwriting either name by default.
  const candidates = new Set([name]);
  if (['.png', '.jpg', '.jpeg', '.webp'].includes(extension)) {
    candidates.add(`${path.parse(name).name}.avif`);
  }
  if (!values.overwrite && before.files?.some(f => candidates.has(f.name))) {
    throw new Error('This destination already contains the filename or AVIF equivalent. Use --overwrite intentionally.');
  }
  const form = new FormData();
  form.append('file', new Blob([await readFile(filePath)], {
    type: mimeTypes[extension] ?? 'application/octet-stream',
  }), name);
  console.log(`Uploading ${name} to ${folder || 'Root'} (team ${values.team})...`);
  // FormData sets multipart Content-Type AND boundary automatically.
  const result = await request(route, { method: 'POST', body: form });
  if (result?.id) {
    console.log(`Processing job: ${result.id}`);
    const deadline = Date.now() + 5 * 60 * 1000;
    let completed = false;
    while (Date.now() < deadline) {
      const job = await request(`image-compression/progress/${encodeURIComponent(result.id)}`);
      if (['failed', 'stuck'].includes(job?.state)) {
        throw new Error(`Processing ${job.state}: ${job.failedReason || 'Check the Uploads page.'}`);
      }
      if (job?.state === 'completed') { completed = true; break; }
      await delay(1500);
    }
    if (!completed) throw new Error('Upload accepted, but processing timed out. Check the Uploads page before retrying.');
  }
  // Read the actual stored URL rather than assuming the original extension survived.
  for (let attempt = 0; attempt < 10; attempt++) {
    const listing = await request(route);
    const stored = listing.files?.find(f => candidates.has(f.name));
    if (stored?.url) {
      console.log(`Stored: ${stored.name}\nURL: ${stored.url}`);
      return;
    }
    await delay(1500);
  }
  throw new Error('Upload accepted, but the stored file is not listed yet. Check the Uploads page before retrying.');
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
