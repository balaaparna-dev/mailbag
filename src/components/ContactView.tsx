import React from "react";

import Button from "@mui/material/Button";
import { TextField } from "@mui/material";

import { IAppState } from "../state";

const ContactView = ({ state }: { state: IAppState }) => (

  <form>

    <TextField margin="dense" id="contactName" label="Name" value={state.contactName} variant="outlined"
      InputProps={{ style: { color: "#000000" } }} /*disabled={ state.currentView === "contact"}*/ style={{ width: 260 }}
      onChange={state.fieldChangeHandler} />
    <br />
    <TextField margin="dense" id="contactEmail" label="Email" value={state.contactEmail} variant="outlined"
      InputProps={{ style: { color: "#000000" } }} /*disabled={ state.currentView === "contact"}*/ style={{ width: 520 }}
      onChange={state.fieldChangeHandler} />
    <br />
    { /* Display buttons conditionally based on the current view. 
   We use this approach for the `onClick` handlers to ensure that
   the event object is not passed to the handler functions,
   which allows the conditional logic for `addContact`, `updateContact`, 
   and `deleteContact` to work correctly. */}
    {state.currentView === "contactAdd" &&
      <Button variant="contained" color="primary" size="small" style={{ marginTop: 10 }}
        onClick={state.saveContact}>
        Save
      </Button>
    }
    {state.currentView === "contact" &&
      <Button variant="contained" color="primary" size="small" style={{ marginTop: 10, marginRight: 10 }}
        onClick={state.updateContact}>
        Update Contact
      </Button>
    }
    {state.currentView === "contact" &&
      <Button variant="contained" color="primary" size="small" style={{ marginTop: 10, marginRight: 10 }}
        onClick={state.deleteContact}>
        Delete
      </Button>
    }
    {state.currentView === "contact" &&
      <Button variant="contained" color="primary" size="small" style={{ marginTop: 10 }}
        onClick={() => state.showComposeMessage("contact")}>
        Send Email
      </Button>
    }

  </form>

); /* ContactView. */


export default ContactView;