// // A React component that houses all others.
// // React imports.
// import React, { Component } from "react";

// // Library imports.
// // import Dialog from "@material-ui/core/Dialog";
// import Dialog from "@mui/material/Dialog";
// import DialogContent from "@mui/material/DialogContent";
// import DialogContentText from "@mui/material/DialogContentText";
// import DialogTitle from "@mui/material/DialogTitle";

// // App imports.
// import Toolbar from "./Toolbar";
// import MailboxList from "./MailboxList";
// import MessageList from "./MessageList";
// import ContactList from "./ContactList";
// import WelcomeView from "./WelcomeView";
// import ContactView from "./ContactView";
// import MessageView from "./MessageView";
// import { createState } from "../state";


// /**
//  * BaseLayout.
//  */
// class BaseLayout extends Component {


//   /**
//    * State data for the app.  This also includes all mutator functions for manipulating state.  That way, we only
//    * ever have to pass this entire object down through props (not necessarily the best design in terms of data
//    * encapsulation, but it does have the benefit of being quite a bit simpler).
//    */
//   state = createState(this);


//   // // Adding methods to manipulate the state directly
//   // showHidePleaseWait(inVisible: boolean) {
//   //   this.setState({ pleaseWaitVisible: inVisible });
//   // }

//   // addMailboxToList(mailbox: any) {
//   //   this.setState(prevState => ({
//   //     mailboxes: [...prevState.mailboxes, mailbox]
//   //   }));
//   // }

//   // addContactToList(contact: any) {
//   //   this.setState(prevState => ({
//   //     contacts: [...prevState.contacts, contact]
//   //   }));
//   // }

  
//   render() {

//     return (
    
//      <div className="appContainer">
//       <Dialog   open={this.state.pleaseWaitVisible} onClose={() => {}} transitionDuration = { 0 }>
//         <DialogTitle style={{ textAlign:"center" }}>Please Wait</DialogTitle>
//         <DialogContent><DialogContentText>...Contacting server...</DialogContentText></DialogContent>
//       </Dialog>

//        <div className="toolbar"><Toolbar state={ this.state } /></div>

//        <div className="mailboxList"><MailboxList state={ this.state } /></div>

//        <div className="centerArea">
//         <div className="messageList"><MessageList state={ this.state } /></div>
//         <div className="centerViews">
//           { this.state.currentView === "welcome" && <WelcomeView /> }
//           { (this.state.currentView === "message" || this.state.currentView === "compose") &&
//             <MessageView state={ this.state } />
//           }
//           { (this.state.currentView === "contact" || this.state.currentView === "contactAdd") &&
//             <ContactView state={ this.state } />
//           }
//         </div>
//        </div>

//        <div className="contactList"><ContactList state={ this.state } /></div>

//      </div>
//     );

//   } /* End render(). */


// } /* End class. */


// export default BaseLayout;

import React, { Component } from "react";

// Library imports
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

// App imports
import Toolbar from "./Toolbar";
import MailboxList from "./MailboxList";
import MessageList from "./MessageList";
import ContactList from "./ContactList";
import WelcomeView from "./WelcomeView";
import ContactView from "./ContactView";
import MessageView from "./MessageView";
import { createState } from "../state";
import { IAppState } from "../state"; 

class BaseLayout extends Component<{}, IAppState>  {
  constructor(props: {}) {
    super(props);
    this.state = createState(this);
    // this.state = createState(this.setState.bind(this));
  }

render(){
    return (
    <div className="appContainer">
      <Dialog open={this.state.pleaseWaitVisible} onClose={() => {}} transitionDuration={0}>
        <DialogTitle style={{ textAlign: "center" }}>Please Wait</DialogTitle>
        <DialogContent>
          <DialogContentText>...Contacting server...</DialogContentText>
        </DialogContent>
      </Dialog>

      <div className="toolbar"><Toolbar state={this.state} /></div>

      <div className="mailboxList"><MailboxList state={this.state} /></div>

      <div className="centerArea">
        <div className="messageList"><MessageList state={this.state} />hello here</div>
 <div className="centerViews">
            {this.state.currentView === "welcome" && <WelcomeView />}
            {(this.state.currentView === "message" || this.state.currentView === "compose") && (
              <MessageView state={this.state} />
            )}
            {(this.state.currentView === "contact" || this.state.currentView === "contactAdd") && (
              <ContactView state={this.state} />
            )}
          </div>
      </div>

      <div className="contactList"><ContactList state={this.state} /></div>
    </div>
  );
};

}

export default BaseLayout;
