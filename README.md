<div align="center">

<img src="https://raw.githubusercontent.com/wiroai/Wiro-Chromium-Extension/main/.github/assets/wiro-logo.png" alt="Wiro AI" width="240">

# Wiro AI Browser Extension for Chrome, Edge, Opera, Whale and Brave

Right-click any image, video, audio clip, text or page to run Wiro AI models: make a video, edit or upscale an image, restore a photo, read text aloud, transcribe, translate and more, with the price shown before every run.

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-111111?style=for-the-badge&color=111111)](./manifest.json) [![Chrome, Edge, Opera, Whale](https://img.shields.io/badge/Chrome%20%7C%20Edge%20%7C%20Opera%20%7C%20Whale-111111?style=for-the-badge&color=111111)](#store-packages) [![TypeScript](https://img.shields.io/badge/TypeScript-111111?style=for-the-badge&color=111111)](./tsconfig.json) [![License: MIT](https://img.shields.io/badge/license-MIT-111111?style=for-the-badge&color=111111)](./LICENSE)

[Website](https://wiro.ai) · [Models](https://wiro.ai/models) · [Docs](https://wiro.ai/docs) · [Dashboard](https://wiro.ai/panel)

<img src="https://wiro.ai/images/koala/accent-heavy-koala.png" alt="Wiro AI koala mascot" width="60" />

</div>

Wiro puts its AI models one right-click away. Pick what you want done with an image, a video, an audio clip, selected text or the page, choose a model from the live Wiro catalog, and the result comes back in a panel next to the page. You sign in with your Wiro account, runs are paid from your Wiro wallet, and the panel shows the price before you start.

<p align="center">
  <img src=".github/assets/screenshots/01-photo-to-video.png" alt="The Wiro panel turning a photo of a dog into a video" width="49%">
  <img src=".github/assets/screenshots/02-page-to-video.png" alt="The Wiro panel sending a page to Wiro Studio to make a video" width="49%">
</p>
<p align="center">
  <img src=".github/assets/screenshots/03-brief-to-image.png" alt="The Wiro panel turning selected text into a magazine cover image" width="49%">
  <img src=".github/assets/screenshots/04-edit-video.png" alt="The Wiro panel editing a bike video so the trail is covered in snow" width="49%">
</p>
<p align="center">
  <img src=".github/assets/screenshots/05-models.png" alt="The models made for a job, sorted by price, popularity or date" width="49%">
  <img src=".github/assets/screenshots/06-song.png" alt="The Wiro panel turning selected lines into a song" width="49%">
</p>
<p align="center">
  <img src=".github/assets/screenshots/07-read-aloud.png" alt="The Wiro panel reading selected text aloud in a chosen voice" width="49%">
  <img src=".github/assets/screenshots/08-every-action.png" alt="Every Wiro action for an image, one right-click away" width="49%">
</p>
<p align="center">
  <img src=".github/assets/screenshots/09-translate.png" alt="The Wiro panel translating selected Spanish text into English" width="49%">
  <img src=".github/assets/screenshots/10-price.png" alt="The Wiro panel showing the price of an image edit before the run" width="49%">
</p>

## What you can do

| Right-click on | Actions |
| --- | --- |
| An image | make a video, edit with a prompt, upscale, restore an old photo, remove the background, blur faces, find objects, make a 3D model, ask about it, extract or translate its text, make a product ad, add effects, make a song from it, make it talk, try clothes on |
| A video | edit with a prompt, upscale, add music, ask about it |
| An audio clip | transcribe it, change the voice |
| Selected text | generate an image or a video, read it aloud, turn it into a song, translate it, summarize it |
| A page | turn it into a video with Wiro Studio, ask about it |

Each action lists the Wiro models made for it, so new models show up without an extension update. Sort them by price, popularity or date and pick one; the panel asks only for what that model needs. Download a result, copy its link, or keep it in the tray for the next step. Your recent runs are listed under History.

## Install

Install it from the [Chrome Web Store](https://chromewebstore.google.com/detail/wiro-ai-tools-for-images/cehkhdmppbnfeahegjjkdhangjelehab), or in Whale from the [Naver Whale Store](https://store.whale.naver.com/detail/elgobhnkemhlhfakdmpijbknhehnkgle). There is more about the extension at [wiro.ai/browser-extension](https://wiro.ai/browser-extension). Links to Microsoft Edge Add-ons and Opera add-ons will be added here when those listings go live.

To build it from source, use Node.js 22 or later:

```bash
git clone --recurse-submodules https://github.com/wiroai/Wiro-Chromium-Extension.git
cd Wiro-Chromium-Extension
npm install
(cd core && npm install)
npm run build
```

Then open `chrome://extensions` (or `edge://extensions`), turn on Developer mode, choose **Load unpacked** and pick `dist/`.

## Store packages

```bash
npm run build:store
```

This writes one folder and one zip per store under `release/`, without the development key, so each store assigns its own extension ID:

| Package | Store | Browsers |
| --- | --- | --- |
| `wiro-chrome-<version>.zip` | [Chrome Web Store](https://chromewebstore.google.com/detail/wiro-ai-tools-for-images/cehkhdmppbnfeahegjjkdhangjelehab) | Chrome, Brave, Vivaldi, Arc |
| `wiro-edge-<version>.zip` | Microsoft Edge Add-ons | Edge |
| `wiro-opera-<version>.zip` | Opera add-ons | Opera |
| `wiro-whale-<version>.zip` | [Naver Whale Store](https://store.whale.naver.com/detail/elgobhnkemhlhfakdmpijbknhehnkgle) | Whale |

All four come from the same code. Opera has no side panel API, so its package uses Opera's own sidebar (`sidebar_action`), opens the panel as a popup from the toolbar button and in a tab from a right-click, and carries the 45-character name that Opera's store accepts. Any Chromium browser without the side panel API gets the same tab behaviour. The Whale Store does not accept the `identity` permission, so the Whale package opens the panel as a popup from the toolbar button and in a tab from a right-click, and signs in through Wiro's sign-in page in a tab, like the Safari extension.

## How it is built

The shared code (sign-in, MCP client, actions, model gateway, pricing and the panel UI) lives in [Wiro-Extension-Core](https://github.com/wiroai/Wiro-Extension-Core), included here as the `core/` submodule. This repo adds the Chromium parts:

- `src/platform.ts`: storage, the sign-in window (`chrome.identity.launchWebAuthFlow`) and tabs.
- `src/background.ts`: the service worker. It builds the right-click menus and opens the side panel, or a tab where there is no side panel.
- `src/panel.ts`, `public/panel.html`: the panel page.
- `src/callback.ts`: Whale package only. A content script on Wiro's sign-in callback page that hands the result to the background, which finishes the sign-in.
- `manifest.json`: Manifest V3.
- `scripts/build.mjs`: the esbuild build for development and for the store packages. The bundle is not minified.

After a core change: `git -C core pull origin main`, rebuild, and commit the new `core` pointer.

## Sign-in

The extension signs in with a Wiro account through the OAuth 2.1 server at `mcp.wiro.ai`, with PKCE, so no API key is stored in the browser. Its redirect address is `https://<extension-id>.chromiumapp.org/`. A development build carries the public key in `dev-key.txt`, so its ID stays `dgnlhjpdifdkkfglhhiafpedepmhckbn` on every machine. The private key is not in this repo.

The Whale package has no `identity` permission. It opens the sign-in page in a tab, Wiro sends the browser back to `https://wiro.ai/extension/callback`, and the extension finishes the sign-in there.

## Permissions

| Permission | Why |
| --- | --- |
| `contextMenus` | the Wiro entries in the right-click menu |
| `sidePanel` | the panel where a run is set up and its result shows |
| `storage` | the sign-in tokens, the tray, run history and the last model picked per action |
| `identity` | the Wiro sign-in window |

No host permissions and no content scripts: the extension reads only what a right-click hands it (the item's address, the selected text or the page address) and sends it to Wiro when you start a run. The Whale package drops `sidePanel` and `identity`; its only content script runs on Wiro's sign-in callback page. See the [Wiro privacy policy](https://wiro.ai/agreement/privacy-policy).

## More from Wiro AI

| Repository | What it is |
| --- | --- |
| [Wiro-Firefox-Extension](https://github.com/wiroai/Wiro-Firefox-Extension) | Wiro AI add-on for Firefox |
| [Wiro-Safari-Extension](https://github.com/wiroai/Wiro-Safari-Extension) | Wiro AI extension for Safari on the Mac |
| [Wiro-Extension-Core](https://github.com/wiroai/Wiro-Extension-Core) | Shared core of the Wiro AI browser extensions |
| [Wiro-MCP](https://github.com/wiroai/Wiro-MCP) | Official MCP server for Wiro AI, [`@wiro-ai/wiro-mcp` on npm](https://www.npmjs.com/package/@wiro-ai/wiro-mcp) |
| [Wiro-Plugin](https://github.com/wiroai/Wiro-Plugin) | Wiro AI plugin for Cursor, Claude Code, Gemini CLI, Devin, Antigravity and Kiro |
| [Wiro-Skills](https://github.com/wiroai/Wiro-Skills) | Agent skills for images, image edits, video, music, speech, transcripts, 3D and model search |
| [Wiro-LLM](https://github.com/wiroai/Wiro-LLM) | Vercel AI SDK provider for chat, images, speech, transcription and video |
| [Swift-QuickStart](https://github.com/wiroai/Swift-QuickStart) | WiroKit, the Wiro AI SDK for iOS |
| [Kotlin-QuickStart](https://github.com/wiroai/Kotlin-QuickStart) | WiroKit, the Wiro AI SDK for Android |
| [Dart-QuickStart](https://github.com/wiroai/Dart-QuickStart) | Wiro AI SDK for Dart and Flutter, [`wiro` on pub.dev](https://pub.dev/packages/wiro) |
| [ReactNative-QuickStart](https://github.com/wiroai/ReactNative-QuickStart) | Wiro AI SDK for React Native and Expo, [`@wiro-ai/wiro-react-native` on npm](https://www.npmjs.com/package/@wiro-ai/wiro-react-native) |
| [Swift-Realtime](https://github.com/wiroai/Swift-Realtime) | Realtime voice AI example for iOS |
| [Kotlin-Realtime](https://github.com/wiroai/Kotlin-Realtime) | Realtime voice AI example for Android |
| [Dart-Realtime](https://github.com/wiroai/Dart-Realtime) | Realtime voice AI example for Flutter |
| [ReactNative-Realtime](https://github.com/wiroai/ReactNative-Realtime) | Realtime voice AI example for React Native |
| [n8n-nodes-wiroai](https://github.com/wiroai/n8n-nodes-wiroai) | Wiro AI nodes for n8n, [`@wiro-ai/n8n-nodes-wiroai` on npm](https://www.npmjs.com/package/@wiro-ai/n8n-nodes-wiroai) |
| [Wiro-Dify-Plugin](https://github.com/wiroai/Wiro-Dify-Plugin) | Wiro AI plugins for Dify: the LLM gateway as a model provider, plus image, video, speech and music tools |
| [Wiro-ComfyUI](https://github.com/wiroai/Wiro-ComfyUI) | Wiro AI nodes for ComfyUI |
| [Wiro-Hermes](https://github.com/wiroai/Wiro-Hermes) | Wiro AI plugins for Hermes Agent: image, video, audio and 3D tools, plus the LLM gateway as a model provider |
| [Wiro-Zed](https://github.com/wiroai/Wiro-Zed) | Wiro AI MCP server extension for Zed |
| [Wiro-Action](https://github.com/wiroai/Wiro-Action) | GitHub Action for Wiro AI models and the LLM gateway, [on the GitHub Marketplace](https://github.com/marketplace/actions/wiro-ai-action) |
| [Wiro-Raycast](https://github.com/wiroai/Wiro-Raycast) | Wiro AI extension for Raycast: image and video generation, LLM chat and model search |
| [Wiro-WordPress](https://github.com/wiroai/Wiro-WordPress) | Wiro AI plugin for WordPress: featured images, image edits, alt text, narration and SEO suggestions |
| [Wiro-Obsidian](https://github.com/wiroai/Wiro-Obsidian) | Wiro AI plugin for Obsidian: images, video, speech, music, transcription and text tools |
| [Wiro-Blender](https://github.com/wiroai/Wiro-Blender) | Wiro AI add-on for Blender: text to 3D, image to 3D and textures |
| [Wiro-Figma](https://github.com/wiroai/Wiro-Figma) | Wiro AI plugin for Figma: images, vectors, image edits and text |
| [Wiro-Next-Starter](https://github.com/wiroai/Wiro-Next-Starter) | Next.js starter for Wiro AI: Playground, image, video and audio tools, and LLM chat, ready for Vercel and Railway |
| [Wiro-Docs](https://github.com/wiroai/Wiro-Docs) | Source of the Wiro AI API docs |

[Website](https://wiro.ai) · [Models](https://wiro.ai/models) · [Docs](https://wiro.ai/docs) · [X](https://x.com/wiroai)

## License

MIT, see [LICENSE](./LICENSE).
