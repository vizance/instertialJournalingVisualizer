# 日誌視覺化工具 - Refactored v4

## 🎉 重構完成

這是一個經過全面重構的每日日誌視覺化工具，遵循 Clean Code 原則，提供更好的可維護性和可擴展性。

## 📁 項目結構

```
instertialJournalingVisualizer/
├── index.html              # 主 HTML 文件（簡化版，無內聯代碼）
├── css/
│   └── styles.css         # 所有自定義樣式
├── js/
│   ├── constants.js       # 常數配置（魔法數字、字串、配置）
│   ├── parser.js          # 日誌解析邏輯
│   ├── api.js            # API 調用（Gemini AI）
│   ├── charts.js         # 圖表渲染邏輯（Chart.js）
│   ├── analyzer.js       # 數據分析邏輯
│   ├── ui.js             # UI 更新和交互
│   └── main.js           # 主應用程序（協調所有模組）
└── README.md             # 本文件
```

## 🔧 主要改進

### 1. 模組化架構
- ✅ **分離關注點**：每個模組負責單一職責
- ✅ **ES6 模組**：使用 `import/export` 進行模組化
- ✅ **依賴注入**：減少模組間的耦合

### 2. 代碼質量
- ✅ **移除魔法數字**：所有常數集中在 `constants.js`
- ✅ **函數拆分**：長函數拆分為小型、可測試的函數
- ✅ **命名改善**：使用描述性的變數和函數名稱
- ✅ **註釋完整**：每個函數都有 JSDoc 註釋

### 3. 安全性
- ✅ **移除硬編碼 API Key**：不再暴露敏感信息
- ✅ **LocalStorage 管理**：API Key 安全存儲在本地

### 4. 可維護性
- ✅ **單一職責原則（SRP）**：每個模組只做一件事
- ✅ **DRY 原則**：消除重複代碼
- ✅ **易於測試**：模組化設計便於單元測試

## 📦 模組說明

### `constants.js`
集中管理所有配置：
- 類別定義和顏色
- 閾值設定
- 正則表達式模式
- API 配置
- UI 訊息

### `parser.js`
處理日誌解析：
- 解析時間條目
- 提取思考和行動
- 計算沉浸度和時長
- 自動補充睡眠時段

### `api.js`
管理 API 調用：
- API Key 管理（儲存/載入/清除）
- Gemini AI 分類
- AI 建議生成
- 關鍵字備用分類

### `charts.js`
圖表渲染：
- 沉浸度趨勢線圖
- 沉浸度分佈餅圖
- 類別佔比甜甜圈圖
- Chart.js 配置管理

### `analyzer.js`
數據分析：
- 類別統計計算
- 沉浸度分析
- 能量轉折點識別
- 生產力評分

### `ui.js`
UI 管理：
- DOM 元素快取
- 狀態消息顯示
- 分析結果渲染
- 拖放看板
- 截圖下載

### `main.js`
應用協調：
- 初始化應用
- 協調各模組
- 處理用戶操作
- 管理應用狀態

## 🚀 使用方式

1. **開啟 `index.html`**
   - 可以直接在瀏覽器中打開
   - 或使用本地服務器（推薦）

2. **輸入 API Key**（可選）
   - 填入 Google Gemini API Key
   - 點擊「儲存」按鈕
   - 或使用關鍵字分類模式

3. **輸入日誌**
   - 格式：`- HH:MM ~ HH:MM 內容 ❚❚❚`
   - 可點擊「填入範例資料」測試

4. **分析**
   - 點擊「開始分析」
   - 查看圖表和 AI 建議

## 🧪 本地開發

由於使用了 ES6 模組，需要通過 HTTP 服務器運行：

```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js http-server
npx http-server

# 然後訪問
# http://localhost:8000
```

## 📊 代碼統計

### 重構前
- **1 個文件**：index.html（377 行）
- **內聯代碼**：~200 行 JavaScript
- **可維護性**：❌ 低

### 重構後
- **9 個文件**：模組化結構
- **代碼行數**：
  - index.html: 269 行（✅ -108 行，移除所有內聯代碼）
  - constants.js: 134 行
  - parser.js: 164 行
  - api.js: 234 行
  - charts.js: 310 行
  - analyzer.js: 201 行
  - ui.js: 483 行
  - main.js: 239 行
  - styles.css: 59 行
- **可維護性**：✅ 高

## 🎯 重構原則

1. **SOLID 原則**
   - 單一職責原則
   - 開放封閉原則
   - 依賴反轉原則

2. **Clean Code**
   - 有意義的命名
   - 小型函數
   - 最小化副作用
   - DRY（Don't Repeat Yourself）

3. **模組化**
   - 高內聚
   - 低耦合
   - 清晰的接口

## 📝 後續改進建議

1. **TypeScript 遷移**
   - 增加類型安全
   - 更好的 IDE 支援

2. **單元測試**
   - Jest 或 Vitest
   - 測試覆蓋率 > 80%

3. **構建工具**
   - Vite 或 Webpack
   - 代碼壓縮和優化

4. **前端框架**（可選）
   - React / Vue / Svelte
   - 組件化開發

## 📄 授權

原項目作者保留所有權利。
此重構版本遵循相同授權。

---

**Refactored by Claude Code** | 2024
**版本**: v4 Stable
