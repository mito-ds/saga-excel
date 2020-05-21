import * as React from "react";
import "./Diff.css";

/* global  */


export default function Diff(props) {

    const cell = props.diff.cell;
    const initialElement = props.diff.initialElement;
    const finalElement = props.diff.finalElement;

    console.log(props.diff)
    return (
        <div className="card">
            <div className="card-cols">
                <div className="cell-div">
                    <div>
                        {cell}
                    </div>
                </div>
                <div className="options-div">
                    <div className="boxed">
                        {initialElement}
                        {finalElement}
                    </div>         
                </div>
            </div>
        </div>
    )
}
