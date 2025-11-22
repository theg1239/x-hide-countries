const STORAGE_KEY = "blockedCountries";

document.addEventListener("DOMContentLoaded", () => {
  const statusEl = document.querySelector("#status");
  const openButton = document.querySelector("#open-options");

  chrome.storage.sync.get({ [STORAGE_KEY]: [] }, (data) => {
    const codes = Array.isArray(data[STORAGE_KEY]) ? data[STORAGE_KEY] : [];
    if (codes.length) {
      statusEl.textContent = `${codes.length} code(s): ${codes.join(", ")}`;
    } else {
      statusEl.textContent = "No blocked countries set.";
    }
  });

  openButton?.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
});
