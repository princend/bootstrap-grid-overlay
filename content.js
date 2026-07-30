(function () {
  const STORAGE_KEY = "bootstrapGridOverlaySettings";
  const OVERLAY_ID = "bootstrap-grid-overlay-root";
  const DEFAULTS = {
    enabled: false,
    columns: 12,
    gutter: 30,
    opacity: 28,
    color: "#0d6efd",
    containerMode: "fluid",
    showGutters: true,
    showCenterLine: false,
    zIndex: 2147483647
  };

  const BOOTSTRAP_CONTAINERS = [
    { min: 1400, width: 1320 },
    { min: 1200, width: 1140 },
    { min: 992, width: 960 },
    { min: 768, width: 720 },
    { min: 576, width: 540 }
  ];

  let settings = { ...DEFAULTS };
  let root = null;
  let columnsEl = null;
  let resizeRaf = 0;

  function readSettings(callback) {
    chrome.storage.local.get({ [STORAGE_KEY]: DEFAULTS }, (result) => {
      callback({ ...DEFAULTS, ...(result[STORAGE_KEY] || {}) });
    });
  }

  function getContainerWidth() {
    const viewportWidth = window.innerWidth;

    if (settings.containerMode === "fluid") {
      return viewportWidth;
    }

    if (settings.containerMode === "custom") {
      const customWidth = Number(settings.customWidth || 1140);
      return Math.min(viewportWidth, Math.max(320, customWidth));
    }

    const match = BOOTSTRAP_CONTAINERS.find((item) => viewportWidth >= item.min);
    return match ? match.width : viewportWidth;
  }

  function hexToRgb(hex) {
    const clean = String(hex || DEFAULTS.color).replace("#", "");
    const value = clean.length === 3
      ? clean.split("").map((char) => char + char).join("")
      : clean;
    const number = Number.parseInt(value, 16);

    if (Number.isNaN(number)) {
      return "13, 110, 253";
    }

    return [
      (number >> 16) & 255,
      (number >> 8) & 255,
      number & 255
    ].join(", ");
  }

  function createOverlay() {
    root = document.createElement("div");
    root.id = OVERLAY_ID;
    root.setAttribute("aria-hidden", "true");

    const shadow = root.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      :host {
        all: initial;
      }

      .overlay {
        position: fixed;
        inset: 0;
        pointer-events: none;
        display: flex;
        justify-content: center;
        z-index: var(--grid-z-index);
      }

      .columns {
        position: relative;
        height: 100vh;
        width: var(--grid-container-width);
        display: grid;
        grid-template-columns: repeat(var(--grid-columns), minmax(0, 1fr));
        column-gap: var(--grid-gutter);
        padding-left: calc(var(--grid-gutter) / 2);
        padding-right: calc(var(--grid-gutter) / 2);
        box-sizing: border-box;
        border-left: 1px solid rgba(var(--grid-rgb), 0.55);
        border-right: 1px solid rgba(var(--grid-rgb), 0.55);
      }

      .column {
        min-width: 0;
        height: 100vh;
        background:
          linear-gradient(
            to bottom,
            rgba(var(--grid-rgb), var(--grid-column-alpha)),
            rgba(var(--grid-rgb), var(--grid-column-alpha))
          );
        box-shadow:
          inset 1px 0 rgba(var(--grid-rgb), 0.42),
          inset -1px 0 rgba(var(--grid-rgb), 0.42);
      }

      .overlay.show-gutters .columns {
        background: rgba(var(--grid-rgb), var(--grid-gutter-alpha));
      }

      .overlay.show-center .columns::after {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 1px;
        background: rgba(220, 53, 69, 0.9);
      }
    `;

    const overlay = document.createElement("div");
    overlay.className = "overlay";

    columnsEl = document.createElement("div");
    columnsEl.className = "columns";
    overlay.appendChild(columnsEl);

    shadow.append(style, overlay);
    document.documentElement.appendChild(root);
  }

  function renderColumns() {
    if (!columnsEl) return;

    const columns = Math.max(1, Math.min(24, Number(settings.columns) || DEFAULTS.columns));
    columnsEl.replaceChildren();

    for (let index = 0; index < columns; index += 1) {
      const column = document.createElement("div");
      column.className = "column";
      columnsEl.appendChild(column);
    }
  }

  function applySettings() {
    if (!settings.enabled) {
      removeOverlay();
      return;
    }

    if (!root) {
      createOverlay();
    }

    const containerWidth = getContainerWidth();
    const opacity = Math.max(0, Math.min(100, Number(settings.opacity) || DEFAULTS.opacity)) / 100;
    const gutter = Math.max(0, Math.min(96, Number(settings.gutter) || 0));
    const columns = Math.max(1, Math.min(24, Number(settings.columns) || DEFAULTS.columns));
    const overlay = root.shadowRoot.querySelector(".overlay");

    root.style.setProperty("--grid-container-width", `${containerWidth}px`);
    root.style.setProperty("--grid-columns", String(columns));
    root.style.setProperty("--grid-gutter", `${gutter}px`);
    root.style.setProperty("--grid-rgb", hexToRgb(settings.color));
    root.style.setProperty("--grid-column-alpha", String(opacity));
    root.style.setProperty("--grid-gutter-alpha", String(Math.min(0.2, opacity / 2)));
    root.style.setProperty("--grid-z-index", String(settings.zIndex || DEFAULTS.zIndex));

    overlay.classList.toggle("show-gutters", Boolean(settings.showGutters));
    overlay.classList.toggle("show-center", Boolean(settings.showCenterLine));
    renderColumns();
  }

  function removeOverlay() {
    if (root) {
      root.remove();
      root = null;
      columnsEl = null;
    }
  }

  function scheduleApply() {
    if (resizeRaf) {
      cancelAnimationFrame(resizeRaf);
    }
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      applySettings();
    });
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]) return;
    settings = { ...DEFAULTS, ...(changes[STORAGE_KEY].newValue || {}) };
    applySettings();
  });

  window.addEventListener("resize", scheduleApply, { passive: true });

  window.addEventListener("keydown", (event) => {
    if (!(event.altKey && event.shiftKey && event.key.toLowerCase() === "g")) return;
    settings = { ...settings, enabled: !settings.enabled };
    chrome.storage.local.set({ [STORAGE_KEY]: settings });
  });

  readSettings((storedSettings) => {
    settings = storedSettings;
    applySettings();
  });
})();
