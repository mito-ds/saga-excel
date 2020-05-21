import * as React from "react";
import "./Diff.css";
import { runSelectCell }  from "../../../saga/sagaUtils.js";

/* global  */

export default function Diff(props) {

    const sheetName = props.diff.sheet;
    const cell = props.diff.cell;
    const initialElement = props.diff.initialElement;
    const finalElement = props.diff.finalElement;

    console.log(`Sheetname: ${props.diff}`)

    console.log(props.diff)

    const oldBox = (
        <div className="boxed old">
            {initialElement}
        </div>   
    )

    const newBox = (
        <div className="boxed new">
            {finalElement}
        </div>  
    )

    console.log("initialElement", initialElement);

    return (
        <div className="sub-card">
            <div className="card-cols">
                <div className="cell-div" onClick={async (e)=> {await runSelectCell(sheetName, cell)}}>
                    <div>
                        {cell}
                    </div>
                </div>
                <div className="options-div">
                    {initialElement !== "" ? oldBox : null }
                    {finalElement !== "" ? newBox : null }
                </div>   
            </div>
        </div>
    )
}
