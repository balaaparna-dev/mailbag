import axios, { AxiosResponse } from "axios";

import { config } from "./config";

// Define interface to describe a contact. 
// Note that we'll only have an _id field when retrieving or adding, so it has to be optional.

//interface to describe contact
export interface IContact { 
  _id?: number,
  name: string,
  email: string
}


// perform contact operations
export class Worker {


  public async listContacts(): Promise<IContact[]> {
    // axios architecturally serve the MailBag client application abstracted from the server
    const response: AxiosResponse = await axios.get(`${config.serverAddress}/contacts`);
    return response.data;
  } 

  public async addContact(inContact: IContact): Promise<IContact> {
    // inContact is the second argument, axios serializes it to JSON and send it in the request body
    const response: AxiosResponse = await axios.post(`${config.serverAddress}/contacts`, inContact);
    return response.data;
  } 

  public async updateContact(inContact: IContact): Promise<IContact> {
    const response: AxiosResponse = await axios.put(`${config.serverAddress}/contacts`, inContact);
    return response.data;
  } 

  public async deleteContact(inID: number): Promise<void> {
    await axios.delete(`${config.serverAddress}/contacts/${inID.toString()}`);
  } 

}