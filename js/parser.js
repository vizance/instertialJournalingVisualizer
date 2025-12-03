/**
 * Log Parser Module
 * Handles parsing of daily log entries from text format
 */

import { PATTERNS, CATEGORIES, TIME, THRESHOLDS } from './constants.js';

/**
 * Parse raw log text into structured entries
 * @param {string} rawText - Raw log text input
 * @returns {Object} Parsed data containing entries, thoughts, and actions
 */
export function parseLogText(rawText) {
    const lines = rawText.split('\n');
    const entries = [];
    const thoughts = [];
    const actions = [];

    lines.forEach((line, index) => {
        const cleanLine = line.trim();
        if (!cleanLine) return;

        // Check for thought pattern
        const thoughtMatch = cleanLine.match(PATTERNS.THOUGHT);
        if (thoughtMatch) {
            thoughts.push(thoughtMatch[1].trim());
            return;
        }

        // Check for action pattern
        const actionMatch = cleanLine.match(PATTERNS.ACTION);
        if (actionMatch) {
            actions.push(actionMatch[1].trim());
            return;
        }

        // Check for time header pattern
        const timeMatch = cleanLine.match(PATTERNS.TIME_HEADER);
        if (timeMatch) {
            const entry = parseTimeEntry(cleanLine, timeMatch, index);
            if (entry) {
                entries.push(entry);
            }
        }
    });

    return { entries, thoughts, actions };
}

/**
 * Parse a single time entry line
 * @param {string} line - Line text
 * @param {Array} timeMatch - Regex match result for time
 * @param {number} index - Line index
 * @returns {Object} Parsed entry object
 */
function parseTimeEntry(line, timeMatch, index) {
    const start = timeMatch[1];
    const end = timeMatch[2];
    const timePart = timeMatch[0];

    // Extract content after time
    let rest = line.substring(line.indexOf(timePart) + timePart.length);

    // Extract immersion bars
    const barsMatch = rest.match(PATTERNS.BARS);
    let immersion = 0;

    if (barsMatch) {
        console.log('Bars matched:', JSON.stringify(barsMatch[1]), 'Length:', barsMatch[1].length);
        immersion = calculateImmersionLevel(barsMatch[1]);
        console.log('Calculated immersion:', immersion);
        rest = rest.replace(barsMatch[0], '');
    } else {
        console.log('No bars matched in:', rest);
    }

    return {
        id: index + 1,
        start,
        end,
        content: rest.trim(),
        immersion,
        duration: calculateDuration(start, end),
        category: CATEGORIES.ROUTINE  // Default category
    };
}

/**
 * Calculate immersion level from bars string
 * @param {string} bars - String containing bars (❚ or |)
 * @returns {number} Immersion level (0-5+)
 */
function calculateImmersionLevel(bars) {
    // Count bar characters
    return bars.length;
}

/**
 * Calculate duration in minutes between two times
 * @param {string} start - Start time (HH:MM)
 * @param {string} end - End time (HH:MM)
 * @returns {number} Duration in minutes
 */
export function calculateDuration(start, end) {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    let minutes = (endHour * TIME.MINUTES_PER_HOUR + endMin) -
                  (startHour * TIME.MINUTES_PER_HOUR + startMin);

    // Handle overnight entries
    if (minutes < 0) {
        minutes += TIME.MINUTES_PER_DAY;
    }

    return minutes;
}

/**
 * Add sleep period if missing from start of day
 * @param {Array} entries - Array of log entries
 * @returns {Array} Entries with sleep period added if needed
 */
export function addSleepPeriodIfMissing(entries) {
    if (entries.length === 0) {
        return entries;
    }

    // Sort entries by start time
    entries.sort((a, b) => a.start.localeCompare(b.start));

    // Add sleep period if day doesn't start at 00:00
    if (entries[0].start !== "00:00") {
        const sleepEntry = {
            id: 0,
            start: "00:00",
            end: entries[0].start,
            content: "（自動補齊睡眠時段）",
            immersion: 0,
            duration: calculateDuration("00:00", entries[0].start),
            category: CATEGORIES.RELAX_BED
        };
        entries.unshift(sleepEntry);
    }

    return entries;
}

/**
 * Validate parsed entries
 * @param {Array} entries - Array of log entries
 * @throws {Error} If no valid entries found
 */
export function validateEntries(entries) {
    if (!entries || entries.length === 0) {
        throw new Error('未偵測到有效日誌');
    }
}

/**
 * Get entries excluding auto-generated ones (like sleep)
 * @param {Array} entries - All entries
 * @returns {Array} User-created entries only
 */
export function getUserEntries(entries) {
    return entries.filter(entry => entry.id !== 0);
}
