import { SPHttpClient, MSGraphClientV3, HttpClient } from "@microsoft/sp-http";
import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IUkBookshelfProps {
  graphHttpClient: MSGraphClientV3;
  webClient: HttpClient;
  spHttpClient: SPHttpClient;
  pageSize: number;
  context: WebPartContext;
  redirectUrl?: string
  /** If TMSDocumentId is a lookup column in the register, set true so we use TMSDocumentIdId */
  tmsDocumentIdIsLookup?: boolean;
}
