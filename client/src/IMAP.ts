
import axios, { AxiosResponse } from "axios";


import { config } from "./config";


// Interface for a mailbox
export interface IMailbox { name: string, path: string }


// interface for messages
export interface IMessage {
  id: string,
  date: string,
  from: string,
  subject: string,
  body?: string
}


export class Worker {

  // list of all mailboxes - inbox, all mail, spam, trash
  public async listMailboxes(): Promise<IMailbox[]> {
    const response: AxiosResponse = await axios.get(`${config.serverAddress}/mailboxes`);
    console.log(response.data)
    return response.data;
  }

  // messages in a particular mailbox
  public async listMessages(inMailbox: string): Promise<IMessage[]> {
    const response: AxiosResponse = await axios.get(`${config.serverAddress}/mailboxes/${inMailbox}`);

    console.log(response.data.message);
    return response.data;
  }

  // get a message body
  public async getMessageBody(inID: string, inMailbox: String): Promise<string> {
    const response: AxiosResponse = await axios.get(`${config.serverAddress}/messages/${inMailbox}/${inID}`);
    return response.data;
  }

  // delete a message
  public async deleteMessage(inID: string, inMailbox: String): Promise<void> {
    await axios.delete(`${config.serverAddress}/messages/${inMailbox}/${inID}`);
  } 


}