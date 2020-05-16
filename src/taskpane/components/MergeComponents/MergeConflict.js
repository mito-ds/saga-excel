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
        console.log("clicked")
    }


    render() {
        return (
            <div className="card">
                <div className="card-cols">
                    <div className="cell-div">
                        {this.state.conflict.cell}
                    </div>
                    <div className="options-div">
                        <form className="option-form form-inline" onSubmit={this.handleResolve}>
                            <input className="option" id="a" value={this.state.conflict.a} readOnly></input>
                            <button className="option-selection" type="submit">mine</button>
                        </form>
                        <form className="option-form form-inline" onSubmit={this.handleResolve}>
                            <input className="option" id="b" value={this.state.conflict.b} readOnly></input>
                            <button className="option-selection" type="submit">change</button>
                        </form>
                        <form className="option-form bottom-option form-inline" onSubmit={this.handleResolve}>
                            <input className="option" id="o" value={this.state.conflict.o} readOnly></input>
                            <button className="option-selection" type="submit">original</button>
                        </form>                
                    </div>
                </div>
            </div>
        )
    }
}
