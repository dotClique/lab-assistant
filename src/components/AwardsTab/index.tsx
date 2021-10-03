import React, {useContext, useEffect, useState} from "react";
import {Bar} from "react-chartjs-2";
import {Alert, Radio, RadioChangeEvent, Space, Spin, Timeline, Typography} from "antd";
import {LoadingOutlined} from '@ant-design/icons';
import {getAllAwards, NoteAwardPair} from "../../api/Awards";
import {AuthContext, AssetsContext, ThemeContext, AssetsContextType} from "../../App";
import './styles.css'
import {anonymize} from "../../api/Users";
import {Noteable} from "../../api/Notes";

const {Text} = Typography;

interface AwardsTabType {
    awards: NoteAwardPair[],
    activeAwards: NoteAwardPair[],
    awardStats: AwardStatType[],
    activeNotableFilter?: Noteable,
    loading: boolean,
}

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

    const [{awards, activeAwards, awardStats, activeNotableFilter, loading}, setState] = useState<AwardsTabType>({
        awards: [],
        activeAwards: [],
        awardStats: [],
        loading: true
    });

    const assets = useContext(AssetsContext);

    useEffect(() => {
        let isActive = true;
        getAllAwards(auth.accessToken, auth.projectId).then(awards => {
            // Don't update if the component has unmounted
            if (!isActive) return;
            setState(prev => ({...prev, awards: awards, loading: false}));
        })
        return () => {
            isActive = false;
        }
    }, [auth])

    useEffect(() => {
        // Apply active filter
        const activeAwards = activeNotableFilter == null ? awards : awards.filter(an => an.note.noteable_type === activeNotableFilter);
        // Count times used for each award used
        const awardsTally = activeAwards.reduce((acc, a) => acc.set(a.award.name, 1 + (acc.get(a.award.name) || 0)), new Map());
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
        activeAwards.sort((a: NoteAwardPair, b: NoteAwardPair) => Date.parse(b.award.created_at) - Date.parse(a.award.created_at))
        const topFiveAwardStats = stats.slice(0, 5)
        setState(prev => ({...prev, awardStats: topFiveAwardStats, activeAwards: activeAwards}))
    }, [awards, activeNotableFilter, assets.emoji]);

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

    const radioOptions = [
        {label: "All", value: ""},
        {label: "Merge requests", value: "MergeRequest"},
        {label: "Issues", value: "Issue"},
    ];

    const updateFilter = (e: RadioChangeEvent) => {
        setState(prev => ({
            ...prev,
            activeNotableFilter: e.target.value === "" ? null : e.target.value
        }));
    }

    const {theme} = useContext(ThemeContext)

    return (
        <>
            {loading ?
                <div className={"awards-loading-container"}>
                    <Spin indicator={<LoadingOutlined className={"awards-loading-spin " + theme} spin/>}/>
                    <p className={"awards-loading-text"}>Gathering awards 🏆 ...</p>
                </div>
                :
                <>
                    <div className={"tab-content"}>
                        <div className={"tab-parameters-content"}>
                            <Space direction="vertical" className="noteable-filter-container">
                                <Radio.Group onChange={updateFilter} size="large" options={radioOptions} defaultValue=""
                                             optionType="button" buttonStyle="solid"/>
                            </Space>
                        </div>
                        <div className={"tab-data-content"}>
                            {activeAwards.length < 1 ?
                                <Alert type="error"
                                       message={"No awards used " + (activeNotableFilter == null ? "" : "for active filter ") + "😢"}
                                       description={
                                           "Try reacting to a comment on an issue or merge request"
                                           + (activeNotableFilter == null ? "" : " or clearing the filter") + ", then refreshing."
                                       }/>
                                :
                                <>
                                    <div className={"tab-data-list " + theme}>
                                        <Timeline>
                                            {activeAwards.map(na =>
                                                <Timeline.Item className="comment-timeline-item" key={na.award.id}>
                                                    <UserName id={na.award.user.id} assets={assets}
                                                              theme={theme}/> reacted
                                                    with <Text
                                                    keyboard>{assets.emoji[na.award.name] ?? na.award.name}</Text> on
                                                    comment <Text className="comment-snippet"
                                                                  type={"secondary"}>{na.note.body}</Text> by <UserName
                                                    id={na.note.author.id} assets={assets} theme={theme}/>
                                                </Timeline.Item>
                                            )}
                                        </Timeline>
                                    </div>
                                    <div className={"tab-data-chart"}>
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
                    </div>
                </>
            }
        </>
    )
}
;
