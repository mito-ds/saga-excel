import * as React from "react";
import './MergeConflict.css';
import { runSelectCell }  from "../../../saga/sagaUtils.js";
 

/* global */

// select the given cell in the Excel UI
async function selectCell(e, sheet, cell) {
    e.preventDefault()
    runSelectCell(sheet, cell)
}

export default class MergeConflict extends React.Component {

    constructor(props) {
        super(props); 

        this.handleResolve = this.handleResolve.bind(this)
    }

    handleResolve(e) {
        e.preventDefault();
        console.log(e)
    }

    render() {
        console.log(this.props)
        console.log(this.props.conflict)

        const cellID = this.props.conflict.sheet + ":" + this.props.conflict.cellOrRow
        const idA = cellID + "a"
        const idB = cellID + "b"
        const idO = cellID + "o"

        return (
            <div className="card">
                <div className="card-cols">
                    <div className="cell-div" onClick={(e)=> {selectCell(e, this.props.conflict.sheet, this.props.conflict.cellOrRow)}}>
                        <div>
                            {this.props.conflict.sheet}
                        </div>
                        <div>
                            {this.props.conflict.cellOrRow}
                        </div>
                    </div>
                    <div className="options-div">
                        <div className="boxed">
                            <input className="top-option" type="radio" id={idA} name={cellID} value={this.props.conflict.a} />
                            <label htmlFor={idA}>{this.props.conflict.a}</label>

                            <input type="radio" id={idB} name={cellID} value={this.props.conflict.b}/>
                            <label htmlFor={idB}> {this.props.conflict.b} </label>

                            <input type="radio" id={idO} name={cellID} value={this.props.conflict.o}/>
                            <label htmlFor={idO}> {this.props.conflict.o} </label>
                        </div>         
                    </div>
                </div>
            </div>
        )
    }
}
