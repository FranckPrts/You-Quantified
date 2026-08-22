import { useState, useRef, useCallback, useEffect } from "react";
import { useMutation } from "@apollo/client/react";
import { useDispatch } from "react-redux";
import { fetchCode } from "../utility/fetch_code";
import { CHANGE_VISUAL } from "../../../queries/visuals";

function createTextFileFromString(text) {
  return new Blob([text], { type: "text/plain" });
}

export function useVisualData(visID, queryData, isEditable) {
  

  return {
    visMetadata,
    mutationData,
    changeVisMetadata,
    isDirty,
    isDirtyRef,
    setIsDirty,
    code,
    setCode,
    setRemoteCode,
    docsContent,
    updateDocsData,
    setDocsVisibility,
    changeParameters,
    setExtensions,
  };
}
