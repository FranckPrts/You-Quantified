import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client/react";
import { MY_VISUALS } from "../../../queries/visuals";
import MainView from "./main_view";
import NoVisualScreen from "./no_visual_screen";
import { HocuspocusProviderWebsocketComponent, HocuspocusRoom } from "@hocuspocus/provider-react";

export { VisualScreen } from "./visual_screen";

const collabEndpoint =
  process.env.NODE_ENV === "development"
    ? process.env.REACT_APP_COLLAB_ENDPOINT_DEV || "ws://localhost:3001/collab"
    : process.env.REACT_APP_COLLAB_ENDPOINT;

export function QueryMainView() {
  const { visID } = useParams();

  const { dataState, error, data } = useQuery(MY_VISUALS, {
    variables: { where: { id: { equals: visID } } },
    // fetchPolicy: "network-only",
  });

  if (error) return `Error! ${error.message}`;

  if (dataState === "empty") return "Loading...";

  if (data?.visuals?.length === 0) {
    return <NoVisualScreen />;
  }

  return (
    <HocuspocusProviderWebsocketComponent url={collabEndpoint}>
      <HocuspocusRoom name={`visual:${visID}`}>
        <MainView visID={visID} queryData={data?.visuals[0]} />
      </HocuspocusRoom>
    </HocuspocusProviderWebsocketComponent>
  );
}
<<<<<<< HEAD

function MainView({ visID, queryData }) {
  // This function bridges the left pane (code editor/parameters) with the visualization

  const [visMetadata, _setVisMetadata] = useState(queryData);
  const [isDirty, _setIsDirty] = useState(false);
  const isDirtyRef = useRef(false);
  const saveCodeTimeout = useRef(null);

  const setIsDirty = useCallback((value) => {
    isDirtyRef.current = value;
    _setIsDirty(value);
  });

  useEffect(() => {
    _setVisMetadata(queryData);
  }, [queryData]);

  const [currentScreen, setCurrentScreen] = useState({
    left: visMetadata?.docsVisible ? "docs" : "dashboard",
  });
  const [code, _setCode] = useState("");
  const [docsContent, _setDocsContent] = useState(visMetadata?.docs);
  const [popupVisuals, setPopupVisuals] = useState(false);

  const [changeVisMetadata, mutationData] = useMutation(CHANGE_VISUAL, {
    variables: {
      where: { id: visID },
    },
    refetchQueries: [MY_VISUALS, "VisualsQuery"],
    onCompleted: () => {
      setIsDirty(false);
    },
  });

  const dispatch = useDispatch();
  const fullScreenHandle = useFullScreenHandle();

  const { currentUser } = useContext(UserContext);

  const isEditable =
    visMetadata?.author?.id === currentUser?.id || currentUser?.isAdmin;

  function setExtensions(input) {
    // In case I want prettier URLs https://www.jsdelivr.com/docs/data.jsdelivr.com#overview
    _setVisMetadata({
      ...visMetadata,
      extensions: input,
    });
    changeVisMetadata({
      variables: {
        data: {
          extensions: input,
        },
      },
    });
  }

  function setCode(str) {
    setIsDirty(true);
    localStorage.setItem(`visuals/${visID}`, str);
    _setCode(str);
    debouncedCodeSave(str);
  }

  const debouncedCodeSave = useCallback((str) => {
    clearTimeout(saveCodeTimeout.current);
    saveCodeTimeout.current = setTimeout(() => setRemoteCode(str), 1000);
  });

  function setRemoteCode(str) {
    if (isDirtyRef.current && isEditable) {
      const file = createTextFileFromString(str, "code.txt");
      changeVisMetadata({
        variables: {
          data: {
            code: {
              upload: file,
            },
          },
        },
      });
    }
  }

  function updateDocsData(content) {
    changeVisMetadata({
      variables: {
        data: {
          docs: content,
        },
      },
    });
    _setDocsContent(content);
  }

  function setDocsVisibility(input) {
    changeVisMetadata({
      variables: {
        data: {
          docsVisible: input,
        },
      },
    });
  }

  function changeParameters(input) {
    _setVisMetadata({
      ...visMetadata,
      parameters: input,
    });
    changeVisMetadata({
      variables: {
        data: {
          parameters: input,
        },
      },
    });
  }

  const setters = {
    setCode,
    changeParameters,
    setDocsVisibility,
    updateDocsData,
    setExtensions,
    setPopupVisuals,
    setIsDirty,
    setRemoteCode,
  };

  // Get the code and docs when the program starts
  useEffect(() => {
    fetchCode(visMetadata?.code?.url)
      .then((response) => _setCode(response))
      .catch((error) => _setCode(null));
    if (visMetadata?.docs) {
      _setDocsContent(visMetadata?.docs);
    }

    return () => {
      clearTimeout(saveCodeTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (visMetadata?.parameters) {
      dispatch({ type: "params/load", payload: visMetadata?.parameters });
    }
  }, [visMetadata]);

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
        isDirty={isDirty}
      />
      <VisualScreen
        isEditable={isEditable}
        visMetadata={visMetadata}
        code={code}
        popupVisuals={popupVisuals}
        currentScreen={currentScreen}
        fullScreenHandle={fullScreenHandle}
        docsContent={docsContent}
        setters={setters}
        isDirty={isDirty}
        isDirtyRef={isDirtyRef}

      />
    </div>
  );
}

function createTextFileFromString(text, filename) {
  // Create a Blob object from the string

  const blob = new Blob([text], { type: "text/plain" });

  //const file = new File([blob], filename, { type: "text/plain" });
  // const downloadLink = URL.createObjectURL(file);

  // Create a new File object from the Blob
  return blob;
}
=======
>>>>>>> 2c9e30a0c3194b045dee9574ff531c3c3e500dd2
