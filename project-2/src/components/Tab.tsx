import { Tabs } from 'antd';
import '../styles/Tab.css';


const { TabPane } = Tabs;

function Tab() {
    return (
        <div className="card-container">
            <Tabs type="card">
                <TabPane tab="Issues" key="1">
                    <p>Content of Tab Pane 1</p>
                    <p>Content of Tab Pane 1</p>
                    <p>Content of Tab Pane 1</p>
                    <p>rter</p>
                    <h2>hello</h2>
                </TabPane>
                <TabPane tab="Commits" key="2">
                    <p>Content of Tab Pane 2</p>
                    <p>Content of Tab Pane 2</p>
                    <p>Content of Tab Pane 2</p>
                </TabPane>
                <TabPane tab="Repository files" key="3">
                    <p>Content of Tab Pane 3</p>
                    <p>Content of Tab Pane 3</p>
                    <p>Content of Tab Pane 3</p>
                </TabPane>
            </Tabs>
        </div>
    )
}

export default Tab;