import * as React from "react";
import "./Diff.css";
import { runSelectCell }  from "../../../saga/sagaUtils.js";

/* global  */

export default function Diff(props) {

    const sheetName = props.diff.sheetName;
    const cell = props.diff.cell;
    const initialValue = props.diff.initialValue;
    const finalValue = props.diff.finalValue;

    console.log(`Sheetname: ${props.diff}`)

    console.log(props.diff)

    const oldBox = (
        <div className="diff-boxed old">
            {initialValue}
        </div>   
    )

    const newBox = (
        <div className="diff-boxed new">
            {finalValue}
        </div>  
    )

    console.log("initialValue", initialValue);

    return (
        <div className="sub-card">
            <div className="card-cols">
                <div className="cell-div" onClick={async (e)=> {await runSelectCell(sheetName, cell)}}>
                    <div>
                        {cell}
                    </div>
                </div>
                <div className="options-div">
                    {initialValue !== "" ? oldBox : null }
                    {finalValue !== "" ? newBox : null }
                </div>   
            </div>
        </div>
    )
}
