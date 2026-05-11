import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface ITmsDeviationRequestProps {
  context: WebPartContext;

  /** Redirect here after successful submit; defaults to current web */
  redirectUrl?: string;

  /** If TMSDocumentId is a lookup column in the register, set true so we use TMSDocumentIdId */
  tmsDocumentIdIsLookup?: boolean;
}
