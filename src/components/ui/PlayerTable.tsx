import React from "react";
import PropTypes from "prop-types";
import "../../styles/ui/PlayerTable.scss";

export const PlayerTable = props => (
  <player-table
    {...props}
    style={{width: props.width, ...props.style}}
    className={`primary-player-table ${props.className}`}>
    {props.children}
  </player-table>
);


PlayerTable.propTypes = {
  width: PropTypes.number,
  style: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};