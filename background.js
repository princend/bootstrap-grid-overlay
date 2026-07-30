const STORAGE_KEY = "bootstrapGridOverlaySettings";
const DEFAULTS = {
  enabled: false,
  columns: 12,
  gutter: 30,
  opacity: 28,
  color: "#0d6efd",
  containerMode: "fluid",
  customWidth: 1140,
  showGutters: true,
  showCenterLine: false,
  zIndex: 2147483647
};

function toggleOverlay() {
  chrome.storage.local.get({ [STORAGE_KEY]: DEFAULTS }, (result) => {
    const settings = { ...DEFAULTS, ...(result[STORAGE_KEY] || {}) };
    chrome.storage.local.set({
      [STORAGE_KEY]: {
        ...settings,
        enabled: !settings.enabled
      }
    });
  });
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-grid-overlay") {
    toggleOverlay();
  }
});
