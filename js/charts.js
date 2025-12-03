/**
 * Charts Module
 * Handles all chart rendering logic using Chart.js
 */

import {
    CHART_CONFIG,
    CATEGORY_COLORS,
    IMMERSION_COLORS,
    THRESHOLDS,
    CATEGORIES
} from './constants.js';

// Store chart instances for cleanup
let chartInstances = {
    immersion: null,
    immersionDist: null,
    category: null
};

/**
 * Initialize Chart.js defaults
 */
export function initializeChartDefaults() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
    }

    Chart.defaults.font.family = CHART_CONFIG.FONT_FAMILY;
    Chart.defaults.color = CHART_CONFIG.DEFAULT_COLOR;
    Chart.defaults.animation = CHART_CONFIG.ANIMATION;
}

/**
 * Destroy a chart instance if it exists
 * @param {string} chartName - Name of the chart instance
 */
function destroyChart(chartName) {
    if (chartInstances[chartName]) {
        chartInstances[chartName].destroy();
        chartInstances[chartName] = null;
    }
}

/**
 * Render immersion trend line chart
 * @param {Array} entries - Log entries
 */
export function renderImmersionChart(entries) {
    const canvas = document.getElementById('immersionChart');
    if (!canvas) {
        console.error('Canvas element "immersionChart" not found');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Filter active entries (exclude sleep/bed with no immersion)
    const activeEntries = entries.filter(
        entry => entry.category !== CATEGORIES.RELAX_BED && entry.immersion > 0
    );

    console.log('Rendering immersion chart with', activeEntries.length, 'entries');

    destroyChart('immersion');

    chartInstances.immersion = new Chart(ctx, {
        type: 'line',
        data: {
            labels: activeEntries.map(entry => entry.start),
            datasets: [{
                label: '沉浸度',
                data: activeEntries.map(entry => entry.immersion),
                borderColor: '#059669',
                backgroundColor: 'rgba(5,150,105,0.1)',
                borderWidth: CHART_CONFIG.LINE.BORDER_WIDTH,
                pointRadius: CHART_CONFIG.LINE.POINT_RADIUS,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: CHART_CONFIG.LINE.MIN_Y,
                    max: CHART_CONFIG.LINE.MAX_Y,
                    ticks: {
                        font: {
                            size: CHART_CONFIG.LABEL.FONT_SIZE,
                            weight: CHART_CONFIG.LABEL.FONT_WEIGHT
                        },
                        color: '#475569'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: CHART_CONFIG.LABEL.FONT_SIZE,
                            weight: CHART_CONFIG.LABEL.FONT_WEIGHT
                        },
                        color: '#475569'
                    }
                }
            },
            plugins: {
                datalabels: {
                    display: false
                },
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            const index = context[0].dataIndex;
                            const entry = activeEntries[index];
                            return `${entry.start} - ${entry.end}`;
                        },
                        label: function(context) {
                            const index = context.dataIndex;
                            const entry = activeEntries[index];
                            return [
                                `沉浸度: ${entry.immersion} 分`,
                                `類別: ${entry.category}`,
                                ``,
                                `${entry.content}`
                            ];
                        }
                    }
                }
            }
        }
    });
}

/**
 * Render immersion distribution pie chart
 * @param {Object} distribution - Immersion level distribution {5: minutes, 4: minutes, ...}
 */
export function renderImmersionDistChart(distribution) {
    const canvas = document.getElementById('immersionDistChart');
    if (!canvas) {
        console.error('Canvas element "immersionDistChart" not found');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Data array from level 5 to 1
    const dataArray = [
        distribution[5] || 0,
        distribution[4] || 0,
        distribution[3] || 0,
        distribution[2] || 0,
        distribution[1] || 0
    ];

    console.log('Rendering immersion distribution chart:', dataArray);

    destroyChart('immersionDist');

    // Check if all data is zero
    if (dataArray.every(value => value === 0)) {
        renderEmptyPieChart(ctx, 'immersionDist');
        return;
    }

    chartInstances.immersionDist = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['5 分', '4 分', '3 分', '2 分', '1 分'],
            datasets: [{
                data: dataArray,
                backgroundColor: [
                    IMMERSION_COLORS[5],
                    IMMERSION_COLORS[4],
                    IMMERSION_COLORS[3],
                    IMMERSION_COLORS[2],
                    IMMERSION_COLORS[1]
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: CHART_CONFIG.LABEL.FONT_SIZE,
                            weight: CHART_CONFIG.LABEL.FONT_WEIGHT
                        },
                        padding: 20
                    }
                },
                datalabels: {
                    color: (context) => {
                        // White text for darker colors (5, 4, 3), dark text for lighter colors
                        return context.dataIndex <= 2 ? '#fff' : '#334155';
                    },
                    font: {
                        weight: CHART_CONFIG.LABEL.FONT_WEIGHT_HEAVY,
                        size: 12  // 減小字體大小（原本是 16）
                    },
                    formatter: (value, context) => {
                        const sum = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        if (value === 0) return null;

                        const label = context.chart.data.labels[context.dataIndex];
                        const percentage = ((value * 100) / sum).toFixed(1);
                        return `${label}\n${percentage}%`;
                    }
                }
            }
        }
    });
}

/**
 * Render category distribution doughnut chart
 * @param {Object} categories - Category distribution {Work: minutes, Routine: minutes, ...}
 */
export function renderCategoryChart(categories) {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const labels = Object.keys(categories);
    const data = Object.values(categories);

    destroyChart('category');

    const backgroundColors = labels.map(
        label => CATEGORY_COLORS[label] || '#cbd5e1'
    );

    chartInstances.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: backgroundColors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 15,
                            weight: CHART_CONFIG.LABEL.FONT_WEIGHT
                        },
                        padding: 30
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold',  // 減輕字重
                        size: 11  // 減小字體大小（原本是 16）
                    },
                    formatter: (value, context) => {
                        const sum = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = (value * 100) / sum;

                        // Hide label if percentage is too small
                        if (percentage < THRESHOLDS.MIN_PERCENTAGE_SHOW) {
                            return null;
                        }

                        const label = context.chart.data.labels[context.dataIndex];
                        return `${label}\n${percentage.toFixed(1)}%`;
                    }
                }
            }
        }
    });
}

/**
 * Render empty placeholder chart when no data available
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} chartName - Chart instance name
 */
function renderEmptyPieChart(ctx, chartName) {
    chartInstances[chartName] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['無有效沉浸數據'],
            datasets: [{
                data: [1],
                backgroundColor: ['#e2e8f0']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    enabled: false
                },
                legend: {
                    display: false
                },
                datalabels: {
                    display: true,
                    color: '#94a3b8',
                    font: {
                        size: CHART_CONFIG.LABEL.FONT_SIZE
                    },
                    formatter: () => '暫無 1-5 分數據'
                }
            }
        }
    });
}

/**
 * Destroy all chart instances (cleanup)
 */
export function destroyAllCharts() {
    Object.keys(chartInstances).forEach(chartName => {
        destroyChart(chartName);
    });
}
