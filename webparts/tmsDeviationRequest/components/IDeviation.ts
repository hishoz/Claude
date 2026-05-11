// src/webparts/ukBookshelf/components/IDeviation.ts
import { WebPartContext } from '@microsoft/sp-webpart-base';

/** Props passed into the TmsDeviationRequest component */
// export interface ITmsDeviationRequestProps {
//   context: WebPartContext;

//   /** Web URL that hosts both lists (e.g., "/bookshelf/TAQABrataniBookshelf") */
//   tmsSiteUrl: string;

//   /** TMS Documents list title */
//   tmsDocumentsListTitle: string;

//   /** Register list title */
//   registerListTitle: string;

//   /** Redirect here after successful submit; defaults to current web */
//   redirectUrl?: string;

//   /** If TMSDocumentId is a lookup column in the register, set true so we use TMSDocumentIdId */
//   tmsDocumentIdIsLookup?: boolean;
// }

/** Minimal shape for the people picker suggestion/user */
export interface IPeoplePickerUser {
  id: number;            // SharePoint user ID
  loginName: string;     // i:0#.f|membership|user@tenant
  text: string;          // Display name
  email?: string;
}

/** Option produced from TMS Documents list to drive the ComboBox */
export interface IDocumentSuggestion {
  key: number;           // Item ID in TMS Documents
  text: string;          // Document No (FileLeafRef without extension)
  element:string;
  docOwner:string;
  title?: string;        // Document Title
  url?: string;          // EncodedAbsUrl
}

/** In-memory form state */
export interface IDeviationFormData {
  requestor: IPeoplePickerUser | null;
  requestorRole: string;

  documentNo: IDocumentSuggestion | null;
  documentTitle: string;

  devRequestLoc: string;

  relatedToCompetence: '' | '0' | '1'; // 0 = No, 1 = Yes
  justification: string;

  deviationPeriod: '' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

  referenceNumber?: string;

  riskAssessed: '' | '0' | '1'; // 0 = No, 1 = Yes
  riskAssessment: string;

  assessors: IPeoplePickerUser[];
  approver: IPeoplePickerUser | null;

  attachment?: File | null;
}

/** Contract for the Service methods used by the component */
export interface IDeviationService {
  init(context: WebPartContext): void;

  getCurrentUserProfile(): Promise<{
    loginName: string;
    jobTitle: string;
    displayName: string;
    id: number;
  }>;

  searchUsers(query: string): Promise<IPeoplePickerUser[]>;

  ensureUsers(logins: string[]): Promise<IPeoplePickerUser[]>;

  getTmsDocumentSuggestions(webUrl: string, listTitle: string): Promise<IDocumentSuggestion[]>;

  createDeviationItem(
    webUrl: string,
    listTitle: string,
    data: IDeviationFormData,
    tmsDocumentItemId?: number,
    tmsDocumentIdIsLookup?: boolean,
    riskAssessedIsBoolean?: boolean
  ): Promise<number>;

  uploadAttachment(
    webUrl: string,
    listTitle: string,
    itemId: number,
    file: File
  ): Promise<void>;
}