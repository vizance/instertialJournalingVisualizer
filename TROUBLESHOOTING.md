# 故障排除指南

## 圖表不顯示問題

如果您發現沉浸度分布圖和心流折線圖沒有顯示，請按照以下步驟排查：

### 1. 確認使用本地服務器

由於應用使用了 ES6 模組，**必須**通過 HTTP 服務器運行，不能直接雙擊打開 HTML 文件。

**啟動本地服務器：**

```bash
# 方法 1: 使用 Python（推薦）
cd /Users/chichu/Desktop/instertialJournalingVisualizer
python3 -m http.server 8000

# 方法 2: 使用 Node.js
npx http-server -p 8000

# 方法 3: 使用 PHP
php -S localhost:8000
```

然後訪問：`http://localhost:8000`

### 2. 檢查瀏覽器控制台

1. 打開瀏覽器開發者工具（F12 或 Cmd+Option+I）
2. 切換到 **Console** 標籤
3. 查看是否有錯誤訊息

**正常情況下應該看到：**
```
Waiting for libraries to load... (可能出現)
Updating dashboard with X entries
Category stats: {...}
Immersion distribution: {...}
Rendering immersion chart with X entries
Rendering immersion distribution chart: [...]
Charts rendered successfully
```

### 3. 常見錯誤和解決方案

#### 錯誤 A: `CORS policy` 錯誤
```
Access to script at 'file:///.../main.js' from origin 'null'
has been blocked by CORS policy
```

**原因**：直接打開 HTML 文件而非通過服務器
**解決**：使用本地服務器（見上方第 1 步）

#### 錯誤 B: `Chart is not defined`
```
ReferenceError: Chart is not defined
```

**原因**：Chart.js 未加載完成就嘗試創建圖表
**解決**：已修復，應用會自動等待庫加載完成

#### 錯誤 C: Canvas 元素找不到
```
Canvas element "immersionChart" not found
```

**原因**：DOM 未完全加載
**解決**：確保在 `DOMContentLoaded` 後才調用分析

### 4. 測試步驟

1. **清除瀏覽器緩存**
   - Chrome: Cmd+Shift+Delete（Mac）或 Ctrl+Shift+Delete（Windows）
   - 選擇「快取的圖片和文件」
   - 點擊「清除資料」

2. **重新加載頁面**
   - 使用硬刷新：Cmd+Shift+R（Mac）或 Ctrl+Shift+R（Windows）

3. **填入範例資料**
   - 點擊「填入範例資料」按鈕
   - 點擊「開始分析」

4. **檢查圖表**
   - 應該看到三個圖表：
     - 沉浸度心流趨勢（折線圖）
     - 沉浸度分佈（餅圖）
     - 任務類別佔比（甜甜圈圖）

### 5. 調試模式

應用已內建調試日誌，打開控制台即可查看：

```javascript
// 查看當前條目數
console.log('Entries:', appState.getEntries());

// 手動觸發圖表渲染（在控制台執行）
updateDashboard();
```

### 6. 檢查文件完整性

確認所有文件都存在：

```bash
# 在項目目錄執行
ls -la css/
ls -la js/

# 應該看到：
# css/styles.css
# js/constants.js
# js/parser.js
# js/api.js
# js/charts.js
# js/analyzer.js
# js/ui.js
# js/main.js
```

### 7. 瀏覽器兼容性

**支援的瀏覽器：**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**不支援：**
- ❌ IE 11 及更早版本

### 8. 網絡問題

如果圖表庫無法加載（CDN 問題）：

1. 檢查網絡連接
2. 查看 Network 標籤是否有失敗的請求
3. 嘗試訪問：
   - https://cdn.jsdelivr.net/npm/chart.js
   - https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels

如果 CDN 被阻擋，可以下載庫到本地：

```bash
# 下載 Chart.js 到本地
mkdir -p libs
cd libs
curl -O https://cdn.jsdelivr.net/npm/chart.js/dist/chart.umd.js
curl -O https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0/dist/chartjs-plugin-datalabels.min.js
```

然後修改 `index.html`：
```html
<script src="libs/chart.umd.js" defer></script>
<script src="libs/chartjs-plugin-datalabels.min.js" defer></script>
```

## 其他常見問題

### API Key 無法儲存

- 檢查瀏覽器是否禁用 localStorage
- 嘗試在無痕模式外使用

### AI 分類不工作

- 確認已輸入有效的 Gemini API Key
- 檢查 API Key 是否有配額
- 查看控制台是否有 API 錯誤

### 拖放功能無法使用

- 確認使用支援 HTML5 拖放的瀏覽器
- 檢查是否有 JavaScript 錯誤

## 需要更多幫助？

如果以上方法都無法解決問題：

1. 打開瀏覽器開發者工具
2. 截圖 Console 標籤的所有錯誤訊息
3. 記錄您的操作步驟
4. 提供瀏覽器版本和操作系統信息

---

**最後更新**: 2024-12-03
**版本**: v1.0
