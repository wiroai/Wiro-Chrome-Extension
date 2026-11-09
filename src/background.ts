import { buildMenus, jobFromClick, JOB_KEY, type MenusApi } from '../core/src/background/menus.js';
import { loadCatalog } from '../core/src/catalog/catalog.js';
import { DEFAULT_CONFIG } from '../core/src/config.js';
import { chromePlatform } from './platform.js';

// The service worker: builds the right-click menus from the action catalog and
// hands each click to the side panel.

const menus: MenusApi = {
  removeAll: () => chrome.contextMenus.removeAll(),
  create(item) {
    const properties = {
      id: item.id,
      parentId: item.parentId,
      title: item.title,
      type: item.type ?? 'normal',
      contexts: item.contexts,
    } as unknown as chrome.contextMenus.CreateProperties;
    chrome.contextMenus.create(properties, () => void chrome.runtime.lastError);
  },
};

async function setUpMenus(): Promise<void> {
  const catalog = await loadCatalog(chromePlatform.storage, DEFAULT_CONFIG.catalogUrl);
  await buildMenus(menus, catalog);
}

chrome.runtime.onInstalled.addListener(() => void setUpMenus());
chrome.runtime.onStartup.addListener(() => void setUpMenus());

// The toolbar button opens the panel too.
void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const job = jobFromClick(info, tab);
  if (!job) return;
  // sidePanel.open must run inside the click, before anything is awaited.
  if (tab?.id !== undefined) void chrome.sidePanel.open({ tabId: tab.id });
  void chrome.storage.session.set({ [JOB_KEY]: job });
});
