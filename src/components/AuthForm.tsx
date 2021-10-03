import React from "react";
import {Alert, Button, Form, Input, Typography} from "antd";
import {AuthContext, AuthContextType} from "../App";
import {isAuthorized} from "../api/ApiBase";
import '../styles/AuthForm.css';

const {Paragraph, Text} = Typography;

// Define the types of the content of a TokenInputState, aka. form submission content
interface TokenInputState {
    inputAccessToken: string,
    inputProjectId: string,
    authFailed: boolean
}

// Class component that renders the authorization form in the application
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

    // Submit the input from the authorization form the user is first prompted with in the app
    // Based on the authorization-method in ApiBase.ts
    async submitInput(auth: AuthContextType, input: {projectId: string, accessToken: string}) {
        const projectId = input.projectId
        const accessToken = input.accessToken
        if (await isAuthorized(accessToken, projectId)) {
            this.setState({authFailed: false})
            auth.setAccessToken(accessToken)
            auth.setProjectId(projectId)
            auth.setAuthorized(true)
        } else {
            this.setState({authFailed: true})
        }
    }

    // If the form fails on submission, log the error in the console
    onFinishFailed(error: any) {
        console.log('Failed:', error);
    };

    render() {
        return (
            <AuthContext.Consumer>
                {auth => (
                    <>
                        <Alert className={"auth-form-info"} type="info" message="Welcome!"
                               description={
                                   <Text>
                                       <Paragraph>
                                           In order to display some cool insights into your project, we need valid
                                           credentials for accessing your GitLab project.
                                       </Paragraph>
                                       <Paragraph>
                                           Your project identification can either be the number displayed right under your project name on GitLab,
                                           or the project path visible in the URL (the part after <Text code>https://gitlab.stud.idi.ntnu.no/</Text>)
                                       </Paragraph>
                                       <Paragraph>
                                           An access token can be generated from GitLab at <Text code>Settings &gt; Access Tokens</Text>
                                       </Paragraph>
                                   </Text>
                               }
                               showIcon/>
                        <Form
                            onFinish={(input) => this.submitInput(auth, input)}
                            onFinishFailed={this.onFinishFailed}
                            layout={"vertical"}
                        >
                            <Form.Item
                                label="Project Identification"
                                name="projectId"
                                rules={[{required: true, message: 'Please input the project identification!'}]}
                            >
                                <Input placeholder={"e.g. '12345' or 'it2810-h21/team-321/project-2'"}/>
                            </Form.Item>

                            <Form.Item
                                label="Access Token"
                                name="accessToken"
                                rules={[{required: true, message: 'Please input your access token!'}]}
                            >
                                <Input.Password placeholder={"e.g. 'f3bba1Qw7MjrbvwxLGUn'"}/>
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
