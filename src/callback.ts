import { AUTH_MESSAGE } from './platform-constants.js';

// Whale build only. Runs on https://wiro.ai/extension/callback, the page
// wiro.ai sends the browser to after sign-in. It hands the address (with the
// one-time code) to the background, which finishes the sign-in and closes this
// tab. On failure it says so on the page.

interface Answer {
  ok: boolean;
  error?: string;
}

chrome.runtime.sendMessage({ type: AUTH_MESSAGE, url: location.href }, (answer: Answer | undefined) => {
  if (answer?.ok) return;
  const reason = answer?.error ?? chrome.runtime.lastError?.message ?? 'no answer from the extension';
  const note = document.createElement('p');
  note.textContent = `Wiro could not finish signing in: ${reason}. Close this tab and start again from the Wiro panel.`;
  note.style.cssText = 'font: 15px/1.5 system-ui, sans-serif; max-width: 34em; margin: 48px auto; padding: 0 16px;';
  document.body.prepend(note);
});
