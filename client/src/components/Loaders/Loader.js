import React from 'react';
import { css } from "@emotion/core";
import ClipLoader from "react-spinners/ClipLoader";

const Loader = (props) => {
  const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
  `;

  return (
    <div className="main-container gradient-background basic-fx justify-center-fx align-center-fx">
      <ClipLoader color={"#900C3F"} loading={props.pageLoaded} css={override} size={250} />
    </div>
  );
};

export default Loader;