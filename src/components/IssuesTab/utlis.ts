export const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function getRadarOptions(issueStateFilter: "opened" | "closed" | undefined) {
    return {
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: (issueStateFilter == null ? "I" : issueStateFilter === "opened" ? "Open i" : "Closed i") + 'ssues per weekday',
                font: {
                    size: 18
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            }
        }
    };
}