import type { KeyValueStore, Platform } from '../core/src/platform.js';

// Chrome's side of the core: chrome.storage, chrome.identity and chrome.tabs.

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
  clientName: 'Wiro for Chrome',
  // https://<extension id>.chromiumapp.org/: Chromium catches the redirect to it.
  // Opera supports launchWebAuthFlow but not getRedirectURL, so build it there.
  redirectUri: () => (typeof chrome.identity.getRedirectURL === 'function'
    ? chrome.identity.getRedirectURL()
    : `https://${chrome.runtime.id}.chromiumapp.org/`),
  async launchAuth(url) {
    const result = await chrome.identity.launchWebAuthFlow({ url, interactive: true });
    if (!result) throw new Error('The sign-in window was closed.');
    return result;
  },
  openTab: url => void chrome.tabs.create({ url }),
};
