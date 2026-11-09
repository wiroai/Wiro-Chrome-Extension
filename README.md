# Wiro for Chrome

Right-click an image, video, audio clip, selected text or a page to run Wiro AI models and tools in Chrome's side panel: animate, edit, upscale, restore, read aloud, transcribe, translate and more. The models come live from Wiro's categories, so new models show up without an extension update.

The shared code (sign-in, MCP client, actions, gateway, pricing, panel) lives in [Wiro-Extension-Core](https://github.com/wiroai/Wiro-Extension-Core), included here as the `core/` submodule. This repo adds the Chrome parts:

- `src/platform.ts`: storage, the sign-in window (`chrome.identity.launchWebAuthFlow`) and tabs.
- `src/background.ts`: the service worker. It builds the right-click menus and opens the side panel on a click.
- `src/panel.ts`, `public/panel.html`: the side panel page.
- `manifest.json`: Manifest V3.

## Build

```bash
git clone --recurse-submodules https://github.com/wiroai/Wiro-Chrome-Extension.git
cd Wiro-Chrome-Extension
npm install
(cd core && npm install)
npm run typecheck
npm run build
```

Then open `chrome://extensions`, turn on Developer mode, choose **Load unpacked** and pick `dist/`.

After a core change: `git -C core pull origin main`, rebuild, and commit the new `core` pointer.

## Extension ID and sign-in

A development build carries the public key in `dev-key.txt`, so its ID stays `dgnlhjpdifdkkfglhhiafpedepmhckbn` on every machine. The private key is not in this repo.

Sign-in uses the Wiro OAuth server at `mcp.wiro.ai` (PKCE, no API key in the browser). Its redirect address is `https://<extension-id>.chromiumapp.org/`, and the server accepts only redirect addresses it knows. The development ID's address and, after the first store upload, the store ID's address have to be on that list.

## Store build

```bash
npm run build:store
cd dist && zip -r ../wiro-chrome.zip . && cd ..
```

The store build leaves out the development key, so the Chrome Web Store keeps its own ID.

## Permissions

| Permission | Why |
| --- | --- |
| `contextMenus` | the Wiro entries in the right-click menu |
| `sidePanel` | the panel where a run is set up and its result shows |
| `storage` | the sign-in tokens, the tray, run history and the last model picked per action |
| `identity` | the Wiro sign-in window |

No host permissions and no content scripts: the extension reads only what a right-click hands it (the item's address, the selected text, the page address) and sends it to Wiro when the user starts a run.
