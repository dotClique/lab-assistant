IT2810 Project 2
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


# Documentation
## Api
We are using Axios, a promise based HTTP client, to send HTTP get requests to retrieve data from the API. To anynomize ourselves, we have implemented a solution so that the user is prompted to insert a project id and access token of their choice, which we use to configure the Axios requests. It is configured such that the header of an axiosConfig const contains the access token, and the base URL property is formatted to include the project id as an URI, in addition to the API version and Gitlab Instance URL. This is to ensure we ask for the correct data from a valid URL in the API. There are separate Axios GET requests for each of the types of information we choose to display from the repository. We have created and used interfaces with a structure like the expected object, to correctly retrieve the data available through the API.

## AJAX
As mentioned in the paragraph above, we are using Axios to make HTTP get requests. We did this because Axios simplifies AJAX requests, by for example automatically transforming JSON data, instead of having to call the .json() method on the object in Fetch. Overall, the use of AJAX through Axios has allowed us to create a fast and dynamic website.

## State
We have used the built in state hook in React, for preserving state between function calls. An example of where we have used this is to toggle the theme of the application (blue or orange), by setting the state of the theme to the opposite of what it was last. We also use state in an authentication context, to save the access token and project id. The useEffect() built into React has allowed us to update which commits, awards and issues show based on changes in the authentication context mentioned above. Lastly, we make us of the useContext() hook to handle the theme and get the correct authorization in for example the Header component.

## UI
We have several functional components in our code. They include the Header component, the Info component, the Page component and the Tab component. We have also included a class component, as specified by the task. The class component is the AuthForm component, that is the first thing you will see when the page is loaded. It asks you to input the project id and access token for the project you wish to view data from, and displays error messages if these inputs do not lead to a valid project or access token. It also has an info section that gives you some pointers on how to correctly input this data, and where to find the relevant information to input.

The component structure is such that after you have submitted all the values in the Authorization form you are first prompted with, the whole page will display. Here, we have chosen to include a header, displaying the project id that was inputted, a logo, that toggles the theme of the page if you click on it, and a section underneath the header containing the main content. The main content of the website is arranged into tabs, where each tab relates to some data that can be display from the repository in question. Above the tabs is a small, closable info bar that just tells you that you can click on the different tabs to view various data.

There are three tabs with repository data. The first one will display issues as Card components (from Ant Design), with the title of the issue in the header of the card, and some additional information about the issue in the content section of the card. The next tab shows you commits on the master branch of the repository. The commits are arranged in a List (also from Ant Design), with each item of the list showing the title of the commit that was made. The last tab shows awards used in the project. Awards are emojis that can be awarded to issues, merge requests, and anywhere you have a thread. It lets users react to content in a more dynamic way than just giving a thumbs up or down reaction. Therefore, we thought it would be a cool feature to show data from, because it can give a general idea of how the project is going, and how the participants of the repository are interacting with each other.

## HTML WebStorage
In the project we have used both LocalStorage and SessionStorage, as specified in the project description. We chose to store the theme preference in LocalStorage, because we want the theme chosen by the user for the page to persist across sessions. This means that the next time the user opens the website after having closed it, they will still have the theme they last set. As for SessionStorage, we use it to store the API credentials of the project, because you should be able to set new credentials each time you load the page (in case you want to view a different project).

## Responsive Web Design
- Media-queries
- Flexible/flowing layout

## Testing
- Jest
