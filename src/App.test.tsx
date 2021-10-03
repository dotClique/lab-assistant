import React from 'react';
import App from './App';
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthForm from "./components/AuthForm";

// Fix for "TypeError: window.matchMedia is not a function"
// ref: https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
})

it("matches snapshot", () => {
    expect(render(<App/>)).toMatchSnapshot();
});

it('uses orange theme by default', () => {
    render(<App/>)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('orange')
    expect(header).not.toHaveClass('blue')
})

it('changes theme on theme switch toggle', () => {
    render(<App/>)
    const header = screen.getByRole('banner')
    userEvent.click(within(header).getByRole('switch'))
    expect(header).toHaveClass('blue')
    expect(header).not.toHaveClass('orange')
    userEvent.click(within(header).getByRole('switch'))
    expect(header).toHaveClass('orange')
    expect(header).not.toHaveClass('blue')
})

it('allows typing in auth form', () => {
    render(<AuthForm/>)
    const projectId = "thisissomeprojectid"
    const projectIdInput = screen.getByLabelText("projectIdInput")
    userEvent.type(projectIdInput, projectId)
    expect(projectIdInput).toHaveValue(projectId)
    const accessToken = "thisissurelyavalidaccesstoken"
    const accessTokenInput = screen.getByLabelText("accessTokenInput")
    userEvent.type(accessTokenInput, accessToken)
    expect(accessTokenInput).toHaveValue(accessToken)
})