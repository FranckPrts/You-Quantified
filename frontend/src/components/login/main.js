import React, { useEffect, useState } from "react";
import {
  LOGIN_USER,
  END_SESSION,
  AUTH_USER,
  CHECK_REPEATED_USER,
  REGISTER_USER,
} from "../../queries/user";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { useContext } from "react";
import { UserContext } from "../../App";
import { useSearchParams, Navigate, Link } from "react-router-dom";
import { Nav } from "react-bootstrap";

export default function Login() {
  const { currentUser, setCurrentUser } = useContext(UserContext);

  if (currentUser) {
    return (
      <div className="login-div mt-5 align-text-center">
        <LoggedInScreen
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
        />
      </div>
    );
  }

  return <LoginScreen />;
}

export function LoggedInScreen({ currentUser, setCurrentUser }) {
  const [endSession, { data, loading }] = useMutation(END_SESSION, {
    update() {
      setCurrentUser(undefined);
    },
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const redirectVisual = searchParams.get("visual");

  if (redirectVisual) {
    return <Navigate to={`/visuals/${redirectVisual}`} />;
  }

  return (
    <div>
      <p>Logged in as {currentUser?.name}</p>
      <span>Not you? </span>
      <button
        className="btn btn-link link-primary m-0 p-0"
        onClick={endSession}
      >
        Sign out
      </button>
    </div>
  );
}

function LoginScreen() {
  const [loginFunction, { data, loading, error }] = useMutation(LOGIN_USER, {
    update(cache, { data }) {
      if (data?.authenticateUserWithPassword?.item) {
        setAuthSuccess(true);
        setCurrentUser(data?.authenticateUserWithPassword?.item);
      } else if (data?.authenticateUserWithPassword?.message) {
        setAuthSuccess(false);
      } else {
        setAuthSuccess(null);
      }
    },
  });

  const { setCurrentUser } = useContext(UserContext);


  let userInput;
  let passwordInput;

  const [authSuccess, setAuthSuccess] = useState(null);

  return (
    <div>
      <div className="login-div mt-5">
        <div className="d-flex mb-4 align-items-center justify-content-between">
          <h5 className="fw-bold m-0 p-0">Log in</h5>
          <Link to="/signup" className="btn btn-dark fw-medium">
            Sign up instead
          </Link>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loginFunction({
              variables: {
                email: userInput.value,
                password: passwordInput.value,
              },
            });
          }}
          className={
            authSuccess === false &&
            (!userInput || !passwordInput) &&
            "was-validated"
          }
        >
          <div className="mb-3">
            <label htmlFor="inputEmail">Email</label>
            <input
              type="email"
              className="form-control"
              id="inputEmail"
              ref={(node) => (userInput = node)}
            ></input>
          </div>
          <div className="mb-3">
            <label htmlFor="inputPassword">Password</label>
            <input
              type="password"
              className="form-control"
              id="inputPassword"
              ref={(node) => (passwordInput = node)}
            ></input>
          </div>
          <p className="text-primary">Forgot your password?</p>
          <button
            type="submit"
            className={`btn btn-primary ${loading && "disabled"}`}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
