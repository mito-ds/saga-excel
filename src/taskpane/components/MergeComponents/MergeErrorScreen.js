import * as React from "react";
import Taskpane from "../Taskpane";
import { headerSize } from "../../../constants";


export default function MergeErrorScreen(props) {

  const title = `
  Oops! Something went wrong during merge.
  Shoot us an email @ founders@sagacollab.com. We'll get back to you as soon as possible.
  `

  return (
    <Taskpane header={headerSize.LARGE} title={title}>

    </Taskpane>
  )
}
