import * as React from "react";
import './MergeConflict.css';
import { PrimaryButton } from '@fluentui/react';

/* global */

export default class MergeConflict extends React.Component {
    render() {
        return (
            <div className="card">
                <div className="card-cols">
                    <div className="cell-div">
                        Cell
                    </div>
                    <div className="options-div">
                        <PrimaryButton className="option" type="submit">Submit</PrimaryButton>
                        <PrimaryButton className="option" type="submit">Submit</PrimaryButton>
                        <PrimaryButton className="option bottom-option" type="submit">Submit</PrimaryButton>                  
                    </div>
                    <div className="resolved-dot-div"></div>

                </div>
            </div>
        )
    }
}
