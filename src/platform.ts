import type { KeyValueStore, Platform } from '../core/src/platform.js';
import { CALLBACK_URL } from './platform-constants.js';

// Chrome's side of the core: chrome.storage, chrome.identity and chrome.tabs.
// The Whale build has no identity permission (Whale's store refuses it), so it
// signs in like Safari: wiro.ai opens in a tab and sends the browser back to
// CALLBACK_URL, where the callback content script hands the address to the
// background, which finishes the sign-in (see background.ts).
const hasIdentity = typeof chrome.identity?.launchWebAuthFlow === 'function';

function store(area: chrome.storage.StorageArea, areaName: string): KeyValueStore {
  return {
    async get<T>(key: string) {
      const values = await area.get(key);
      return values[key] as T | undefined;
    },
    set: (key, value) => area.set({ [key]: value }),
    remove: key => area.remove(key),
    onChanged(listener) {
      const handler = (changes: Record<string, chrome.storage.StorageChange>, name: string) => {
        if (name !== areaName) return;
        listener(Object.fromEntries(Object.entries(changes).map(([key, change]) => [key, change.newValue])));
      };
      chrome.storage.onChanged.addListener(handler);
      return () => chrome.storage.onChanged.removeListener(handler);
    },
  };
}

export const chromePlatform: Platform = {
  name: 'chrome',
  version: chrome.runtime.getManifest().version,
  storage: store(chrome.storage.local, 'local'),
  session: store(chrome.storage.session, 'session'),
  clientName: hasIdentity ? 'Wiro for Chrome' : 'Wiro for Whale',
  // https://<extension id>.chromiumapp.org/: Chromium catches the redirect to it.
  // Opera supports launchWebAuthFlow but not getRedirectURL, so build it there.
  redirectUri: () => {
    if (!hasIdentity) return CALLBACK_URL;
    return typeof chrome.identity.getRedirectURL === 'function'
      ? chrome.identity.getRedirectURL()
      : `https://${chrome.runtime.id}.chromiumapp.org/`;
  },
  async launchAuth(url) {
    if (!hasIdentity) {
      await chrome.tabs.create({ url });
      // The background finishes the sign-in; the panel follows it through storage.
      return undefined;
    }
    const result = await chrome.identity.launchWebAuthFlow({ url, interactive: true });
    if (!result) throw new Error('The sign-in window was closed.');
    return result;
  },
  openTab: url => void chrome.tabs.create({ url }),
};
