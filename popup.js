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

const controls = {
  enabled: document.querySelector("#enabled"),
  columns: document.querySelector("#columns"),
  gutter: document.querySelector("#gutter"),
  opacity: document.querySelector("#opacity"),
  opacityValue: document.querySelector("#opacityValue"),
  color: document.querySelector("#color"),
  containerMode: document.querySelector("#containerMode"),
  customWidth: document.querySelector("#customWidth"),
  customWidthField: document.querySelector(".custom-width"),
  showGutters: document.querySelector("#showGutters"),
  showCenterLine: document.querySelector("#showCenterLine")
};

let settings = { ...DEFAULTS };

function load() {
  chrome.storage.local.get({ [STORAGE_KEY]: DEFAULTS }, (result) => {
    settings = { ...DEFAULTS, ...(result[STORAGE_KEY] || {}) };
    syncControls();
  });
}

function save(nextSettings) {
  settings = { ...settings, ...nextSettings };
  chrome.storage.local.set({ [STORAGE_KEY]: settings }, syncControls);
}

function syncControls() {
  controls.enabled.checked = Boolean(settings.enabled);
  controls.columns.value = settings.columns;
  controls.gutter.value = settings.gutter;
  controls.opacity.value = settings.opacity;
  controls.opacityValue.value = `${settings.opacity}%`;
  controls.color.value = settings.color;
  controls.containerMode.value = settings.containerMode;
  controls.customWidth.value = settings.customWidth;
  controls.customWidthField.hidden = settings.containerMode !== "custom";
  controls.showGutters.checked = Boolean(settings.showGutters);
  controls.showCenterLine.checked = Boolean(settings.showCenterLine);
}

function numberFrom(control, fallback) {
  const value = Number(control.value);
  return Number.isFinite(value) ? value : fallback;
}

controls.enabled.addEventListener("change", () => save({ enabled: controls.enabled.checked }));
controls.columns.addEventListener("input", () => save({ columns: numberFrom(controls.columns, DEFAULTS.columns) }));
controls.gutter.addEventListener("input", () => save({ gutter: numberFrom(controls.gutter, DEFAULTS.gutter) }));
controls.opacity.addEventListener("input", () => save({ opacity: numberFrom(controls.opacity, DEFAULTS.opacity) }));
controls.color.addEventListener("input", () => save({ color: controls.color.value }));
controls.containerMode.addEventListener("change", () => save({ containerMode: controls.containerMode.value }));
controls.customWidth.addEventListener("input", () => save({ customWidth: numberFrom(controls.customWidth, DEFAULTS.customWidth) }));
controls.showGutters.addEventListener("change", () => save({ showGutters: controls.showGutters.checked }));
controls.showCenterLine.addEventListener("change", () => save({ showCenterLine: controls.showCenterLine.checked }));

load();
