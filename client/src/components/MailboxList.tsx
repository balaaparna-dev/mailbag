import React from "react";

import Chip from "@mui/material/Chip";
import List from "@mui/material/List";

import { IAppState } from "../state";

const MailboxList = ({ state }: { state: IAppState }) => (
  <List>

 {state.mailboxes && state.mailboxes.length > 0 ? (
      state.mailboxes.map((value) => (
        <Chip
          key={value.path}
          label={value.name}
          onClick={() => state.setCurrentMailbox(value.path)}
          style={{ width: 128, marginBottom: 10 }}
          color={state.currentMailbox === value.path ? "secondary" : "primary"}
        />
      ))
    ) : (
      <p>No mailboxes available</p>
    )}
  </List>

);


export default MailboxList;