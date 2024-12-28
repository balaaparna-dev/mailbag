// talks to an IMAP server to list mailboxes and messages and to retrieve messages

// Library imports.
import { ParsedMail } from "mailparser";
const ImapClient = require("emailjs-imap-client");
import { simpleParser } from "mailparser";

// App imports.
import { IServerInfo } from "./ServerInfo";

// Define interface to describe a mailbox and optionally a specific message
// all functions require the mailbox name, but only retrieving and deleting a message requires the ID.
export interface ICallOptions {
    mailbox: string,
    id?: number
}

// Define interface to describe a received message.  
// Note that body is optional since it isn't sent when listing messages.
export interface IMessage {
    id: string,
    date: string,
    from: string,
    subject: string,
    body?: string
}

// Define interface to describe a mailbox.
export interface IMailbox {
    name: string,
    path: string // path is how code will identify a mailbox for operations
}

// Disable certificate validation (less secure, but needed for some servers).
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


// The worker that will perform IMAP operations and interact with main.ts.
export class Worker {
    private static serverInfo: IServerInfo;
    constructor(inServerInfo: IServerInfo) {
        Worker.serverInfo = inServerInfo;
    } // the server information is passed in to the constructor and stored.

    // private async connectToServer(): Promise<any> {
         
    //     const client: any = new ImapClient.default(
    //         Worker.serverInfo.imap.host,
    //         Worker.serverInfo.imap.port,
    //         { auth: Worker.serverInfo.imap.auth, tls:true } // pass in a username and password
    //     );
    //     console.log("listmailboxes - IMAP",client);
    //     client.logLevel = client.LOG_LEVEL_NONE; // keep the output logging
    //     client.onerror = (inError: Error) => {
    //         console.log("IMAP.Worker.listMailboxes(): Connection error", inError);
    //     }; // error handler without re-trying
    //     await client.connect();
    //     return client;
    // } 

    private async connectToServer(): Promise<any> {
    const client: any = new ImapClient.default(
      Worker.serverInfo.imap.host,
      Worker.serverInfo.imap.port,
      {
        auth: Worker.serverInfo.imap.auth,
        secure: true, // Ensure TLS is used for secure connection
      }
    );

    client.logLevel = client.LOG_LEVEL_NONE;
    client.onerror = (inError: Error) => {
      console.log("IMAP.Worker.listMailboxes(): Connection error", inError);
    };

    
    try {
      await client.connect();
      console.log("Connection attempt finished.");
    } catch (error) {
      console.error("Connection failed:", error);
    }
    return client;
  }



    public async listMailboxes(): Promise<IMailbox[]> {
        const client: any = await this.connectToServer(); // get a client
       
        const mailboxes: any = await client.listMailboxes(); // get the list
        await client.close();
        // Translate from emailjs-imap-client mailbox objects to app-specific objects. 
        // At the same time, flatten the list of mailboxes to a one-dimensional array of objects via iterateChildren function recursion.
        const finalMailboxes: IMailbox[] = [];
        const iterateChildren: Function = (inArray: any[]): void => {
            // For each mailbox encountered, added new object that contains jname and path to finalMailboxes
            inArray.forEach((inValue: any) => {
                console.log(inValue);
                finalMailboxes.push({
                    name: inValue.name,
                    path: inValue.path
                });
                iterateChildren(inValue.children); // handle with children property
            });
        };


        iterateChildren(mailboxes.children);
        return finalMailboxes;
    } 


    public async listMessages(inCallOptions: ICallOptions): Promise<IMessage[]> {
    const client: any = await this.connectToServer();
    console.log(inCallOptions);
    try {
        // Select the mailbox before attempting to fetch messages
        const mailbox = await client.selectMailbox(inCallOptions.mailbox);
        console.log("Mailbox selected:", mailbox);

        // If the mailbox exists, proceed to fetch messages
        if (mailbox.exists > 0) {
            const messages: any[] = await client.listMessages(
                inCallOptions.mailbox,   // Mailbox name
                "1:*",                   // Fetch all messages starting from message 1
                ["uid", "envelope"]      // Fetch basic message metadata (UID, envelope)
            );
            // Close the connection after fetching messages
            await client.close();
            // Transform raw message objects into a more usable format
            const finalMessages: IMessage[] = messages.map(inValue => ({
                id: inValue.uid,
                date: inValue.envelope.date,
                from: inValue.envelope.from[0].address,
                subject: inValue.envelope.subject
            }));


            return finalMessages;
        } else {
            console.log("No messages found in this mailbox.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw error;
    }
    }

    public async getMessageBody(inCallOptions: ICallOptions): Promise<string> {
        const client: any = await this.connectToServer();
        console.log("++");
        const messages: any[] = await client.listMessages(
            inCallOptions.mailbox,
            inCallOptions.id, // specifying a specific message ID 
            ["body[]"], // body can be in multiple parts, it’s actually an array
            { byUid: true } // listing messages based on a specific ID
        );
        const parsed: ParsedMail = await simpleParser(messages[0]["body[]"]); // parses the message into a ParsedMail object
        await client.close();
        return parsed.text!; // return the text property of that object
    }

    public async deleteMessage(inCallOptions: ICallOptions): Promise<any> {
        const client: any = await this.connectToServer();
        const messages: any[] = await client.listMessages(
            inCallOptions.mailbox,
            inCallOptions.id, // specifying a specific message ID 
            ["uid"], // body can be in multiple parts, it’s actually an array
            { byUid: true } // listing messages based on a specific ID
        );
        if (inCallOptions.mailbox !== 'Deleted'){
            await client.copyMessages(
                inCallOptions.mailbox,
                messages[0]['uid'],
                'Deleted',
                { byUid: true } // tell the method that we are passing a unique ID
            );
        }
        await client.deleteMessages(
            inCallOptions.mailbox,
            messages[0]['uid'],
            // inCallOptions.id,
            { byUid: true } // tell the method that we are passing a unique ID
        );
        await client.close(); // no return
    }

}