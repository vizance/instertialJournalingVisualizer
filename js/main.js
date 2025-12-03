/**
 * Main Application Module
 * Orchestrates all modules and handles application flow
 */

import { DEMO_DATA, MESSAGES } from './constants.js';
import {
    parseLogText,
    addSleepPeriodIfMissing,
    validateEntries,
    getUserEntries
} from './parser.js';
import {
    ApiKeyManager,
    categorizeWithAI,
    categorizeWithKeywords,
    generateAIAdvice
} from './api.js';
import {
    initializeChartDefaults,
    renderImmersionChart,
    renderImmersionDistChart,
    renderCategoryChart
} from './charts.js';
import {
    calculateCategoryStats,
    calculateImmersionDistribution,
    calculateTotalTime,
    analyzeImmersionByCategory,
    identifyEnergyTransitions,
    groupEntriesByCategory
} from './analyzer.js';
import {
    initializeUI,
    setAnalyzeButtonLoading,
    showStatusMessage,
    showApiKeySaveMessage,
    showResults,
    getLogInput,
    getApiKey,
    setApiKey,
    fillDemoData,
    renderImmersionAnalysis,
    renderTrendAnalysis,
    renderAILessons,
    renderStats,
    renderCategoryKanban,
    downloadScreenshot,
    copySummaryImage
} from './ui.js';

/**
 * Application state
 */
class AppState {
    constructor() {
        this.entries = [];
        this.thoughts = [];
        this.actions = [];
    }

    reset() {
        this.entries = [];
        this.thoughts = [];
        this.actions = [];
    }

    setData(entries, thoughts, actions) {
        this.entries = entries;
        this.thoughts = thoughts;
        this.actions = actions;
    }

    getEntries() {
        return this.entries;
    }
}

// Global app state
const appState = new AppState();

/**
 * Initialize application
 */
function initialize() {
    // Wait for all CDN libraries to load
    const checkLibraries = () => {
        if (typeof Chart === 'undefined' ||
            typeof ChartDataLabels === 'undefined' ||
            typeof lucide === 'undefined' ||
            typeof marked === 'undefined') {
            console.log('Waiting for libraries to load...');
            setTimeout(checkLibraries, 50);
            return;
        }

        // Register Chart.js DataLabels plugin
        Chart.register(ChartDataLabels);

        initializeUI();
        initializeChartDefaults();

        // Load saved API key
        const savedKey = ApiKeyManager.load();
        if (savedKey) {
            setApiKey(savedKey);
        }
    };

    checkLibraries();
}

/**
 * Save API key
 */
function handleSaveApiKey() {
    const key = getApiKey();

    if (key) {
        const success = ApiKeyManager.save(key);
        showApiKeySaveMessage(success);
    } else {
        showApiKeySaveMessage(false);
    }
}

/**
 * Clear API key
 */
function handleClearApiKey() {
    ApiKeyManager.clear();
    setApiKey('');
}

/**
 * Fill demo data
 */
function handleFillDemoData() {
    fillDemoData(DEMO_DATA);
}

/**
 * Analyze log - main processing function
 */
async function handleAnalyzeLog() {
    setAnalyzeButtonLoading(true);
    showStatusMessage('');

    try {
        // Reset state
        appState.reset();

        // Parse log text
        const rawText = getLogInput();
        const { entries, thoughts, actions } = parseLogText(rawText);

        // Validate
        validateEntries(entries);

        // Add sleep period if missing
        addSleepPeriodIfMissing(entries);

        // Store in state
        appState.setData(entries, thoughts, actions);

        // Debug: Log parsed entries
        console.log('Parsed entries:', entries);
        entries.forEach((entry, i) => {
            console.log(`Entry ${i}:`, {
                time: `${entry.start}-${entry.end}`,
                content: entry.content,
                immersion: entry.immersion,
                category: entry.category
            });
        });

        // Categorize entries
        const apiKey = getApiKey();
        const userEntries = getUserEntries(entries);

        if (apiKey && userEntries.length > 0) {
            // Use AI categorization
            showStatusMessage(MESSAGES.ANALYZING);

            try {
                await categorizeWithAI(userEntries, apiKey);
                showStatusMessage(MESSAGES.COMPLETE, 'success');
            } catch (error) {
                console.error('AI categorization failed, falling back to keywords:', error);
                categorizeWithKeywords(userEntries);
                showStatusMessage(MESSAGES.KEYWORD_MODE, 'info');
            }

            // Generate AI advice asynchronously
            generateAIAdviceAsync(entries, apiKey);
        } else {
            // Use keyword categorization
            categorizeWithKeywords(userEntries);
            showStatusMessage(MESSAGES.KEYWORD_MODE, 'info');
            renderAILessons('');
        }

        // Update dashboard
        updateDashboard();

        // Show results
        showResults();

    } catch (error) {
        console.error('Analysis error:', error);
        alert('分析失敗: ' + error.message);
        showStatusMessage('分析失敗', 'error');
    } finally {
        setAnalyzeButtonLoading(false);
    }
}

/**
 * Generate AI advice asynchronously (non-blocking)
 */
async function generateAIAdviceAsync(entries, apiKey) {
    renderAILessons(null); // Show loading state

    try {
        const advice = await generateAIAdvice(entries, apiKey);
        renderAILessons(advice);
    } catch (error) {
        console.error('AI advice generation failed:', error);
        renderAILessons('<p class="text-red-500">AI 連線失敗</p>');
    }
}

/**
 * Update dashboard with all visualizations and analysis
 */
function updateDashboard() {
    const entries = appState.getEntries();
    console.log('Updating dashboard with', entries.length, 'entries');

    // Calculate statistics
    const categoryStats = calculateCategoryStats(entries);
    const immersionDist = calculateImmersionDistribution(entries);
    const totalTime = calculateTotalTime(entries);
    const immersionAnalysis = analyzeImmersionByCategory(entries);
    const transitions = identifyEnergyTransitions(entries);
    const groupedEntries = groupEntriesByCategory(entries);

    console.log('Category stats:', categoryStats);
    console.log('Immersion distribution:', immersionDist);

    // Render charts
    try {
        renderImmersionChart(entries);
        renderImmersionDistChart(immersionDist);
        renderCategoryChart(categoryStats);
        console.log('Charts rendered successfully');
    } catch (error) {
        console.error('Error rendering charts:', error);
    }

    // Render analysis
    renderImmersionAnalysis(immersionAnalysis);
    renderTrendAnalysis(transitions);

    // Render stats
    renderStats(categoryStats, totalTime);

    // Render kanban
    renderCategoryKanban(groupedEntries, handleKanbanDrop);
}

/**
 * Handle kanban item drop
 * @param {string|number} entryId - Entry ID
 * @param {string} newCategory - New category
 */
function handleKanbanDrop(entryId, newCategory) {
    const entries = appState.getEntries();
    const entry = entries.find(e => e.id == entryId);

    if (entry && entry.category !== newCategory) {
        entry.category = newCategory;
        updateDashboard();
    }
}

/**
 * Handle screenshot download
 */
function handleDownloadScreenshot() {
    downloadScreenshot();
}

/**
 * Expose functions to global scope for HTML onclick handlers
 */
window.saveApiKey = handleSaveApiKey;
window.clearApiKey = handleClearApiKey;
window.fillDemoData = handleFillDemoData;
window.analyzeLog = handleAnalyzeLog;
window.downloadScreenshot = handleDownloadScreenshot;
window.copySummaryImage = copySummaryImage;

/**
 * Initialize on DOM ready
 */
document.addEventListener('DOMContentLoaded', initialize);
