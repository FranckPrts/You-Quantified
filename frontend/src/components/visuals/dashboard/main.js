import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { MY_VISUALS } from "../../../queries/visuals";
import MainView from "./main_view";
import NoVisualScreen from "./no_visual_screen";

export { VisualScreen } from "./visual_screen";

export function QueryMainView() {
  const { visID } = useParams();

  const { loading, error, data } = useQuery(MY_VISUALS, {
    variables: { where: { id: { equals: visID } } },
    // fetchPolicy: "network-only",
  });

  if (error) return `Error! ${error.message}`;
  if (loading) return "Loading...";

  if (data?.visuals?.length === 0) {
    return <NoVisualScreen />;
  }

  return <MainView visID={visID} queryData={data?.visuals[0]} />;
}
