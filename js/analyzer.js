/**
 * Analyzer Module
 * Handles data analysis and statistics calculation
 */

import { CATEGORIES, THRESHOLDS } from './constants.js';

/**
 * Calculate category statistics from entries
 * @param {Array} entries - Log entries
 * @returns {Object} Category statistics {categoryName: totalMinutes}
 */
export function calculateCategoryStats(entries) {
    const stats = {};

    entries.forEach(entry => {
        if (!stats[entry.category]) {
            stats[entry.category] = 0;
        }
        stats[entry.category] += entry.duration;
    });

    return stats;
}

/**
 * Calculate immersion distribution
 * @param {Array} entries - Log entries
 * @returns {Object} Distribution {1: minutes, 2: minutes, ..., 5: minutes}
 */
export function calculateImmersionDistribution(entries) {
    const distribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
    };

    entries.forEach(entry => {
        if (entry.immersion >= 1 && entry.immersion <= 5) {
            distribution[entry.immersion] += entry.duration;
        }
    });

    return distribution;
}

/**
 * Calculate total time in minutes
 * @param {Array} entries - Log entries
 * @returns {number} Total minutes
 */
export function calculateTotalTime(entries) {
    return entries.reduce((total, entry) => total + entry.duration, 0);
}

/**
 * Perform deep analysis on immersion levels by category
 * @param {Array} entries - Log entries
 * @returns {Array} Analysis results sorted by average immersion
 */
export function analyzeImmersionByCategory(entries) {
    const categoryStats = {};

    // Calculate stats for each category (excluding sleep/bed and zero immersion)
    entries.forEach(entry => {
        if (entry.category === CATEGORIES.RELAX_BED || entry.immersion === 0) {
            return;
        }

        if (!categoryStats[entry.category]) {
            categoryStats[entry.category] = {
                totalImmersion: 0,
                totalTime: 0
            };
        }

        categoryStats[entry.category].totalImmersion += entry.immersion * entry.duration;
        categoryStats[entry.category].totalTime += entry.duration;
    });

    // Calculate averages and format results
    const analysis = Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        averageImmersion: (stats.totalImmersion / stats.totalTime).toFixed(1),
        totalTime: stats.totalTime
    }));

    // Sort by average immersion (highest first)
    analysis.sort((a, b) => b.averageImmersion - a.averageImmersion);

    return analysis;
}

/**
 * Identify energy transition points (significant immersion changes)
 * @param {Array} entries - Log entries
 * @returns {Array} Transition points with details
 */
export function identifyEnergyTransitions(entries) {
    const transitions = [];

    // Filter out sleep/bed entries
    const activeEntries = entries.filter(
        entry => entry.category !== CATEGORIES.RELAX_BED
    );

    // Compare consecutive entries
    for (let i = 1; i < activeEntries.length; i++) {
        const previous = activeEntries[i - 1];
        const current = activeEntries[i];
        const difference = current.immersion - previous.immersion;

        // Check if change exceeds threshold
        if (Math.abs(difference) >= THRESHOLDS.ENERGY_CHANGE) {
            transitions.push({
                time: current.start,
                type: difference > 0 ? 'increase' : 'decrease',
                difference,
                from: {
                    content: previous.content,
                    immersion: previous.immersion
                },
                to: {
                    content: current.content,
                    immersion: current.immersion
                }
            });
        }
    }

    return transitions;
}

/**
 * Group entries by category
 * @param {Array} entries - Log entries
 * @returns {Object} Grouped entries {categoryName: [entries]}
 */
export function groupEntriesByCategory(entries) {
    const grouped = {};

    entries.forEach(entry => {
        if (!grouped[entry.category]) {
            grouped[entry.category] = [];
        }
        grouped[entry.category].push(entry);
    });

    return grouped;
}

/**
 * Calculate productivity score (0-100)
 * Based on high immersion time in productive categories
 * @param {Array} entries - Log entries
 * @returns {number} Productivity score
 */
export function calculateProductivityScore(entries) {
    const productiveCategories = [
        CATEGORIES.WORK,
        CATEGORIES.DEVELOPMENT
    ];

    let productiveHighImmersionTime = 0;
    let totalActiveTime = 0;

    entries.forEach(entry => {
        // Skip sleep/bed
        if (entry.category === CATEGORIES.RELAX_BED) {
            return;
        }

        totalActiveTime += entry.duration;

        // Count high immersion time in productive categories
        if (productiveCategories.includes(entry.category) && entry.immersion >= 4) {
            productiveHighImmersionTime += entry.duration;
        }
    });

    if (totalActiveTime === 0) {
        return 0;
    }

    return Math.round((productiveHighImmersionTime / totalActiveTime) * 100);
}

/**
 * Get summary statistics
 * @param {Array} entries - Log entries
 * @returns {Object} Summary statistics
 */
export function getSummaryStats(entries) {
    const totalTime = calculateTotalTime(entries);
    const categoryStats = calculateCategoryStats(entries);
    const immersionAnalysis = analyzeImmersionByCategory(entries);
    const transitions = identifyEnergyTransitions(entries);
    const productivityScore = calculateProductivityScore(entries);

    return {
        totalTime,
        categoryStats,
        immersionAnalysis,
        transitions,
        productivityScore,
        entryCount: entries.length
    };
}
