import * as Contacts from "./Contacts";
import { config } from "./config";
import * as IMAP from "./IMAP";
import * as SMTP from "./SMTP";



//  Only called once in BaseLayout




export interface IAppState {
  pleaseWaitVisible: boolean;
  contacts: Contacts.IContact[];
  mailboxes: IMAP.IMailbox[];
  messages: IMAP.IMessage[];
  currentView: string;
  currentMailbox: string | null;
  messageID: string | null;
  messageDate: string | null;
  messageFrom: string | null;
  messageTo: string | null;
  messageSubject: string | null;
  messageBody: string | null;
  contactID: string | null; 
  contactName: string;
  contactEmail: string;

  // Methods are already in place
  showHidePleaseWait(inVisible: boolean): void;
  showContact(inID: string, inName: string, inEmail: string): void;
  showAddContact(): void;
  showMessage(inMessage: IMAP.IMessage): Promise<void>;
  showComposeMessage(inType: string): void;
  addMailboxToList(inMailbox: IMAP.IMailbox): void;
  addContactToList(inContact: Contacts.IContact): void;
  addMessageToList(inMessage: IMAP.IMessage): void;
  clearMessages(): void;
  setCurrentMailbox(inPath: string): void;
  getMessages(inPath: string): Promise<void>;
  fieldChangeHandler(inEvent: any): void;
  saveContact(): Promise<void>;
  deleteContact(): Promise<void>;
  updateContact(): Promise<void>;
  deleteMessage(): Promise<void>;
  sendMessage(): Promise<void>;
}


export function createState(inParentComponent: unknown): IAppState {

  return {

    pleaseWaitVisible: false,
    contacts: [],
    mailboxes: [],
    messages: [],

    // centerArea:  "welcome"/ "message"/ "compose"/ "contact"/ "contactAdd").
    currentView: "welcome",
    // The currently selected mailbox, if any.
    currentMailbox: null,

    // message details
    // messageID is the ID on the server.
    messageID: null,
    messageDate: null,
    messageFrom: null,
    messageTo: null,
    messageSubject: null,
    messageBody: null,
    // contact: currently being viewed/ added, if any.
    contactID: null,
    contactName: null,
    contactEmail: null,



    showHidePleaseWait: function (inVisible: boolean): void {
      this.setState({ pleaseWaitVisible: inVisible });
    }.bind(inParentComponent),


    showContact : function(inID: string, inName: string,inEmail: string): void {
      this.setState({ currentView : "contact", contactID :inID,contactName : inName, contactEmail : inEmail });
    }.bind(inParentComponent),


    showAddContact: function (): void {
      this.setState({ currentView: "contactAdd", contactID: null, contactName: "", contactEmail: "" });
    }.bind(inParentComponent), 



    showMessage: async function (inMessage: IMAP.IMessage): Promise<void> {

      // message body from the server
      this.state.showHidePleaseWait(true);
      const imapWorker: IMAP.Worker = new IMAP.Worker();
      const mb: String = await imapWorker.getMessageBody(inMessage.id, this.state.currentMailbox);
      this.state.showHidePleaseWait(false);

      this.setState({
        currentView: "message",
        messageID: inMessage.id, messageDate: inMessage.date, messageFrom: inMessage.from,
        messageTo: "", messageSubject: inMessage.subject, messageBody: mb
      });

      //console.log("showMessage");

    }.bind(inParentComponent),


    showComposeMessage: function (inType: string): void {

      switch (inType) {

        // new message from the toolbar.tsx
        // messageTo, messageSubject, messageBody - empty them out
        case "new":
          this.setState({
            currentView: "compose",
            messageTo: "", messageSubject: "", messageBody: "",
            messageFrom: config.userEmail
          });
          break;

        // reply to an existing email from the emails
        case "reply":
          this.setState({
            currentView: "compose",
            messageTo: this.state.messageFrom, messageSubject: `Re: ${this.state.messageSubject}`,
            messageBody: `\n\n---- Original Message ----\n\n${this.state.messageBody}`, messageFrom: config.userEmail
          });
          break;


        // possible when user is viewing a contact and wants to send email to that contact
        case "contact":
          this.setState({
            currentView: "compose",
            messageTo: this.state.contactEmail, messageSubject: "", messageBody: "",
            messageFrom: config.userEmail
          });
          break;

      }
      
    }.bind(inParentComponent), 

    // Lists of Mailbox, messages, and contacts

    addMailboxToList: function (inMailbox: IMAP.IMailbox): void {
      // console.log("Adding mailbox:", inMailbox);

      // this creates a shallow copy this.state.mailboxes
      const cl: IMAP.IMailbox[] = this.state.mailboxes.slice(0);
      cl.push(inMailbox);
      // to show the updated mailbox list on the left - (does not happen because the entire page is rendered only after all the mailboxes are loaded according to main.tsx )
      this.setState({ mailboxes: cl });

    }.bind(inParentComponent), 


    addContactToList: function (inContact: Contacts.IContact): void {

      const cl = this.state.contacts.slice(0);
      cl.push({ _id: inContact._id, name: inContact.name, email: inContact.email });
      this.setState({ contacts: cl });
    }.bind(inParentComponent),

    addMessageToList: function (inMessage: IMAP.IMessage): void {
      this.setState((prevState: { messages: any; }) => ({
      messages: [...prevState.messages, { 
      id: inMessage.id, 
      date: inMessage.date, 
      from: inMessage.from, 
      subject: inMessage.subject 
      }],
    }));
    }.bind(inParentComponent),


    clearMessages: function (): void {
      this.setState({ messages: [] });
    }.bind(inParentComponent),




    setCurrentMailbox: function (inPath: String): void {
      // Update state.
      // because until the user selects a message, there’s nothing to show in the view area which defaulted to the welcome view.
      this.setState({ currentView: "welcome", currentMailbox: inPath });

      // Now go get the list of messages for the mailbox.
      this.state.getMessages(inPath);

    }.bind(inParentComponent),



    getMessages: async function (inPath: string): Promise<void> {
      try {
        this.state.showHidePleaseWait(true);
        const imapWorker: IMAP.Worker = new IMAP.Worker();
        const messages: IMAP.IMessage[] = await imapWorker.listMessages(inPath);
        this.state.showHidePleaseWait(false);

        console.log(messages.length);
        console.log("Request path:", inPath);
        this.state.clearMessages(); // clear any current list of messages
        messages.forEach((inMessage: IMAP.IMessage) => {
          // console.log(inMessage);
          this.state.addMessageToList(inMessage);
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
        this.state.showHidePleaseWait(false); // Ensure to hide the "Please Wait" spinner in case of an error
        }
      }.bind(inParentComponent),


    //when the user wants to edit a field
    fieldChangeHandler: function (inEvent: any): void {
      //max length for contact name.
      if (inEvent.target.id === "contactName" && inEvent.target.value.length > 16) { return; }

      this.setState({ [inEvent.target.id]: inEvent.target.value });

    }.bind(inParentComponent), 


    saveContact: async function (): Promise<void> {
      const cl = this.state.contacts.slice(0);

      // Save to server.
      this.state.showHidePleaseWait(true);
      const contactsWorker: Contacts.Worker = new Contacts.Worker();
      const contact: Contacts.IContact =
        await contactsWorker.addContact({ name: this.state.contactName, email: this.state.contactEmail });
      this.state.showHidePleaseWait(false);

      cl.push(contact);
      this.setState({ contacts: cl, contactID: null, contactName: "", contactEmail: "" });

    }.bind(inParentComponent), 


    deleteContact: async function (): Promise<void> {

      // Delete from server.
      this.state.showHidePleaseWait(true);
      const contactsWorker: Contacts.Worker = new Contacts.Worker();
      await contactsWorker.deleteContact(this.state.contactID);
      this.state.showHidePleaseWait(false);

      const cl = this.state.contacts.filter((inElement: { _id: any; }) => inElement._id != this.state.contactID);
      this.setState({ contacts: cl, contactID: null, contactName: "", contactEmail: "" });

    }.bind(inParentComponent), 
    
    updateContact: async function (this: any): Promise<void> {
      try {
        this.state.showHidePleaseWait(true);
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        const contact: Contacts.IContact = await contactsWorker.updateContact({
        _id: this.state.contactID,
        name: this.state.contactName,
        email: this.state.contactEmail
      });
      this.state.showHidePleaseWait(false);

      // Remove from list.
      const cl = this.state.contacts.slice(0);
      const new_cl = cl.filter((inElement: { _id: any; }) => inElement._id != this.state.contactID);
      new_cl.push(contact);
      this.setState({ contacts: new_cl, contactID: contact._id, contactName: contact.name, contactEmail: contact.email });

      } catch (error) {
        console.error("Error updating contact:", error);
        this.state.showHidePleaseWait(false);
      }
    }.bind(inParentComponent),


    deleteMessage: async function (): Promise<void> {

      // Delete from server.
      this.state.showHidePleaseWait(true);
      const imapWorker: IMAP.Worker = new IMAP.Worker();
      await imapWorker.deleteMessage(this.state.messageID, this.state.currentMailbox);
      this.state.showHidePleaseWait(false);

      const cl = this.state.messages.filter((inElement: { id: any; }) => inElement.id != this.state.messageID);
      this.setState({ messages: cl, currentView: "welcome" });

    }.bind(inParentComponent),


    sendMessage: async function (): Promise<void> {

      // use SMTP to send a message
      this.state.showHidePleaseWait(true);
      const smtpWorker: SMTP.Worker = new SMTP.Worker();
      await smtpWorker.sendMessage(this.state.messageTo, this.state.messageFrom, this.state.messageSubject,
        this.state.messageBody
      );
      this.state.showHidePleaseWait(false);

      // Update state.
      this.setState({ currentView: "welcome" });

    }.bind(inParentComponent)
  };

} 


