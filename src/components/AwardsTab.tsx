import React, {useContext, useEffect, useState} from "react";
import {Bar} from "react-chartjs-2";
import {Timeline, Typography} from "antd";
import {Award, getAwards} from "../api/Awards";
import {AuthContext, NamesContext, ThemeContext} from "../App";
import '../styles/Tab.css'
import '../styles/AwardsTab.css'
import {anonymize} from "../api/Users";

const {Text} = Typography;

interface AwardStatType {
    name: string,
    times_used : number
}

export default function AwardsTab() {

    const auth = useContext(AuthContext);

    const [{awards, awardStats}, setState] = useState<{awards: Award[], awardStats: AwardStatType[]}>({
        awards: [],
        awardStats: []
    });

    const names = useContext(NamesContext);

    useEffect(() => {
        getAwards(auth.accessToken, auth.projectId).then(awards => {
            // Count times used for each award used
            const awardsTally = awards.reduce((acc, a) => acc.set(a.name, 1 + (acc.get(a.name) || 0)), new Map());
            const stats: AwardStatType[] = []
            awardsTally.forEach((times_used: number, award_name: string) => {
                stats.push({
                    "name": award_name,
                    "times_used": times_used
                })
            })
            // Sort award stats by descending 'times used'
            stats.sort((a: AwardStatType, b: AwardStatType) => b.times_used - a.times_used)
            // Sort awards by ascending date
            awards.sort((a: Award, b: Award) => Date.parse(b.created_at) - Date.parse(a.created_at))
            const topFiveAwardStats = stats.slice(0,5)
            setState(prev => ({...prev, awards: awards, awardStats: topFiveAwardStats}));
        });
    }, [auth])

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
            <div className={"awards-list " + theme}>
                <Timeline>
                    {awards.map(a =>
                        <Timeline.Item key={a.id}>
                            <Text style={{color: theme === "orange" ? "#f50" : "#3F8CE4"}}>{anonymize(names, a.user.id)} </Text>
                            reacted with <Text keyboard>{a.name}</Text> on {a.awardable_type} {a.awardable_id}
                            <br/><Text type={"secondary"}>{a.created_at.slice(0,10)}</Text>
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
                                    }
                                }
                            },
                            plugins: {
                                legend: {
                                    display: false
                                },
                                title: {
                                    display: true,
                                    text: 'Top 5 most used awards',
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
        </div>
    )

};
