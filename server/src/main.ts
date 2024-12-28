// the main entry point and constitute the API the server presents to the client 

// core Node module imports.
import path from "path";
// Express and some Express-related things imports.
import express, { Express, NextFunction, Request, Response } from "express";
// App imports.
import { serverInfo } from "./ServerInfo";
import * as IMAP from "./IMAP";
import * as SMTP from "./SMTP";
import * as Contacts from "./Contacts";
import { IContact } from "./Contacts";

// creates our Express app.
const app: Express = express();

// add some middleware to Express
// Handle JSON in request bodies.
app.use(express.json());

// Serve the client to a requested browser.
// The static middleware is a built-in middleware for serving static resources. 
// __dirname is the directory the current script is in
app.use("/", express.static(path.join(__dirname, "../../client/dist")));

// Enable CORS so that we can call the API even from anywhere.
// CORS is a security mechanism ensures that only certain domains can call REST services. 
app.use(function (inRequest: Request, inResponse: Response, inNext: NextFunction) {
    inResponse.header("Access-Control-Allow-Origin", "*"); // asterisk means browser will allow the call regardless of where it’s launched from. 
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS"); // Http methods we will accept from clients
    inResponse.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept"); // accept additional header
    inNext(); // continue the middleware chain, so the request can continue to be processed as required
});


// REST Endpoint: List Mailboxes
// Express app is acting as a proxy to the IMAP (and also SMTP and Contacts) object
app.get("/mailboxes", // app.get() is used to register 'get' path, /mailboxes is a logical choice for the path
    async (inRequest: Request, inResponse: Response) => {
        try {
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
            inResponse.status(200);
            inResponse.json(mailboxes); // marshals array into JSON and returns to the caller
        } catch (inError) {
            inResponse.status(400);
            console.log("could not get any mailbox ");
            inResponse.send("error"); // send a plain text "error" response back if any exceptions be thrown
        }
    }
);

// REST Endpoint: List Messages
app.get("/mailboxes/:mailbox", // specify the name of the mailbox to get messages for
    async (inRequest: Request, inResponse: Response) => {
        try {
            
            let mailboxName = inRequest.params.mailbox;
            // Check if the mailbox is not 'INBOX' or '[Gmail]'
            // let finalMailboxName = mailboxName;
            // if (mailboxName !== "INBOX" && mailboxName !== "[Gmail]") {
            // finalMailboxName = `[Gmail]/${mailboxName}`; // Append '[Gmail]/' to the mailbox name
            // }

            if (mailboxName.startsWith("[Gmail]/")) {
                mailboxName = mailboxName.slice(8); // Remove the first 8 characters '[Gmail]/'
            }

            console.log("Mailbox name after modification: " + mailboxName);

            console.log("==== >"+inRequest.params.mailbox);
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            const messages: IMAP.IMessage[] = await imapWorker.listMessages({
                mailbox: mailboxName // access dynamic value after /mailboxes/
            });
            console.log("imap worker"+imapWorker);
            inResponse.status(200);
            inResponse.json(messages);
        } catch (inError) {
            inResponse.status(400);
            console.log("could not get that particular mailbox "+inError);
            inResponse.send("error");
        }
    }
);

// REST Endpoint: Get a Message
app.get("/messages/:mailbox/:id",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            const messageBody: string = await imapWorker.getMessageBody({
                mailbox: inRequest.params.mailbox, //  the name of the mailbox 
                id: parseInt(inRequest.params.id, 10) // the ID of the message (str -> int)
            });
            inResponse.status(200);
            inResponse.send(messageBody); // returned as plain text 
        } catch (inError) {
            inResponse.status(400);
            console.log("could not get that particular message");
            inResponse.send("error");
        }
    }
);

// REST Endpoint: Delete a Message
// the app.delete() method is used to register this endpoint.
app.delete("/messages/:mailbox/:id",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
            await imapWorker.deleteMessage({
                mailbox: inRequest.params.mailbox,
                id: parseInt(inRequest.params.id, 10)
            });
            inResponse.status(200);
            inResponse.send("ok");
        } catch (inError) {
            inResponse.status(400);
            console.log("could not delete that particular message 1");
            inResponse.send("error");
        }
    }
);

// REST Endpoint: Send a Message
// app.post() is used to send a message
// IMAP protocol: retrieving mailboxes and messages
// SMTP protocol: send messages
app.post("/messages",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);
            await smtpWorker.sendMessage(inRequest.body);
            inResponse.status(201);
            inResponse.send("ok");
        } catch (inError) {
            inResponse.status(400);
            console.log("can't send the message"+inError);
            inResponse.send("error");
            
        }
    }
);

// REST Endpoint: List Contacts
app.get("/contacts",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            const contacts: IContact[] = await contactsWorker.listContacts();
            inResponse.status(200);
            inResponse.json(contacts);
        } catch (inError) {
            inResponse.status(400);
            inResponse.send("error");
        }
    }
);

// REST Endpoint: Add Contact
app.post("/contacts",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            const contact: IContact = await contactsWorker.addContact(inRequest.body); // contain a unique identifier
            inResponse.status(201);
            inResponse.json(contact);
        } catch (inError) {
            inResponse.status(400);
            inResponse.send("error");
        }
    }
);

// REST Endpoint: Update Contacts
app.put("/contacts",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            const contact: IContact = await contactsWorker.updateContact(inRequest.body);
            inResponse.status(202);
            inResponse.json(contact);
        } catch (inError) {
            inResponse.status(400);
            inResponse.send("error");
        }
    }
);

// REST Endpoint: Delete Contact
app.delete("/contacts/:id",
    async (inRequest: Request, inResponse: Response) => {
        try {
            const contactsWorker: Contacts.Worker = new Contacts.Worker();
            await contactsWorker.deleteContact(inRequest.params.id); // includes the ID of the contact to delete
            inResponse.status(200);
            inResponse.send("ok");
        } catch (inError) {
            inResponse.status(400);
            inResponse.send("error");
        }
    }
);

// Start app listening.
app.listen(80, () => {
    console.log("MailBag server open for requests");
});