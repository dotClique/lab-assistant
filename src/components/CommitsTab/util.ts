import {ChartDataset, ChartOptions, ChartTypeRegistry} from "chart.js";
import moment from "moment";
import {Commit, DateStat} from "../../api/Commits";

export interface CommitsTabType {
    commits: Commit[],
    dates: string[],
    dateStats: DateStat[],
    // Latest date for the loaded commits
    minMoment: moment.Moment | null,
    // Most recent date for the loaded commits
    maxMoment: moment.Moment | null,
    // Selected from date (as moment)
    fromMoment: moment.Moment | null,
    // selected to date (as moment)
    toMoment: moment.Moment | null,
    // index of from date in dates (for faster lookup)
    fromIndex: number,
    // Index of to date in dates (for faster lookup)
    toIndex: number,
    // Commits within range (fromMoment, toMoment)
    filteredCommits: Commit[]
}

// Constants

export const chartOptions: ChartOptions = {
    maintainAspectRatio: false,
    scales: {
        y1: {
            title: {
                display: true,
                text: 'Commits per day',
                font: {
                    size: 18
                }
            }
        },
        y2: {
            position: 'right',
            title: {
                display: true,
                text: 'Additions',
                font: {
                    size: 18
                }
            }
        },
    },
    plugins: {
        title: {
            display: true,
            text: 'Commits over time',
            font: {
                size: 22
            },
            padding: {
                top: 10,
                bottom: 20
            }
        }
    }
};

export const initialState: CommitsTabType = {
    commits: [],
    dates: [],
    dateStats: [],
    minMoment: null,
    maxMoment: null,
    fromMoment: null,
    toMoment: null,
    fromIndex: 0,
    toIndex: 0,
    filteredCommits: []
}

// Helper functions

/**
 * Get the dates that are between two dates, inclusive.
 */
export function getDatesBetweenDates(startDate: Date, endDate: Date): Date[] {
    let dates: Date[] = []
    const theDate = new Date(startDate) // copy to not modify the original
    while (theDate < endDate && theDate.getDate() !== endDate.getDate()) {
        dates = [...dates, new Date(theDate)] // append new date
        theDate.setDate(theDate.getDate() + 1) // go to next date
    }
    dates = [...dates, endDate]
    return dates
}

/**
 * Filter commits on selected date range
 */
export function getFilteredCommits(fromMoment: moment.Moment, toMoment: moment.Moment, dates: string[], commits: Commit[]) {
    const fromIndex = dates.indexOf(fromMoment.toISOString().slice(0, 10))
    const toIndex = dates.indexOf(toMoment.toISOString().slice(0, 10))
    const filteredCommits: Commit[] = []
    for (const i of commits) {
        const dateIndex = dates.indexOf(i.created_at.slice(0, 10))
        if (dateIndex >= fromIndex && dateIndex <= toIndex) {
            filteredCommits.push(i)
        }
    }
    return {
        fromIndex: fromIndex,
        toIndex: toIndex,
        filteredCommits: filteredCommits,
    }
}

/**
 * Get chart datasets from stats
 */
export function getChartDatasets(dateStats: DateStat[], fromIndex: number, toIndex: number, theme: string)
    : ChartDataset<"line" | "bar", number[]>[] {
    return [
        {
            type: 'line',
            yAxisID: "y1",
            label: '# of commits',
            data: dateStats.slice(fromIndex, toIndex + 1).map(s => s.commits),
            fill: false,
            backgroundColor: theme === "orange" ? 'rgb(255, 85, 0)' : 'rgb(63, 140, 228)',
            borderColor: theme === "orange" ? 'rgb(255, 85, 0, 0.8)' : 'rgba(63, 140, 228, 0.8)'
        },
        {
            type: 'bar',
            yAxisID: "y2",
            label: 'additions',
            data: dateStats.slice(fromIndex, toIndex + 1).map(s => s.additions),
            backgroundColor: 'rgba(82,184,122,0.6)'
        },
        {
            type: 'bar',
            yAxisID: "y2",
            label: 'deletions',
            data: dateStats.slice(fromIndex, toIndex + 1).map(s => s.deletions),
            backgroundColor: 'rgba(236,89,65,0.6)'
        },
    ];
}

/**
 * Gather commits statistics
 */
export function getCommitStats(commits: Commit[]) {
    // Get all ISO date strings from date of first commit to current date
    const commitDates = commits.map(c => Date.parse(c.created_at.slice(0, 10)))
    const minDate = new Date(Math.min.apply(Math, commitDates))
    const maxDate = new Date(Math.max.apply(Math, commitDates))
    const activeDates: string[] = getDatesBetweenDates(minDate, maxDate).map(d => d.toISOString().slice(0, 10))
    // Count commits, additions and deletions per date
    const dateStats = Array.from(new Array(activeDates.length)).map(() => ({
        commits: 0,
        additions: 0,
        deletions: 0
    }));
    for (const i of commits) {
        const dateIndex = activeDates.indexOf(i.created_at.slice(0, 10))
        dateStats[dateIndex].commits += 1
        dateStats[dateIndex].additions += i.stats.additions
        dateStats[dateIndex].deletions -= i.stats.deletions
    }
    const minMoment = moment(minDate)
    const maxMoment = moment(maxDate)
    return {
        dates: activeDates, dateStats: dateStats,
        minMoment: minMoment, maxMoment: maxMoment,
        fromMoment: minMoment, toMoment: maxMoment
    };
}
