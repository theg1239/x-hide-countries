const STORAGE_KEY = "blockedCountries";
const PREFS_KEY = "countryFilterPreferences";
const CODE_REGEX = /^[A-Z]{2}$/;
const DEFAULT_PREFERENCES = {
  hideStyle: "card",
  placeholderText: "Hidden tweet from {{COUNTRY}}",
  accentColor: "#1d9bf0"
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#countries-form");
  const input = document.querySelector("#countries-input");
  const statusEl = document.querySelector("#status");
  const hideStyle = document.querySelector("#hide-style");
  const placeholderInput = document.querySelector("#placeholder-text");
  const accentInput = document.querySelector("#accent-color");

  chrome.storage.sync.get({ [STORAGE_KEY]: [], [PREFS_KEY]: DEFAULT_PREFERENCES }, (data) => {
    input.value = (data[STORAGE_KEY] || []).join(", ");
    const prefs = { ...DEFAULT_PREFERENCES, ...(data[PREFS_KEY] || {}) };
    hideStyle.value = prefs.hideStyle || DEFAULT_PREFERENCES.hideStyle;
    placeholderInput.value = prefs.placeholderText || DEFAULT_PREFERENCES.placeholderText;
    accentInput.value = prefs.accentColor || DEFAULT_PREFERENCES.accentColor;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const { valid, invalid } = splitCodes(input.value);
    const preferences = sanitizePreferences({
      hideStyle: hideStyle.value,
      placeholderText: placeholderInput.value,
      accentColor: accentInput.value
    });

    chrome.storage.sync.set({ [STORAGE_KEY]: valid, [PREFS_KEY]: preferences }, () => {
      if (invalid.length) {
        statusEl.textContent = `Saved ${valid.length} code(s). Ignored: ${invalid.join(", ")}`;
      } else {
        statusEl.textContent = `Saved ${valid.length} code(s).`;
      }
      setTimeout(() => (statusEl.textContent = ""), 3000);
    });
  });
});

function splitCodes(rawValue) {
  const valid = new Set();
  const invalid = new Set();

  rawValue
    .split(/[,\s]+/)
    .map((entry) => entry.trim().toUpperCase())
    .filter(Boolean)
    .forEach((code) => {
      if (CODE_REGEX.test(code)) {
        valid.add(code);
      } else {
        invalid.add(code);
      }
    });

  return {
    valid: Array.from(valid.values()),
    invalid: Array.from(invalid.values())
  };
}

function sanitizePreferences(prefs) {
  const merged = { ...DEFAULT_PREFERENCES, ...(prefs || {}) };
  if (!/^(card|compact)$/.test(merged.hideStyle)) {
    merged.hideStyle = DEFAULT_PREFERENCES.hideStyle;
  }
  merged.placeholderText = (merged.placeholderText || DEFAULT_PREFERENCES.placeholderText).slice(0, 120);
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(merged.accentColor || "")) {
    merged.accentColor = DEFAULT_PREFERENCES.accentColor;
  }
  return merged;
}
