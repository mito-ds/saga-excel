import * as React from "react";
import './MergeConflict.css';
import { runSelectCell }  from "../../../saga/sagaUtils.js";
 

/* global */

// select the given cell in the Excel UI
async function selectCell(e, sheet, cell) {
    e.preventDefault()
    runSelectCell(sheet, cell)
}

export default function MergeConflict(props) {

    console.log(props)
    console.log(props.conflict)

    const cellID = props.conflict.sheet + ":" + props.conflict.cellOrRow
    const idA = cellID + "a"
    const idB = cellID + "b"
    const idO = cellID + "o"

    return (
        <div className="card">
            <div className="card-cols">
                <div className="cell-div" onClick={(e)=> {selectCell(e, props.conflict.sheet, props.conflict.cellOrRow)}}>
                    <div>
                        {props.conflict.sheet}
                    </div>
                    <div>
                        {props.conflict.cellOrRow}
                    </div>
                </div>
                <div className="options-div">
                    <div className="boxed">
                        <input type="radio" id={idB} name={cellID} value={props.conflict.b}/>
                        <label htmlFor={idB}> {props.conflict.b} </label>

                        <input className="top-option" type="radio" id={idA} name={cellID} value={props.conflict.a} />
                        <label htmlFor={idA}>{props.conflict.a}</label>

                        <input type="radio" id={idO} name={cellID} value={props.conflict.o}/>
                        <label htmlFor={idO}> {props.conflict.o} </label>
                    </div>         
                </div>
            </div>
        </div>
    )
}
