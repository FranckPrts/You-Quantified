import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/js/bootstrap.bundle.min";
import App from "./App";
import "./index.scss";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";

const uriEndpoint =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_UPLOAD_URI_ENDPOINT_DEV
    : process.env.REACT_APP_UPLOAD_URI_ENDPOINT;

const link = new UploadHttpLink({
  uri: uriEndpoint, // Add a fix in the production using env variables
  credentials: "include",
  headers: {
    "Apollo-Require-Preflight": "true",
  },
});

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

import { Provider } from "react-redux";
import store from "./store/store";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </ApolloProvider>
);
