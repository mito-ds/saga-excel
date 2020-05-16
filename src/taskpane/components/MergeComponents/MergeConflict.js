import * as React from "react";
import './MergeConflict.css';
import { PrimaryButton } from '@fluentui/react';

/* global */

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
        const idA = this.state.conflict.cell + "a"
        const idB = this.state.conflict.cell + "b"
        const idO = this.state.conflict.cell + "o"

        return (
            <div className="card">
                <div className="card-cols">
                    <div className="cell-div">
                        {this.state.conflict.cell}
                    </div>
                    <div className="options-div">
                        <div className="boxed">
                            <input className="top-option"type="radio" id={idA} name={this.state.conflict.cell} value={this.state.conflict.a} />
                            <label htmlFor={idA}>{this.state.conflict.a}</label>

                            <input type="radio" id={idB} name={this.state.conflict.cell} value={this.state.conflict.b}/>
                            <label htmlFor={idB}> {this.state.conflict.b} </label>

                            <input type="radio" id={idO} name={this.state.conflict.cell} value={this.state.conflict.o}/>
                            <label htmlFor={idO}> {this.state.conflict.o} </label>
                        </div>
                                   
                    </div>
                </div>
            </div>
        )
    }
}
