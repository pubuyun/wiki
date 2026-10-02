# Upload images to iGEM using my attached browser session

Use the iGEM Teams browser tab I attach to this message and the existing logged-in session to upload the images specified below. Carry out the uploads and return the actual stored CDN URLs.

## My upload request

- Local image paths: REPLACE WITH ABSOLUTE FILE PATHS, one per line.
- Destination folder: REPLACE WITH A PATH RELATIVE TO THE WIKI STORAGE ROOT, for example `project/results`. Write `Root` for the root folder.
- Team ID: `6133` (GreatBay-SCIE), unless I specify a different team.
- Overwrite existing files: No, unless I explicitly request replacement.

Ask for any missing file paths or destination folder before uploading. The examples below describe usage; they are not instructions to upload the old test image again.

## Local script and environment

Use `C:\Users\wzh_z\Documents\wiki\uploadscript\igem-upload.mjs`. Read it before running it. It requires Node.js 20+ and no external packages. Upload one file per invocation; run multiple files sequentially and report each result.

Follow the repository instructions and `C:\Users\wzh_z\.codex\RTK.md`. Prefix shell commands with `rtk`. Do not build the Nuxt project or start a development server. This task uses the remote iGEM upload API.

The script discovers the active wiki repository, checks for filename collisions, uploads, waits for image processing, and prints the actual stored file URL. Supply `--folder ""` for Root. Supply `--overwrite` only when my request authorizes replacement. A destination can be a new nested folder; no separate folder-creation request is required.

Example invocation after authentication is available in the child process environment:

```powershell
rtk proxy node "C:\Users\wzh_z\Documents\wiki\uploadscript\igem-upload.mjs" --team 6133 --file "C:\path\image.png" --folder "project/results"
```

## Obtain authentication from the attached tab

Read the available computer-use skill and the browser capability documentation before interacting. Bind the tab using my actual browser attachment through `cua.getTab({ mention: ... })`; do not reuse browser or tab IDs from an earlier conversation. Use the browser's documented APIs and the tab's `cdp` capability for this developer task.

1. Verify that the attachment is an authenticated iGEM Teams tab for the requested team. Open its Wiki Uploads page if needed. If login is required, let me complete it and retain the tab for handoff.
2. Enable CDP network observation with `Network.enable`. Read an event cursor before reloading the Uploads page or navigating into a folder.
3. Read subsequent `Network.requestWillBeSent` and `Network.requestWillBeSentExtraInfo` events. Match the request ID of the requested team's file-listing request to its extra-info event. The URL should start with `https://api.igem.org/v1/teams/<team>/repositories/` and contain `/files`.
4. Keep that request's `cookie` header in memory. It contains `__Host-session`. Do not print the cookie, dump raw headers/events, save it to a file, put it in command arguments, or include it in the final answer. If more events are needed, continue from the returned cursor, respecting pagination and truncation.
5. Pass the cookie to the uploader only as the child process environment variable `IGEM_COOKIE`. The uploader sends it to `https://api.igem.org` and refuses redirects. Do not use the session for unrelated services or accounts.

The browser file chooser may require the extension's “Allow access to file URLs” setting. This standalone API script was successfully tested without that setting; using the script does not require changing extension permissions.

## Run with the cookie kept in memory

In the previous test, the browser JavaScript session supported importing Node's `node:child_process` module. Use this pattern if supported by your current tool environment. First determine an installed Node executable using the available terminal tools. The tested executable was `C:\nvm4w\nodejs\node.exe`; verify it rather than assuming it exists.

The following is a pattern to adapt after obtaining the cookie and filling in the requested file and folder. `cookieHeader` is the in-memory header from the matching API request. Never substitute its actual value into source text or tool outputs.

```javascript
let childProcess = await import('node:child_process');
let uploadResult = await new Promise(resolve => {
  childProcess.execFile(
    'C:\\nvm4w\\nodejs\\node.exe',
    [
      'C:\\Users\\wzh_z\\Documents\\wiki\\uploadscript\\igem-upload.mjs',
      '--team', '6133',
      '--file', requestedAbsoluteFilePath,
      '--folder', requestedFolder === 'Root' ? '' : requestedFolder,
    ],
    { env: { IGEM_COOKIE: cookieHeader }, timeout: 360000 },
    (error, stdout, stderr) => resolve({
      exitCode: error?.code ?? 0,
      stdout,
      stderr,
    }),
  );
});
nodeRepl.write(uploadResult);
```

Use a declared result variable. Do not assume `process` exists in the browser JavaScript session: it was unavailable during the previous test. The explicit child environment above worked. Observe the current tool's execution limits; if a long upload is still running, keep its result available and use supported continuation rather than launching a duplicate upload.

If this in-memory execution method is unavailable in your current tools, explain the specific limitation and use a supported upload method. Do not claim that authentication was transferred or that an upload completed without evidence. Never persist the session cookie to work around a tool limitation.

## API behavior and verification

These endpoints were identified from the live page and its frontend on October 2, 2026. Confirm current behavior if they have changed.

| Purpose | Request relative to `https://api.igem.org/v1` |
| --- | --- |
| Discover wiki repository UUID | `GET /teams/<team>/wiki` |
| List destination contents | `GET /teams/<team>/repositories/<uuid>/files?directory=<encoded-folder>` |
| Upload one file | `POST /teams/<team>/repositories/<uuid>/files?directory=<encoded-folder>` |
| Check image processing | `GET /image-compression/progress/<job-id>` |

The POST body is multipart form data with field name `file`. Let `FormData` generate the multipart boundary and Content-Type. The `directory` parameter is the remote destination, not a local folder. Omit it for Root.

Images can be converted to AVIF, so never assume the original extension survives. Use the stored URL returned by the final directory listing. The upload UI sets a 10 MB limit per file. Existing filenames or their AVIF equivalents are blocked by the script unless `--overwrite` is supplied. If processing times out, check the listing and Uploads page before retrying. Replacement files can remain cached for up to 24 hours.

After the script succeeds, refresh the attached Uploads page at the requested folder and verify the stored filename. Save a screenshot showing the folder breadcrumb and uploaded file, and embed it in the final answer. Report a concise mapping of each local filename to its stored CDN URL, with any individual failures clearly stated.

Clear temporary cookie variables and event objects containing credentials, then disable network observation. Keep credentials out of saved artifacts. Do not delete the uploaded files unless I request it.

The prior live test successfully stored `C:\Users\wzh_z\Downloads\test.png` as `general/upload-api-test/test.avif`. The script also refused a second upload to that destination without `--overwrite`. This is prior verification, not a new upload request.
