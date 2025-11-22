const STORAGE_KEY = "blockedCountries";
const CODE_REGEX = /^[A-Z]{2}$/;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#countries-form");
  const input = document.querySelector("#countries-input");
  const statusEl = document.querySelector("#status");

  chrome.storage.sync.get({ [STORAGE_KEY]: [] }, (data) => {
    input.value = (data[STORAGE_KEY] || []).join(", ");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const { valid, invalid } = splitCodes(input.value);

    chrome.storage.sync.set({ [STORAGE_KEY]: valid }, () => {
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
