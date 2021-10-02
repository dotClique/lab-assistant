import React, {useContext, useEffect, useState} from "react";
import {Bar} from "react-chartjs-2";
import {Alert, Timeline, Typography} from "antd";
import {getAllAwards, NoteAwardPair} from "../api/Awards";
import {AuthContext, AssetsContext, ThemeContext, AssetsContextType} from "../App";
import '../styles/Tab.css'
import '../styles/AwardsTab.css'
import {anonymize} from "../api/Users";

const {Text} = Typography;

interface AwardStatType {
    name: string,
    times_used: number
}

function UserName({id, theme, assets}: { id: number, theme: string, assets: AssetsContextType }): React.ReactElement {
    return <Text style={{color: theme === "orange" ? "rgb(255, 85, 0)" : "rgb(63, 140, 228)"}}>
        {anonymize(assets.names, id)}
    </Text>;
}

export default function AwardsTab(): React.ReactElement {

    const auth = useContext(AuthContext);

    const [{awards, awardStats}, setState] = useState<{ awards: NoteAwardPair[], awardStats: AwardStatType[] }>({
        awards: [],
        awardStats: []
    });

    const assets = useContext(AssetsContext);

    useEffect(() => {
        getAllAwards(auth.accessToken, auth.projectId).then(awards => {
            // Count times used for each award used
            const awardsTally = awards.reduce((acc, a) => acc.set(a.award.name, 1 + (acc.get(a.award.name) || 0)), new Map());
            const stats: AwardStatType[] = []
            awardsTally.forEach((times_used: number, award_name: string) => {
                stats.push({
                    "name": assets.emoji[award_name] ?? award_name,
                    "times_used": times_used
                })
            })
            // Sort award stats by descending 'times used'
            stats.sort((a: AwardStatType, b: AwardStatType) => b.times_used - a.times_used)
            // Sort awards by ascending date
            awards.sort((a: NoteAwardPair, b: NoteAwardPair) => Date.parse(b.award.created_at) - Date.parse(a.award.created_at))
            const topFiveAwardStats = stats.slice(0, 5)
            setState(prev => ({...prev, awards: awards, awardStats: topFiveAwardStats}));
        }).catch(() => auth.setAuthenticated(false))
    }, [auth, assets.emoji])

    const data = {
        labels: awardStats.map(s => s.name),
        datasets: [
            {
                data: awardStats.map(s => s.times_used),
                backgroundColor: [
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 159, 64, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const {theme} = useContext(ThemeContext)

    return (
        <div className={"tab-content"}>
            {awards.length < 1 ?
                <Alert type="error"
                       message="No awards used 😢"
                       description="Try reacting to a comment on an issue or merge request, then refreshing."/> :
                <>
                    <div className={"awards-list " + theme}>
                        <Timeline>
                            {awards.map(na =>
                                <Timeline.Item className="comment-timeline-item" key={na.award.id}>
                                    <UserName id={na.award.user.id} assets={assets} theme={theme}/>
                                    reacted with <Text keyboard>{assets.emoji[na.award.name] ?? na.award.name}</Text> on
                                    comment <Text className="comment-snippet"
                                                  type={"secondary"}>{na.note.body}</Text> by <UserName
                                    id={na.note.author.id} assets={assets} theme={theme}/>
                                </Timeline.Item>
                            )}
                        </Timeline>
                    </div>
                    <div className={"chart-container"}>
                        <Bar
                            data={data}
                            options={
                                {
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            ticks: {
                                                stepSize: 1
                                            },
                                        },
                                        x: {
                                            ticks: {
                                                font: {
                                                    size: 40
                                                }
                                            }
                                        }
                                    },
                                    plugins: {
                                        legend: {
                                            display: false
                                        },
                                        title: {
                                            display: true,
                                            text: 'Top 5 most used comment awards',
                                            font: {
                                                size: 18
                                            },
                                            padding: {
                                                top: 10,
                                                bottom: 20
                                            }
                                        }
                                    }
                                }
                            }
                        />
                    </div>
                </>
            }
        </div>
    )
};
