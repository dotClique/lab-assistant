import { Tabs } from 'antd';
import '../styles/Tab.css';


const { TabPane } = Tabs;

function Tab() {
    return (
        <div className="card-container">
            <Tabs type="card">
                <TabPane tab="Issues" key="1">
                    <p>Here you can see issues for the project</p>
                    <p>More content</p>
                    <p>More content</p>
                </TabPane>
                <TabPane tab="Commits" key="2">
                    <p>Here you can see commits for the project</p>
                    <p>More content</p>
                    <p>More content</p>
                </TabPane>
                <TabPane tab="Repository files" key="3">
                    <p>Here you can see the repository files in the project</p>
                    <p>More content</p>
                    <p>More content</p>
                </TabPane>
            </Tabs>
        </div>
    )
}

export default Tab;