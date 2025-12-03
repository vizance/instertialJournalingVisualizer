/**
 * UI Module
 * Handles all UI updates, interactions, and DOM manipulations
 */

import { MESSAGES, TIME, CATEGORY_ORDER } from './constants.js';

/**
 * UI Elements cache
 */
const elements = {
    // Buttons
    analyzeBtn: null,
    btnIcon: null,
    btnText: null,
    loader: null,

    // Messages
    statusMsg: null,
    apiKeyMsg: null,

    // Input
    logInput: null,
    apiKeyInput: null,

    // Results
    resultsArea: null,
    reportDate: null,

    // Analysis sections
    immersionAnalysisList: null,
    trendAnalysisList: null,
    aiLessonsContent: null,
    statsSummary: null,
    categoryDetailsList: null
};

/**
 * Initialize UI elements cache
 */
export function initializeUI() {
    elements.analyzeBtn = document.getElementById('analyzeBtn');
    elements.btnIcon = document.getElementById('btnIcon');
    elements.btnText = document.getElementById('btnText');
    elements.loader = document.getElementById('loader');
    elements.statusMsg = document.getElementById('statusMsg');
    elements.apiKeyMsg = document.getElementById('apiKeyMsg');
    elements.logInput = document.getElementById('logInput');
    elements.apiKeyInput = document.getElementById('apiKey');
    elements.resultsArea = document.getElementById('resultsArea');
    elements.reportDate = document.getElementById('reportDate');
    elements.immersionAnalysisList = document.getElementById('immersionAnalysisList');
    elements.trendAnalysisList = document.getElementById('trendAnalysisList');
    elements.aiLessonsContent = document.getElementById('aiLessonsContent');
    elements.statsSummary = document.getElementById('statsSummary');
    elements.categoryDetailsList = document.getElementById('categoryDetailsList');

    // Set initial report date
    if (elements.reportDate) {
        elements.reportDate.innerText = ` 分析日期：${new Date().toLocaleDateString('zh-TW')}`;
    }

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Set analyze button loading state
 * @param {boolean} isLoading - Loading state
 */
export function setAnalyzeButtonLoading(isLoading) {
    if (!elements.analyzeBtn) return;

    elements.analyzeBtn.disabled = isLoading;

    if (isLoading) {
        elements.loader?.classList.remove('hidden');
        elements.btnIcon?.classList.add('hidden');
        elements.btnText.innerText = '分析中 ...';
    } else {
        elements.loader?.classList.add('hidden');
        elements.btnIcon?.classList.remove('hidden');
        elements.btnText.innerText = '重新分析';

        // Refresh icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

/**
 * Show status message
 * @param {string} message - Message to display
 * @param {string} type - Message type: 'info', 'success', 'error'
 */
export function showStatusMessage(message, type = 'info') {
    if (!elements.statusMsg) return;

    elements.statusMsg.innerText = message;

    // Apply styling based on type
    elements.statusMsg.className = 'text-base font-bold';
    if (type === 'success') {
        elements.statusMsg.classList.add('text-emerald-600');
    } else if (type === 'error') {
        elements.statusMsg.classList.add('text-red-600');
    } else {
        elements.statusMsg.classList.add('text-slate-600');
    }
}

/**
 * Show API key save message
 * @param {boolean} success - Whether save was successful
 */
export function showApiKeySaveMessage(success) {
    if (!elements.apiKeyMsg) return;

    elements.apiKeyMsg.classList.remove('hidden');

    if (success) {
        elements.apiKeyMsg.textContent = MESSAGES.API_KEY_SAVED;
        elements.apiKeyMsg.className = 'message message-success';
    } else {
        elements.apiKeyMsg.textContent = MESSAGES.API_KEY_EMPTY;
        elements.apiKeyMsg.className = 'message message-error';
    }

    // Fade out after delay
    setTimeout(() => {
        elements.apiKeyMsg.classList.add('hidden');
    }, TIME.MESSAGE_FADE_DURATION);
}

/**
 * Show results area
 */
export function showResults() {
    elements.resultsArea?.classList.add('active');
}

/**
 * Get log input value
 * @returns {string} Log text
 */
export function getLogInput() {
    return elements.logInput?.value || '';
}

/**
 * Get API key input value
 * @returns {string} API key
 */
export function getApiKey() {
    return elements.apiKeyInput?.value.trim() || '';
}

/**
 * Set API key input value
 * @param {string} key - API key to set
 */
export function setApiKey(key) {
    if (elements.apiKeyInput) {
        elements.apiKeyInput.value = key;
    }
}

/**
 * Fill demo data into log input
 */
export function fillDemoData(demoText) {
    if (elements.logInput) {
        elements.logInput.value = demoText;
    }
}

/**
 * Render immersion analysis list
 * @param {Array} analysis - Analysis data
 */
export function renderImmersionAnalysis(analysis) {
    if (!elements.immersionAnalysisList) return;

    elements.immersionAnalysisList.innerHTML = '';

    if (!analysis || analysis.length === 0) {
        elements.immersionAnalysisList.innerHTML = `<li class="analysis-item analysis-item-secondary">${MESSAGES.NO_DATA}</li>`;
        return;
    }

    // Render top performer
    const top = analysis[0];
    elements.immersionAnalysisList.innerHTML = `
        <li class="analysis-item analysis-item-primary">
            <div style="display: flex; align-items: start; gap: var(--space-3);">
                <span style="font-size: var(--font-size-2xl);">🏆</span>
                <div>
                    <div style="font-size: var(--font-size-lg); font-weight: 800; color: var(--color-black);">${top.category}</div>
                    <div style="font-size: var(--font-size-sm); color: var(--color-gray-900); margin-top: var(--space-1); font-weight: 500;">
                        最佳表現：平均 <strong style="font-size: var(--font-size-lg); color: var(--color-black);">${top.averageImmersion}</strong> 分，共 ${Math.round(top.totalTime)} 分鐘
                    </div>
                </div>
            </div>
        </li>
    `;

    // Render other categories
    analysis.slice(1).forEach(item => {
        elements.immersionAnalysisList.innerHTML += `
            <li class="analysis-item analysis-item-secondary">
                <div>
                    <strong style="color: var(--color-black); font-size: var(--font-size-base);">${item.category}</strong>
                    <span style="color: var(--color-gray-600); font-size: var(--font-size-sm); margin-left: var(--space-2);">
                        平均 ${item.averageImmersion} 分（${Math.round(item.totalTime)} min）
                    </span>
                </div>
            </li>
        `;
    });
}

/**
 * Render trend analysis (energy transitions)
 * @param {Array} transitions - Transition points
 */
export function renderTrendAnalysis(transitions) {
    if (!elements.trendAnalysisList) return;

    elements.trendAnalysisList.innerHTML = '';

    if (!transitions || transitions.length === 0) {
        elements.trendAnalysisList.innerHTML = `
            <li class="analysis-item analysis-item-secondary">
                <span style="color: var(--color-gray-500); font-style: italic;">${MESSAGES.STABLE_ENERGY}</span>
            </li>
        `;
        return;
    }

    transitions.forEach(transition => {
        const transitionText = `
            <span style="color: rgba(255, 255, 255, 0.7); text-decoration: line-through; font-size: var(--font-size-sm); font-weight: 500;">
                ${transition.from.content} (${transition.from.immersion})
            </span>
            <span style="margin: 0 var(--space-2); color: var(--color-white); font-weight: 600;">→</span>
            <span style="font-weight: 700; color: var(--color-white); font-size: var(--font-size-base);">
                ${transition.to.content} (${transition.to.immersion})
            </span>
        `;

        const color = transition.type === 'increase' ? 'var(--color-success)' : 'var(--color-error)';
        const icon = transition.type === 'increase' ? 'trending-up' : 'trending-down';
        const label = transition.type === 'increase' ? '能量提升' : '投入下降';

        elements.trendAnalysisList.innerHTML += `
            <li class="analysis-item" style="background: ${color}; border-color: ${color}; color: var(--color-white);">
                <div style="font-weight: 700; font-size: var(--font-size-base); display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3); color: var(--color-white);">
                    <i data-lucide="${icon}" style="width: 18px; height: 18px;"></i>
                    ${transition.time} ${label}
                </div>
                <div style="font-size: var(--font-size-sm); padding-left: var(--space-6); line-height: 1.6;">
                    ${transitionText}
                </div>
            </li>
        `;
    });

    // Refresh icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Render AI lessons with loading state
 * @param {string|null} content - Markdown content or null for loading
 */
export function renderAILessons(content) {
    if (!elements.aiLessonsContent) return;

    if (content === null) {
        // Show loading state
        elements.aiLessonsContent.innerHTML = `
            <div class="flex items-center gap-2 text-violet-600 animate-pulse">
                <span class="loader w-4 h-4 border-2 border-violet-200 border-t-violet-600"></span>
                ${MESSAGES.AI_THINKING}
            </div>
        `;
    } else if (content === '') {
        // Show placeholder when no API key
        elements.aiLessonsContent.innerHTML = `
            <p class="text-slate-400 italic">請填寫 API Key 以啟用 AI 教練功能。</p>
        `;
    } else {
        // Render markdown content
        if (typeof marked !== 'undefined') {
            elements.aiLessonsContent.innerHTML = marked.parse(content);
        } else {
            elements.aiLessonsContent.innerHTML = content;
        }
    }
}

/**
 * Render statistics summary
 * @param {Object} categoryStats - Category statistics
 * @param {number} totalMinutes - Total minutes
 */
export function renderStats(categoryStats, totalMinutes) {
    if (!elements.statsSummary) return;

    const totalHours = (totalMinutes / TIME.MINUTES_PER_HOUR).toFixed(1);

    elements.statsSummary.innerHTML = `
        <div class="stat-badge" style="background: var(--color-black); color: var(--color-white);">
            總記錄：${totalHours}h
        </div>
    `;

    Object.entries(categoryStats).forEach(([category, minutes]) => {
        const hours = (minutes / TIME.MINUTES_PER_HOUR).toFixed(1);
        elements.statsSummary.innerHTML += `
            <div class="stat-badge">
                ${category}：${hours}h
            </div>
        `;
    });
}

/**
 * Render category kanban with drag and drop
 * @param {Object} groupedEntries - Entries grouped by category
 * @param {Function} onDrop - Callback when item is dropped
 */
export function renderCategoryKanban(groupedEntries, onDrop) {
    if (!elements.categoryDetailsList) return;

    elements.categoryDetailsList.innerHTML = '';

    CATEGORY_ORDER.forEach(category => {
        const card = createKanbanCard(category, groupedEntries[category] || [], onDrop);
        elements.categoryDetailsList.appendChild(card);
    });
}

/**
 * Create a kanban card for a category
 * @param {string} category - Category name
 * @param {Array} entries - Entries in this category
 * @param {Function} onDrop - Drop callback
 * @returns {HTMLElement} Card element
 */
function createKanbanCard(category, entries, onDrop) {
    const card = document.createElement('div');
    card.className = 'kanban-column drop-zone';

    // Drag and drop handlers
    card.ondragover = (e) => {
        e.preventDefault();
        card.classList.add('drag-over');
    };

    card.ondragleave = () => {
        card.classList.remove('drag-over');
    };

    card.ondrop = (e) => {
        e.preventDefault();
        card.classList.remove('drag-over');
        const entryId = e.dataTransfer.getData('text/plain');
        onDrop(entryId, category);
    };

    // Card header
    card.innerHTML = `
        <div class="kanban-header">
            <span>${category}</span>
            <span class="kanban-count">${entries.length}</span>
        </div>
    `;

    // Card items
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';

    if (entries.length === 0) {
        ul.innerHTML = `
            <li style="text-align: center; color: var(--color-gray-400); font-style: italic; padding: var(--space-8) var(--space-4); border: 2px dashed var(--color-gray-300); border-radius: var(--radius-md); font-size: var(--font-size-sm);">
                ${MESSAGES.DRAG_HERE}
            </li>
        `;
    } else {
        entries.forEach(entry => {
            const li = createKanbanItem(entry);
            ul.appendChild(li);
        });
    }

    card.appendChild(ul);
    return card;
}

/**
 * Create a draggable kanban item
 * @param {Object} entry - Log entry
 * @returns {HTMLElement} List item element
 */
function createKanbanItem(entry) {
    const li = document.createElement('li');
    li.className = 'kanban-item draggable-item';
    li.draggable = true;

    li.ondragstart = (e) => {
        e.dataTransfer.setData('text/plain', entry.id);
        setTimeout(() => li.style.opacity = '0.5', 0);
    };

    li.ondragend = () => {
        li.style.opacity = '1';
    };

    const immersionBadge = entry.immersion > 0
        ? `<span class="kanban-item-immersion">⚡ ${entry.immersion}</span>`
        : '';

    li.innerHTML = `
        <div class="kanban-item-time">${entry.start} ~ ${entry.end}</div>
        <div class="kanban-item-content">${entry.content}</div>
        ${immersionBadge}
    `;

    return li;
}

/**
 * Download screenshot of report
 */
export function downloadScreenshot() {
    const element = document.getElementById('printableReport');
    if (!element) return;

    if (typeof html2canvas === 'undefined') {
        alert(MESSAGES.SCREENSHOT_FAILED);
        return;
    }

    html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
    })
        .then(canvas => {
            const link = document.createElement('a');
            link.download = `daily_log_report_${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        })
        .catch(err => {
            console.error('Screenshot failed:', err);
            alert(MESSAGES.SCREENSHOT_FAILED);
        });
}

/**
 * Copy summary section (charts + analysis) to clipboard as image
 */
export async function copySummaryImage() {
    const element = document.getElementById('summarySectionToCopy');
    if (!element) {
        alert('找不到摘要區域');
        return;
    }

    if (typeof html2canvas === 'undefined') {
        alert('截圖功能未載入');
        return;
    }

    try {
        // Show loading state
        const originalText = document.querySelector('[onclick="copySummaryImage()"]')?.innerText;
        const button = document.querySelector('[onclick="copySummaryImage()"]');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> 處理中...';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }

        // Generate canvas
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
        });

        // Convert canvas to blob
        const blob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png');
        });

        // Copy to clipboard
        if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'image/png': blob
                })
            ]);

            // Success feedback
            if (button) {
                button.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> 已複製！';
                button.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
                button.classList.add('bg-green-600');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }

                setTimeout(() => {
                    button.disabled = false;
                    button.innerHTML = '<i data-lucide="copy" class="w-4 h-4"></i> 複製圖表摘要';
                    button.classList.remove('bg-green-600');
                    button.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }, 2000);
            }
        } else {
            throw new Error('瀏覽器不支援剪貼板 API');
        }

    } catch (error) {
        console.error('Copy failed:', error);
        alert('複製失敗：' + error.message);

        // Reset button
        const button = document.querySelector('[onclick="copySummaryImage()"]');
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i data-lucide="copy" class="w-4 h-4"></i> 複製圖表摘要';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }
}
