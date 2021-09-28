import React from "react";
import {Alert, Button, Form, Input} from "antd";
import {AuthContext, AuthContextType} from "../App";
import {isAuthorized} from "../api/ApiBase";
import '../styles/AuthForm.css';

interface TokenInputState {
    inputAccessToken: string,
    inputProjectId: string,
    authFailed: boolean
}

export default class AuthForm extends React.Component<{}, TokenInputState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            inputAccessToken: "",
            inputProjectId: "",
            authFailed: false
        }
        this.submitInput = this.submitInput.bind(this);
        this.onFinishFailed = this.onFinishFailed.bind(this);
    }

    async submitInput(auth: AuthContextType, input: {projectId: string, accessToken: string}) {
        if (await isAuthorized(input.accessToken, input.projectId)) {
            this.setState({authFailed: false})
            auth.setAccessToken(input.accessToken)
            auth.setProjectId(input.projectId)
            auth.setAuthenticated(true)
        }else{
            this.setState({authFailed: true})
        }
    }

    onFinishFailed(error: any) {
        console.log('Failed:', error);
    };

    render() {

        return (
            <AuthContext.Consumer>
                {auth => (
                    <>
                        <Form
                            onFinish={(input) => this.submitInput(auth, input)}
                            onFinishFailed={this.onFinishFailed}
                            layout={"vertical"}
                        >
                            <Form.Item
                                label="Project ID"
                                name="projectId"
                                rules={[{ required: true, message: 'Please input the project ID!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                label="Access Token"
                                name="accessToken"
                                rules={[{ required: true, message: 'Please input your access token!' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Submit
                                </Button>
                            </Form.Item>
                        </Form>
                        {this.state.authFailed && (
                            <Alert
                                message="Authentication failed"
                                description="The project does not exist, or you are not authorized to access it :("
                                type="warning"
                            />
                        )
                        }
                    </>
                )
                }
            </AuthContext.Consumer>
        )
    }
}