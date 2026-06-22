import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useFullScreenHandle } from "react-full-screen";
import { VisTopBar } from "./top_bar";
import { VisualScreen } from "./visual_screen";
import { UserContext } from "../../../App";
import { useDispatch } from "react-redux";
import { useMutation } from "@apollo/client/react";
import { CHANGE_VISUAL } from "../../../queries/visuals";
import {
  HocuspocusRoom,
  useHocuspocusProvider,
  useHocuspocusEvent,
} from "@hocuspocus/provider-react";
import { fetchCode } from "../utility/fetch_code";
import { prosemirrorJSONToYXmlFragment } from "@tiptap/y-tiptap";
import { extensions } from "./docs/main";
import { getSchema } from "@tiptap/core";
import { userColor } from "../../../utility/user_colors";

export default function MainView({ visID, queryData }) {
  // This function bridges the left pane (code editor/parameters) with the visualization

  const { currentUser } = useContext(UserContext);
  const [currentScreen, setCurrentScreen] = useState({
    left: queryData?.docsVisible ? "docs" : "dashboard",
  });
  const [popupVisuals, setPopupVisuals] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const fullScreenHandle = useFullScreenHandle();
  const provider = useHocuspocusProvider();

  const isEditable =
    queryData?.author?.id === currentUser?.id || currentUser?.isAdmin;

  const [visMetadata, _setVisMetadata] = useState(queryData);
  const [code, setCode] = useState("");
  const saveCodeTimeout = useRef(null);

  const dispatch = useDispatch();
  const [changeVisMetadata, mutationData] = useMutation(CHANGE_VISUAL, {
    variables: { where: { id: visID } },
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

  const seedDocument = useCallback(async () => {
    if (visMetadata?.yjsState) return;

    // Initial seeding:
    const ydoc = provider.document;
    const ycode = ydoc.getText("code");

    if (ycode.length === 0) {
      console.log("Seeding code from the backend");
      const response = await fetchCode(visMetadata?.code?.url);
      ycode.insert(0, response);
    }

    const ytiptap = ydoc.getXmlFragment("docs");
    if (ytiptap.length === 0) {
      if (visMetadata?.docs) {
        console.log("Seeding docs from the backend");
        prosemirrorJSONToYXmlFragment(
          getSchema(extensions),
          visMetadata?.docs,
          ytiptap,
        );
      }
    }
  }, [provider, visMetadata]);

  useHocuspocusEvent("synced", ({ state }) => {
    console.log("Websocket synced", state);
    seedDocument();
  });

  useEffect(() => {
    if (provider?.isSynced) seedDocument();
  }, [provider, seedDocument]);

  useEffect(() => {
    _setVisMetadata(queryData);
  }, [queryData]);

  useEffect(() => {
    if (visMetadata?.parameters) {
      dispatch({ type: "params/load", payload: visMetadata.parameters });
    }

    const ycode = provider.document.getText("code");

    const observer = () => {
      console.log("Code change from ytext");
      setCode(ycode.toString());
    };

    ycode.observe(observer);

    provider.setAwarenessField("user", {
      name: currentUser?.username,
      userID: currentUser?.id,
      color: userColor(currentUser?.id),
    })

    return () => {
      ycode.unobserve(observer);
    }
  }, []);

  const setters = {
    setCode,
    changeParameters,
    setDocsVisibility,
    setExtensions,
    setPopupVisuals,
  };

  if (!isEditable && visMetadata?.privacy === "private") {
    return (
      <div className="h-100 w-100 d-flex justify-content-center align-items-center">
        This visual has been made private by the user.
      </div>
    );
  }

  return (
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
      />
    </div>
  );
}
