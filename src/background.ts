import { buildMenus, jobFromClick, JOB_KEY, type MenusApi } from '../core/src/background/menus.js';
import { loadCatalog } from '../core/src/catalog/catalog.js';
import { DEFAULT_CONFIG } from '../core/src/config.js';
import { chromePlatform } from './platform.js';

// The service worker: builds the right-click menus from the action catalog and
// hands each click to the panel. Chrome and Edge show the panel in their side
// panel. A Chromium browser without the side panel API (Opera) shows it in a
// tab instead, and its toolbar button opens it as a popup.

const PANEL_TAB_KEY = 'wiro.panelTab';
const hasSidePanel = typeof chrome.sidePanel?.open === 'function';

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

// The toolbar button opens the side panel too.
if (hasSidePanel) void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

/** Without a side panel: the panel in a tab, reused by the next click. */
async function showPanelTab(): Promise<void> {
  const known = await chromePlatform.session.get<number>(PANEL_TAB_KEY);
  if (typeof known === 'number') {
    try {
      await chrome.tabs.update(known, { active: true });
      return;
    } catch {
      // That tab was closed.
    }
  }
  const tab = await chrome.tabs.create({ url: chrome.runtime.getURL('panel.html') });
  if (tab.id !== undefined) await chromePlatform.session.set(PANEL_TAB_KEY, tab.id);
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const job = jobFromClick(info, tab);
  if (!job) return;
  if (hasSidePanel) {
    // sidePanel.open must run inside the click, before anything is awaited.
    if (tab?.id !== undefined) void chrome.sidePanel.open({ tabId: tab.id });
    void chrome.storage.session.set({ [JOB_KEY]: job });
    return;
  }
  void chrome.storage.session.set({ [JOB_KEY]: job }).then(showPanelTab);
});
