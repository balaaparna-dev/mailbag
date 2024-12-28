import React from "react";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Person from '@mui/icons-material/Person';
import ListItemText from '@mui/material/ListItemText';

import { IAppState } from "../state";

const ContactList = ({ state }: { state: IAppState }) => (

  <List>

    {state.contacts.map((value) => {
      return (
        <ListItem key={ value._id } component = "button"  onClick={ () => state.showContact(value._id.toString(), value.name, value.email) }>
          <ListItemAvatar>
            <Avatar>
              <Person />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={ `${value.name}` } secondary={ `${value.email}` } />
        </ListItem>
      );
    })}

  </List>

);


export default ContactList;