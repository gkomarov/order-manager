import React from 'react';

export const FlexColumn = (props) => {
    return <div className={"d-flex flex-column " + props.className}>{props.children}</div>
}

export const FlexBlock = (props) => {
    return <div className={"d-flex align-items-center justify-content-between " + props.className}>{props.children}</div>
}