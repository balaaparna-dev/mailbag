import "normalize.css"; // CSS reset
import "./css/main.css";

import React from "react";
import ReactDOM from "react-dom/client";

import BaseLayout from "./components/BaseLayout";
import * as IMAP from "./IMAP";
import * as Contacts from "./Contacts";

// Render the UI
const root = ReactDOM.createRoot(document.getElementById("root")!);


const baseLayoutRef = (node: BaseLayout | null) => {
  if (node) {
    console.log('BaseLayout mounted');
    // After BaseLayout is mounted, run the function to get mailboxes
    getMailboxes(node).then(() => {
      getContacts(node); // Pass the node (BaseLayout instance) to getContacts
    });
  }
};

root.render(<BaseLayout ref={baseLayoutRef} />);

async function getMailboxes(node: BaseLayout) {

  if (node) {

    node.state.showHidePleaseWait(true); // Show "Please Wait"
    const imapWorker: IMAP.Worker = new IMAP.Worker();
    const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
    
    const updatedMailboxes = [...node.state.mailboxes];

    mailboxes.forEach((inMailbox) => {
      node.state.addMailboxToList(inMailbox); // Update state with mailboxes
      updatedMailboxes.push(inMailbox); 
    });

    node.setState({ mailboxes: updatedMailboxes });

    node.state.showHidePleaseWait(false); 
    
  }
}

async function getContacts(node: BaseLayout) {
  const contactsWorker: Contacts.Worker = new Contacts.Worker();
  const contacts: Contacts.IContact[] = await contactsWorker.listContacts();
  
  contacts.forEach((inContact) => {
    node.state.addContactToList(inContact); // Update state with contacts
  });

  if (node) {
    node.state.showHidePleaseWait(false); // Hide "Please Wait"
  }
}
