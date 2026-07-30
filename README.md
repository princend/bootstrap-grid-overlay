# Bootstrap Grid Overlay Chrome Extension

這是一個 Manifest V3 Chrome 擴充套件，可以在任何網頁上直接顯示 Bootstrap 風格的欄格 overlay，不需要頁面 DOM 本身有 `.container`、`.row`、`.col-*` 結構。

## 功能

- 直接在任意網頁覆蓋 12 欄 Bootstrap grid
- 預設 Fluid 100% container
- 預設 gutter 30px
- 可切換 Bootstrap responsive container 與自訂最大寬度
- 使用者可自行選擇柵格顏色
- 可調整欄數、gutter、透明度
- 可顯示 gutter 與頁面中線

## 載入方式

1. Clone this repository:

   ```bash
   git clone https://github.com/princend/bootstrap-grid-overlay.git
   ```

2. 打開 Chrome，進入 `chrome://extensions/`
3. 開啟右上角「開發人員模式」
4. 點「載入未封裝項目」
5. 選擇 clone 下來的 `bootstrap-grid-overlay` 資料夾

## Bootstrap container 對應

- `>= 1400px`: 1320px
- `>= 1200px`: 1140px
- `>= 992px`: 960px
- `>= 768px`: 720px
- `>= 576px`: 540px
- `< 576px`: 100%
