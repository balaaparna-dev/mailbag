import React from "react";


import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { IAppState } from "../state";


const MessageList = ({ state }: { state: IAppState }) => (

  <Table stickyHeader padding="none">
    <TableHead>
      <TableRow>
        <TableCell style={{ width:120 }}>Date</TableCell>
        <TableCell style={{ width:300 }}>From</TableCell>
        <TableCell>Subject</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {state.messages.length > 0 ? (
    state.messages.map((message) => (
      <TableRow key={message.id} onClick={() => state.showMessage(message)}>
        <TableCell>{new Date(message.date).toLocaleDateString()}</TableCell>
        <TableCell>{message.from}</TableCell>
        <TableCell>{message.subject}</TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={3} style={{ textAlign: 'center' }}>
        No messages available.
      </TableCell>
    </TableRow>
  )}
    </TableBody>
  </Table>

);


export default MessageList;