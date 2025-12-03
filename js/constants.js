/**
 * Application Constants
 * Centralized configuration for magic numbers, strings, and settings
 */

// Categories
export const CATEGORIES = {
    WORK: '工作',
    ROUTINE: '日常',
    DEVELOPMENT: '學習',
    FAMILY: '家庭',
    SOCIAL: '社交',
    RELAX_BED: '休息'
};

export const CATEGORY_ORDER = [
    CATEGORIES.WORK,
    CATEGORIES.DEVELOPMENT,
    CATEGORIES.ROUTINE,
    CATEGORIES.FAMILY,
    CATEGORIES.SOCIAL,
    CATEGORIES.RELAX_BED
];

// Category colors for charts
export const CATEGORY_COLORS = {
    [CATEGORIES.WORK]: '#3b82f6',
    [CATEGORIES.ROUTINE]: '#f97316',
    [CATEGORIES.DEVELOPMENT]: '#22c55e',
    [CATEGORIES.FAMILY]: '#ef4444',
    [CATEGORIES.SOCIAL]: '#a855f7',
    [CATEGORIES.RELAX_BED]: '#94a3b8'
};

// Immersion level colors
export const IMMERSION_COLORS = {
    5: '#064e3b',
    4: '#059669',
    3: '#34d399',
    2: '#a7f3d0',
    1: '#d1fae5'
};

// Analysis thresholds
export const THRESHOLDS = {
    ENERGY_CHANGE: 2,           // Minimum change to flag energy transition
    MIN_PERCENTAGE_SHOW: 3,     // Minimum percentage to show in pie chart
    SLEEP_END_HOUR: 7,          // Hour when sleep period typically ends
    SLEEP_START_HOUR: 0         // Hour when sleep period starts
};

// Regex patterns
export const PATTERNS = {
    // Matches: "09:00 ~ 10:00" or "09:00~10:00"
    TIME_HEADER: /(\d{2}:\d{2})\s*~\s*(\d{2}:\d{2})/,

    // Matches: "- > thought content" or "> thought content"
    THOUGHT: /^\s*[-]?\s*>\s*(.*)/,

    // Matches: "- v action content" or "v action content"
    ACTION: /^\s*[-]?\s*v\s*(.*)/,

    // Matches immersion bars: "❚❚❚" or "|||" at the end of content
    // Must contain at least one bar character (❚ or |), not just spaces
    BARS: /([❚|]+)/
};

// API Configuration
export const API_CONFIG = {
    GEMINI_MODEL: 'gemini-2.5-flash-preview-09-2025',
    BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
    STORAGE_KEY: 'gemini_api_key',
    REQUEST_TIMEOUT: 30000  // 30 seconds
};

// Chart configuration
export const CHART_CONFIG = {
    HEIGHT: 350,
    ANIMATION: false,  // Disabled for stable screenshots
    FONT_FAMILY: "'Noto Sans TC', sans-serif",
    DEFAULT_COLOR: '#334155',

    LINE: {
        BORDER_WIDTH: 4,
        POINT_RADIUS: 6,
        MIN_Y: 0,
        MAX_Y: 5
    },

    LABEL: {
        FONT_SIZE: 14,
        FONT_WEIGHT: 'bold',
        FONT_SIZE_LARGE: 16,
        FONT_WEIGHT_HEAVY: '900'
    }
};

// UI Messages
export const MESSAGES = {
    API_KEY_SAVED: '✅ 已儲存！',
    API_KEY_EMPTY: '⚠️ 請輸入',
    ANALYZING: 'AI 分析中 ...',
    COMPLETE: '✅ 完成！',
    KEYWORD_MODE: '關鍵字分類模式',
    NO_VALID_LOG: '未偵測到有效日誌',
    SCREENSHOT_FAILED: '截圖失敗',
    AI_CONNECTION_FAILED: 'AI 連線失敗',
    AI_THINKING: 'AI 思考中 ...',
    STABLE_ENERGY: '能量狀態平穩。',
    NO_DATA: '無足夠數據',
    DRAG_HERE: '拖曳至此'
};

// Time constants
export const TIME = {
    MINUTES_PER_HOUR: 60,
    MINUTES_PER_DAY: 1440,
    MESSAGE_FADE_DURATION: 4000  // 4 seconds
};

// Demo data
export const DEMO_DATA = `- 07:00 ~ 08:00 起床 + 弄早餐 ❚❚❚
- 08:00 ~ 09:30 閱讀技術文章 ❚❚❚❚
  - > 學習新的設計模式
  - v 做筆記整理重點
- 09:30 ~ 12:00 開發新功能 ❚❚❚❚❚
- 12:00 ~ 13:00 午餐 ❚❚
- 13:00 ~ 15:00 Code Review 會議 ❚❚❚
- 15:00 ~ 17:00 重構專案 ❚❚❚❚
- 17:00 ~ 18:00 運動 ❚❚❚❚
- 18:00 ~ 19:00 晚餐 ❚❚
- 19:00 ~ 21:00 個人專案開發 ❚❚❚❚❚
- 21:00 ~ 22:00 放鬆 ❚`;

// Category keywords for fallback classification
export const CATEGORY_KEYWORDS = {
    [CATEGORIES.RELAX_BED]: ['睡', 'sleep', 'nap', '休息', '放鬆'],
    [CATEGORIES.WORK]: ['slide', '工作', '開會', 'meeting', '會議'],
    [CATEGORIES.DEVELOPMENT]: ['讀書', '學習', 'study', 'learning', '閱讀', '開發']
};
