import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import { useFullScreenHandle } from "react-full-screen";
import { VisTopBar } from "./top_bar";
import { VisualScreen } from "./visual_screen";
import { UserContext } from "../../../App";
import { useDispatch } from "react-redux";
import { useMutation } from "@apollo/client";
import { CHANGE_VISUAL } from "../../../queries/visuals";
import {
  HocuspocusProviderWebsocketComponent,
  HocuspocusRoom,
  useHocuspocusProvider,
} from "@hocuspocus/provider-react";

const collabEndpoint =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_COLLAB_ENDPOINT_DEV || "ws://localhost:3001/collab"
    : process.env.REACT_APP_COLLAB_ENDPOINT;

function userColor(id) {
  let hash = 0;
  for (const char of String(id)) {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  }
  const r = (hash >> 16) & 0xff;
  const g = (hash >> 8) & 0xff;
  const b = hash & 0xff;
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

export function SetAwarenessUser({ user, currentView }) {
  const provider = useHocuspocusProvider();

  useEffect(() => {
    if (!user) return;
    provider.setAwarenessField("user", {
      ...user,
      currentView,
    });
  }, [user, currentView, provider]);

  return null;
}

export default function MainView({ visID, queryData }) {
  // This function bridges the left pane (code editor/parameters) with the visualization

  const { currentUser } = useContext(UserContext);
  const [currentScreen, setCurrentScreen] = useState({
    left: queryData?.docsVisible ? "docs" : "dashboard",
  });
  const [popupVisuals, setPopupVisuals] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const fullScreenHandle = useFullScreenHandle();

  const isEditable =
    queryData?.author?.id === currentUser?.id || currentUser?.isAdmin;

  const awarenessUser = currentUser?.id
    ? {
        id: currentUser.id,
        name: currentUser.username,
        color: userColor(currentUser.id),
      }
    : null;

  const [visMetadata, _setVisMetadata] = useState(queryData);
  const [isDirty, _setIsDirty] = useState(false);
  const [code, setCode] = useState("");
  const isDirtyRef = useRef(false);
  const saveCodeTimeout = useRef(null);

  const dispatch = useDispatch();

  const setIsDirty = useCallback((value) => {
    isDirtyRef.current = value;
    _setIsDirty(value);
  }, []);

  const [changeVisMetadata, mutationData] = useMutation(CHANGE_VISUAL, {
    variables: { where: { id: visID } },
    onCompleted: () => setIsDirty(false),
  });

  function setDocsVisibility(input) {
    changeVisMetadata({ variables: { data: { docsVisible: input } } });
  }

  function changeParameters(input) {
    _setVisMetadata({ ...visMetadata, parameters: input });
    changeVisMetadata({ variables: { data: { parameters: input } } });
  }

  function setExtensions(input) {
    _setVisMetadata({ ...visMetadata, extensions: input });
    changeVisMetadata({ variables: { data: { extensions: input } } });
  }

  useEffect(() => {
    _setVisMetadata(queryData);
  }, [queryData]);

  useEffect(() => {
    if (visMetadata?.parameters) {
      dispatch({ type: "params/load", payload: visMetadata.parameters });
    }
  }, []);

  const setters = {
    setCode,
    changeParameters,
    setDocsVisibility,
    setExtensions,
    setPopupVisuals,
    setIsDirty,
  };

  if (!isEditable && visMetadata?.privacy === "private") {
    return (
      <div className="h-100 w-100 d-flex justify-content-center align-items-center">
        This visual has been made private by the user.
      </div>
    );
  }

  return (
    <HocuspocusProviderWebsocketComponent url={collabEndpoint}>
      <HocuspocusRoom name={`yqPresence:${visID}`}>
        <SetAwarenessUser
          user={awarenessUser}
          currentView={currentScreen.left}
        />
      </HocuspocusRoom>
      <div className="h-100">
        <VisTopBar
          visMetadata={visMetadata}
          isEditable={isEditable}
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          popupVisuals={popupVisuals}
          setPopupVisuals={setPopupVisuals}
          fullScreenHandle={fullScreenHandle}
          mutationData={mutationData}
          changeVisMetadata={changeVisMetadata}
          isDirty={isDirty}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
        />
        <VisualScreen
          isEditable={isEditable}
          visMetadata={visMetadata}
          code={code}
          isPaused={isPaused}
          popupVisuals={popupVisuals}
          currentScreen={currentScreen}
          fullScreenHandle={fullScreenHandle}
          setters={setters}
          isDirty={isDirty}
          isDirtyRef={isDirtyRef}
          awarenessUser={awarenessUser}
        />
      </div>
    </HocuspocusProviderWebsocketComponent>
  );
}
