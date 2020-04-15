import * as React from "react";

// Login Form Component
class SagaLinkScreen extends React.Component {
    constructor() {
        super();
        //this.state = {
        //    username: ''
        //};    
        this.copyToClipboard = this.copyToClipboard.bind(this)
    }

    // Copy project link to clipboard
    copyToClipboard(e) {
        e.preventDefault();
        var copyText = document.getElementById("project-link");
        copyText.select();
        document.execCommand("copy");
    }

    render () {
        return (
            <div className="floating-card" id="project-link-card" style={{display: "none"}}>
              <form className="form" onSubmit={this.copyToClipboard}>
                <input className="project-link-div" id="project-link" disabled></input>
                <input type="image" src="assets/clipboard.png" width="30vw" border="0" alt="Submit" />
              </form>
            </div>
        );
    }
}

// Export SagaLinkScreen
export default SagaLinkScreen;