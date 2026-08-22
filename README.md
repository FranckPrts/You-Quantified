# YouQuantified

This project brings tools to easily visualize, record, and work with physiological data in a web-based environment. It's meant as a learning tool to help us understand the _Quantified Self_ (self-knowledge through numbers). You can visit the website at [youquantified.com](https://youquantified.com).

## Local Development

If you want to contribute to development or run the app locally, follow the steps below to get each module of the app running.

---

### Frontend

The frontend was built using [create-react-app](https://react.dev/learn/creating-a-react-app). Navigate to the frontend folder in your terminal before proceeding (`cd frontend`).

#### Environment Variables

Before running the frontend, you must create and configure a `.env` file to connect it to the various backend endpoints.

All environment variables are prefixed with `REACT_APP` due to the framework being used. Your `.env` file should look something like this:

```
REACT_APP_CORTEX_CLIENT_ID = [EMOTIV CORTEX Client ID]
REACT_APP_CORTEX_CLIENT_SECRET = [EMOTIV CORTEX Client Secret]
REACT_APP_CORTEX_LICENSE = "" [Can be left empty]
REACT_APP_UPLOAD_URI_ENDPOINT_DEV = "http://localhost:4444/api/graphql"
REACT_APP_UPLOAD_URI_ENDPOINT = [Use the web address from production, e.g. https://backend.production.com/api/graphql]
REACT_APP_COLLAB_ENDPOINT_DEV = "ws://localhost:4445/collaboration"
REACT_APP_COLLAB_ENDPOINT = [Use the web address from production, e.g. https://backend.production.com/collaboration]
GENERATE_SOURCEMAP = false
```

#### Installing Packages

For this step, you must have Node.js installed on your machine. Any modern version should work for the frontend. However, to ensure backend compatibility, we recommend v23 or an earlier version with LTS support. We suggest installing and managing your Node versions with [nvm](https://github.com/nvm-sh/nvm).

Once you've set up Node.js, install the packages with:

```
npm install
```

Feel free to flag any dependency conflicts on the issues page of this GitHub. You shouldn't need to use the `--legacy-peer-deps` flag or follow other special installation steps. Some packages may show warnings — this is currently expected behavior.

#### Running the Frontend

Once packages are installed, start the project in development mode with:

```
npm start
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

The page will reload when you make changes. You may also see lint errors in the console.

To build and run a production version:

```
npm run build
npm install -g serve
serve -s build
```

---

### Backend

The backend was built using [KeystoneJS](https://keystonejs.com). This app shares a backend with the main [MindHive project repository](https://github.com/mindhiveproject/mindhive). Clone that repository and follow the steps there to install and run the backend. A summary of the steps is also provided here.

#### Environment Variables

Before compiling or running, you must configure a `.env` file to provide the necessary tokens. The file should have the following structure:

```
NODE_ENV = 'development'
PORT = 4444
COLLAB_PORT = 4445
FRONTEND_URL_DEV = "http://localhost:3000"
FRONTEND_URL = [Frontend URL in production, e.g. https://frontend_url.com]
FRONTEND_URL_DEV_YQ = "http://localhost:5173"
FRONTEND_URL_YQ = [Frontend URL in production, e.g. https://frontend_url.com]
ASSET_BASE_URL_DEV = "http://localhost:4444"
ASSET_BASE_URL = [Backend production address, e.g. https://backend.production.com]
SESSION_SECRET = [32-character secret key for encrypting cookie data]
MAIL_TOKEN = [Token for a mailing service, used to retrieve forgotten passwords]
DATABASE_URL = file:./keystone.db
POSTGRES_URL = [Optional. Production database URL]
```

#### Installing Packages

Navigate to the backend folder by first going into the MindHive project, then into its `keystone` folder. Ensure you're using Node v23 or earlier. Install the packages with:

```
npm install
```

#### Running the Backend

Run the backend with:

```
npm run dev
```

Open [http://localhost:4444](http://localhost:4444) to view Keystone's UI and set up an admin account.

#### Running the Collaboration Server

You will also need to start the collaboration WebSocket server in a separate process:

```
node collab-server.js
```

---

### AI Agent

The frontend currently includes a `./genAI` folder. There is an agent for creating visuals in the platform that was built with [LangGraph](https://www.langchain.com/langgraph). This feature is deprecated and support or functionality is not guaranteed. However, you can still access it through the frontend. If you want to try running it, follow the instructions in the folder as an additional process.

---

### Documentation

A [documentation site](https://creative-quantified-self.gitbook.io/docs/) covers the basics:

- How to use and connect devices
- How to add and edit p5.js visualizations
- A guide on interpreting EEG signal metrics

It also includes advanced information to help developers contribute new components that interact seamlessly with the data streaming from connected devices.

---

## Authorship

This app was created at NYU as part of a research project.