import { MyUserName } from "./username";
import { useContext, useState } from "react";
import { UserContext } from "../../../App";
import { profanity } from "@2toad/profanity";
import { useMutation } from "@apollo/client/react";
import { NEW_VISUAL } from "../../../queries/visuals";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

const defaultCode = `
windowResized = () => {
  // Allows the canvas to resize when you resize your window
  resizeCanvas(windowWidth, windowHeight);
};

setup = () => {
  // This creates the Canvas so that it takes the size of your window.
  createCanvas(windowWidth, windowHeight);
};

// Code that is constantly being updated
draw = () => {
  background(220);
};
`;

export function NewVisual() {
  const { currentUser } = useContext(UserContext);
  const [allParams, setAllParams] = useState([{ name: "", suggested: "" }]);
  const [initCode, setInitCode] = useState(false);
  const [visName, setVisName] = useState("");
  const [visDescription, setVisDescription] = useState("");

  const navigate = useNavigate();

  const [createNewVisual, { data, loading, error }] = useMutation(NEW_VISUAL);
  if (error) {
    console.log(JSON.stringify(error));
  }

  // Validation is derived from the raw input values on every render, so the
  // text the user typed always stays in state. We keep two separate buckets:
  //   - `missing`: required fields that are still empty (incomplete, not wrong)
  //   - `errors`:  fields the user has filled in but that fail validation
  // Empty/whitespace is routed to `missing` before the regex runs, which is why
  // the regexes no longer need the `(?!\s*$)` non-empty lookahead.
  const nameRegex = /^(?!.*[%$\-\/])[^\n\r]{1,50}$/;
  const descriptionRegex = /^(?!.*[%$\-\/])[^\n\r]{1,1000}$/;

  const missing = [];
  const errors = [];

  if (visName.trim() === "") {
    missing.push("Name");
  } else if (!nameRegex.test(visName) || profanity.exists(visName)) {
    errors.push("Invalid name");
  }

  if (visDescription.trim() === "") {
    missing.push("Description");
  } else if (
    !descriptionRegex.test(visDescription) ||
    profanity.exists(visDescription)
  ) {
    errors.push("Invalid description");
  }

  allParams.forEach((param, idx) => {
    const label = `Parameter ${idx + 1}`;
    const name = param?.name ?? "";
    if (name.trim() === "") {
      missing.push(`${label} name`);
    } else if (!nameRegex.test(name) || profanity.exists(name)) {
      errors.push(`${label} has an invalid name`);
    }
    if (!validateCommaSeparatedList(param?.suggested ?? "")) {
      errors.push(`${label} has an invalid suggested list`);
    }
  });

  const isFormValid =
    !loading && missing.length === 0 && errors.length === 0;

  function createNewParam() {
    const newItem = { name: "", suggested: "" };
    setAllParams((prevParams) => [...prevParams, newItem]);
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    if (!isFormValid) {
      return;
    }
    const params = allParams.map((item) => {
      return { name: item?.name, suggested: item?.suggested.split(/,\s*|,/) };
    });

    let codeFile = initCode;
    if (!codeFile) {
      const blob = new Blob([defaultCode], { type: "text/plain" });
      codeFile = blob;
    }

    const visMetadata = {
      title: visName,
      description: visDescription,
      parameters: params,
      author: {
        connect: {
          id: currentUser?.id,
        },
      },
      code: {
        upload: codeFile,
      },
    };

    createNewVisual({
      variables: {
        data: visMetadata,
      },
    });
  }

  if (data?.createVisual?.id) {
    console.log("Navigating...");
    navigate(`/visuals/${data?.createVisual?.id}`);
    return;
  }

  return (
    <div className="scrollable">
      <div className="h-100 center-margin overflow-scroll disable-scrollbar">
        <div className="align-items-start mb-5">
          <Link
            className="btn btn-link text-decoration-none fw-medium mb-0 p-0 mt-5"
            to="/visuals"
          >
            <i className="bi bi-arrow-left-short"></i>Visuals
          </Link>
          <h1 className="mt-0 mb-1 h2">New visual</h1>
          <p>
            Create a new P5.js visual from scratch or upload your code<br></br>
          </p>
        </div>
        <h5 className="m-0">
          Information{" "}
          <span className="asterisk" aria-hidden="true">
            *
          </span>
        </h5>
        <p className="mb-2">
          Write a name for your visual and a description to be shown on the
          card.
        </p>
        <div className="input-group mb-1">
          <span className="input-group-text" id="basic-addon2">
            Name
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Visual name"
            aria-label="Visual name"
            autoComplete="off"
            value={visName}
            onChange={(e) => setVisName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <textarea
            type="text"
            className="form-control"
            placeholder="Please provide a short description"
            aria-label="Description"
            value={visDescription}
            onChange={(e) => setVisDescription(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <h5 className="m-0">
            Parameters{" "}
            <span className="asterisk" aria-hidden="true">
              *
            </span>
          </h5>
          <p className="mb-2">
            All parameters must have at least a name. Optionally, write a list
            of suggested streams.
          </p>
          {allParams.map((item, idx) => (
            <ParamItem
              myParam={item}
              idx={idx}
              setAllParams={setAllParams}
              allParamsLength={allParams.length}
              key={idx}
            />
          ))}
          <div className="pb-2 p-0">
            <button
              onClick={createNewParam}
              className="btn btn-outline-primary p-2 mt-1"
            >
              <i className="bi bi-plus m-0"></i> Add
            </button>
          </div>
        </div>
        <div className="mb-4">
          <h5 className="m-0">Code</h5>
          <p className="mb-2">
            Leave it empty to start from scratch. If you have already created a
            p5.js visual, you can upload your own code here.
          </p>
          <input
            type="file"
            className="form-control"
            id="inputUpload"
            accept=".txt,.js"
            onChange={(e) => handleFileUpload(e, setInitCode)}
          />
        </div>
        {loading && <p className="text-success">Creating visual...</p>}
        <div className="d-flex align-items-center gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleFormSubmit}
            disabled={!isFormValid}
          >
            Create visual
          </button>
          {errors.length > 0 && (
            <StatusPopover
              icon="error"
              variant="danger"
              title="Invalid input"
              items={errors}
            />
          )}
          {missing.length > 0 && (
            <StatusPopover
              icon="info"
              variant="muted"
              title="Required fields"
              items={missing}
            />
          )}
        </div>
      </div>
    </div>
  );
}

async function handleFileUpload(e, setInitCode) {
  const form = e.currentTarget;
  const [file] = await form.files;

  if (!file) {
    setInitCode();
    console.log("No file selected");
    return;
  }

  const extension = file.name
    .substring(file.name.lastIndexOf("."))
    .toLowerCase();

  if (extension === ".js") {
    // Read the contents of the .js file
    const reader = new FileReader();
    reader.onload = function (event) {
      const jsContent = event.target.result;

      const txtContent = jsContent.replace(/(?:\r\n|\r|\n)/g, "\n"); // Normalize line endings

      const txtBlob = new Blob([txtContent], { type: "text/plain" });
      setInitCode(txtBlob);
    };
    reader.readAsText(file);
  } else {
    // For .txt files, directly create a Blob
    const txtBlob = new Blob([file], { type: "text/plain" });
    setInitCode(txtBlob);
  }
}


function StatusPopover({ icon, variant, title, items }) {
  const popover = (
    <Popover className="rounded-0">
      <Popover.Header as="h6" className={`rounded-0 text-${variant}`}>
        {title}
      </Popover.Header>
      <Popover.Body>
        <ul className="mb-0 ps-3">
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger
      trigger={["hover", "focus"]}
      placement="top"
      overlay={popover}
    >
      <button
        type="button"
        className={`btn btn-link text-decoration-none p-0 d-inline-flex align-items-center text-${variant}`}
        aria-label={title}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </button>
    </OverlayTrigger>
  );
}

function ParamItem({ myParam, setAllParams, idx, allParamsLength }) {
  function updateParams(value) {
    setAllParams((prevParams) => {
      const newParams = [...prevParams];
      newParams[idx] = value;
      return newParams;
    });
  }

  function deleteParameter() {
    setAllParams((prevParams) => {
      const newParams = [...prevParams];
      newParams.splice(idx, 1);
      return newParams;
    });
  }

  return (
    <div key={idx}>
      <div className="param-input">
        <input
          autoComplete="off"
          className="form-control col-name"
          placeholder="Name"
          value={myParam?.name ?? ""}
          onChange={(e) => updateParams({ ...myParam, name: e.target.value })}
        ></input>
        <input
          className="form-control col-suggested"
          placeholder="Suggested (i.e. Alpha, Beta, Gamma)"
          value={myParam?.suggested ?? ""}
          onChange={(e) =>
            updateParams({ ...myParam, suggested: e.target.value })
          }
        ></input>
        <button
          className="btn btn-outline-danger fw-medium"
          onClick={deleteParameter}
          disabled={allParamsLength <= 1}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export function validateCommaSeparatedList(input) {
  // Check if input is a string

  if (input === "") {
    return true;
  }

  if (typeof input !== "string") {
    return false;
  }

  // Trim leading and trailing whitespace
  input = input.trim();

  // Check if the input is empty after trimming
  if (input === "") {
    return false;
  }

  // Split the input by commas
  const items = input.split(",");

  // Check if each item is not empty and does not contain only whitespace
  for (let item of items) {
    item = item.trim();
    if (item === "") {
      return false;
    }
  }

  // If all checks pass, return true
  return true;
}
