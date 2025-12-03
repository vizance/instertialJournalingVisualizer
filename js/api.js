/**
 * API Module
 * Handles all external API calls (Gemini AI)
 */

import { API_CONFIG, CATEGORIES } from './constants.js';

/**
 * API Key management
 */
export const ApiKeyManager = {
    /**
     * Save API key to localStorage
     * @param {string} key - API key to save
     * @returns {boolean} Success status
     */
    save(key) {
        try {
            localStorage.setItem(API_CONFIG.STORAGE_KEY, key);
            return true;
        } catch (error) {
            console.error('Failed to save API key:', error);
            return false;
        }
    },

    /**
     * Load API key from localStorage
     * @returns {string|null} Stored API key or null
     */
    load() {
        try {
            return localStorage.getItem(API_CONFIG.STORAGE_KEY);
        } catch (error) {
            console.error('Failed to load API key:', error);
            return null;
        }
    },

    /**
     * Clear API key from localStorage
     */
    clear() {
        try {
            localStorage.removeItem(API_CONFIG.STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear API key:', error);
        }
    }
};

/**
 * Build Gemini API URL
 * @param {string} apiKey - API key
 * @returns {string} Full API URL
 */
function buildGeminiUrl(apiKey) {
    return `${API_CONFIG.BASE_URL}/${API_CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;
}

/**
 * Make a request to Gemini API
 * @param {string} prompt - Prompt to send
 * @param {string} apiKey - API key
 * @returns {Promise<string>} API response text
 * @throws {Error} If API call fails
 */
async function callGeminiApi(prompt, apiKey) {
    const url = buildGeminiUrl(apiKey);

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0]) {
            throw new Error('Invalid API response format');
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('AI 連線失敗: ' + error.message);
    }
}

/**
 * Categorize log entries using AI
 * @param {Array} entries - Log entries to categorize
 * @param {string} apiKey - API key
 * @returns {Promise<void>}
 */
export async function categorizeWithAI(entries, apiKey) {
    const items = entries.map(entry => `[${entry.start}] ${entry.content}`).join('\n');

    const prompt = `請將以下日誌條目分類到這些類別之一：
- ${CATEGORIES.ROUTINE}：日常作息（用餐、通勤、早晨例行事務）
- ${CATEGORIES.WORK}：工作相關任務、會議、簡報
- ${CATEGORIES.SOCIAL}：與朋友的社交活動
- ${CATEGORIES.DEVELOPMENT}：學習、閱讀、個人成長
- ${CATEGORIES.RELAX_BED}：睡眠、午睡、休息（00:00-07:00 通常是睡眠）
- ${CATEGORIES.FAMILY}：家庭時間、與家人的活動

重要規則：
1. 00:00-07:00 之間的條目通常應該是「${CATEGORIES.RELAX_BED}」
2. 任何午睡或睡眠都應該是「${CATEGORIES.RELAX_BED}」
3. 只返回 JSON 陣列，包含與輸入相同順序的類別字串
4. 不要解釋，只要 JSON 陣列

日誌條目：
${items}`;

    try {
        const responseText = await callGeminiApi(prompt, apiKey);

        // Clean response (remove markdown code blocks if present)
        const cleanedResponse = responseText.replace(/```json|```/g, '').trim();
        const categories = JSON.parse(cleanedResponse);

        // Validate response
        if (!Array.isArray(categories) || categories.length !== entries.length) {
            throw new Error('Invalid categorization response');
        }

        // Apply categories to entries
        entries.forEach((entry, index) => {
            entry.category = categories[index];
        });
    } catch (error) {
        console.error('AI categorization failed:', error);
        throw error;
    }
}

/**
 * Generate AI advice based on daily log
 * @param {Array} entries - Log entries
 * @param {string} apiKey - API key
 * @returns {Promise<string>} AI-generated advice in markdown format
 */
export async function generateAIAdvice(entries, apiKey) {
    const contextData = entries
        .map(entry => `${entry.start}-${entry.end} [${entry.category}] ${entry.content} (沈浸度:${entry.immersion})`)
        .join('\n');

    const prompt = `Act as an Energy Management Coach. Analyze this daily log and provide insights.

Your analysis should include:
1. **Energy Flow Observation**: Identify patterns in energy peaks and dips throughout the day
2. **Key Insights**: Note what activities led to high immersion (focus) levels
3. **Tomorrow's Strategy**: Provide 3 actionable lessons learned for improving tomorrow

Output in Traditional Chinese (繁體中文).
Use markdown formatting for better readability.

Daily Log:
${contextData}`;

    try {
        const responseText = await callGeminiApi(prompt, apiKey);
        return responseText;
    } catch (error) {
        console.error('AI advice generation failed:', error);
        throw error;
    }
}

/**
 * Categorize entries using keyword fallback (when AI is not available)
 * @param {Array} entries - Log entries to categorize
 */
export function categorizeWithKeywords(entries) {
    entries.forEach(entry => {
        entry.category = getCategoryByKeyword(entry.content, entry.start);
    });
}

/**
 * Get category based on keywords in content
 * @param {string} content - Entry content
 * @param {string} startTime - Start time (HH:MM)
 * @returns {string} Category name
 */
function getCategoryByKeyword(content, startTime) {
    const lowerContent = content.toLowerCase();
    const hour = parseInt(startTime.split(':')[0]);

    // Check for sleep/relaxation keywords
    if (lowerContent.match(/睡|sleep|nap|休息|放鬆/)) {
        return CATEGORIES.RELAX_BED;
    }

    // Check for work keywords
    if (lowerContent.match(/slide|工作|開會|meeting|會議/)) {
        return CATEGORIES.WORK;
    }

    // Check for development keywords
    if (lowerContent.match(/讀書|學習|study|learning|閱讀|開發/)) {
        return CATEGORIES.DEVELOPMENT;
    }

    // Check for family keywords
    if (lowerContent.match(/家人|父母|爸|媽|family/)) {
        return CATEGORIES.FAMILY;
    }

    // Time-based categorization
    if (hour >= 0 && hour < 7) {
        return CATEGORIES.RELAX_BED;
    }

    // Default
    return CATEGORIES.ROUTINE;
}
