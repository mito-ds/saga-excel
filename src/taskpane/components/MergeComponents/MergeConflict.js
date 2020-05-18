import * as React from "react";
import './MergeConflict.css';
import { runSelectCell }  from "../../../saga/sagaUtils.js";
 

/* global */

async function selectCell(e, sheet, cell) {
    e.preventDefault()
    runSelectCell(sheet, cell)
}

export default class MergeConflict extends React.Component {

    constructor(props) {
        super(props); 
        this.state = {
            conflict: this.props.conflict
        }

        this.handleResolve = this.handleResolve.bind(this)
    }

    handleResolve(e) {
        e.preventDefault();
        console.log(e)
    }

    render() {
        const cellID = this.state.conflict.sheet + ":" + this.state.conflict.cell
        const idA = cellID + "a"
        const idB = cellID + "b"
        const idO = cellID + "o"

        return (
            <div className="card">
                <div className="card-cols">
                    <div className="cell-div" onClick={(e)=> {selectCell(e, this.state.conflict.sheet, this.state.conflict.cell)}}>
                        <div>
                            {this.state.conflict.sheet}
                        </div>
                        <div>
                            {this.state.conflict.cell}
                        </div>
                    </div>
                    <div className="options-div">
                        <div className="boxed">
                            <input className="top-option"type="radio" id={idA} name={cellID} value={this.state.conflict.a} />
                            <label htmlFor={idA}>{this.state.conflict.a}</label>

                            <input type="radio" id={idB} name={cellID} value={this.state.conflict.b}/>
                            <label htmlFor={idB}> {this.state.conflict.b} </label>

                            <input type="radio" id={idO} name={cellID} value={this.state.conflict.o}/>
                            <label htmlFor={idO}> {this.state.conflict.o} </label>
                        </div>         
                    </div>
                </div>
            </div>
        )
    }
}
