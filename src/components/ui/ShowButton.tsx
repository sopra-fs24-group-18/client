import React from "react";
import PropTypes from "prop-types";
import "../../styles/ui/ShowButton.scss";

export const ShowButton = props => (
  <button
    {...props}
    style={{width: props.width, ...props.style}}
    className={`show-button ${props.className}`}>
    {props.children}
  </button>
);


ShowButton.propTypes = {
  width: PropTypes.number,
  style: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};