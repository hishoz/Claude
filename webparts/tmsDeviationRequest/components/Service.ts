
import "@pnp/sp/files";
import "@pnp/sp/folders";
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/attachments';
import '@pnp/sp/site-users/web';
import '@pnp/sp/profiles';


import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPHttpClient } from '@microsoft/sp-http'
import { SPFI, spfi, SPFx } from "@pnp/sp";

import {
  IDeviationFormData,
  IDocumentSuggestion,
  IPeoplePickerUser,
  IDeviationService
} from '../../tmsDeviationRequest/components/IDeviation';


let _sp: SPFI;
let _context: WebPartContext;


export const DeviationService: IDeviationService = {
  init(context: WebPartContext) {
    _context = context;
    _sp = spfi().using(SPFx(context));
  },
  async getCurrentUserProfile() {
    // ✅ INVOKE currentUser() and SELECT properties to get a data object
    const me = await _sp.web.currentUser.select('Id', 'Title', 'LoginName', 'Email')();
    const id = me?.Id;
    const loginName = me?.LoginName || _context.pageContext.user.loginName;
    const displayName = me?.Title || _context.pageContext.user.displayName;
    // Try to get SPS-JobTitle from user profile
    let jobTitle = '';
    try {
      const myProps = await _sp.profiles.myProperties();
      const props = myProps?.UserProfileProperties || [];
      const jt = props.find((p: any) => p.Key === 'SPS-JobTitle');
      jobTitle = jt?.Value || '';
    } catch {
      // swallow
    }
    return {
      loginName,
      jobTitle,
      displayName,
      id
    };
  },
  /**
   * SharePoint Client People Picker endpoint for suggestions.
   */
  // async searchUsers(query: string): Promise<IPeoplePickerUser[]> {
  //   if (!query || query.length < 2) return [];
  //   const endpoint = `${_context.pageContext.web.absoluteUrl}/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.ClientPeoplePickerSearchUser`;
  //   const body = {
  //     queryParams: {
  //       QueryString: query,
  //       MaximumEntitySuggestions: 25,
  //       AllowEmailAddresses: true,
  //       AllowMultipleEntities: true,
  //       PrincipalType: 1 + 2 + 4 + 8, // User=1, DL=2, SecGroup=4, SPGroup=8
  //       PrincipalSource: 15
  //     }
  //   };
  //   const options: ISPHttpClientOptions = {
  //     headers: {
  //       'accept': 'application/json;odata=nometadata',
  //       'content-type': 'application/json;odata=nometadata'
  //     },
  //     body: JSON.stringify(body)
  //   };
  //   const res = await _context.spHttpClient.post(endpoint, SPHttpClient.configurations.v1, options);
  //   const text = await res.text();
  //   // Endpoint returns a JSON string; normalize parsing
  //   let raw: any[] = [];
  //   try {
  //     const parsed = JSON.parse(text);
  //     raw = Array.isArray(parsed) ? parsed : JSON.parse(parsed?.value ?? '[]');
  //   } catch {
  //     raw = [];
  //   }
  //   const users: IPeoplePickerUser[] = raw
  //     .filter((r: any) => r.EntityType === 'User')
  //     .map((r: any) => ({
  //       id: 0, // will resolve via ensureUsers
  //       loginName: r.Key,
  //       text: r.DisplayText,
  //       email: r.Description
  //     }));
  //   return users;
  // },

  async searchUsers(query: string): Promise<IPeoplePickerUser[]> {
    const q = encodeURIComponent(`'${query}*'`);
    const url =
      `${_context.pageContext.web.absoluteUrl}/_api/search/query?querytext=${q}` +
      `&selectproperties='AccountName,PreferredName,WorkEmail'` +
      `&sourceid='B09A7990-05EA-4AF9-81EF-EDFAB16C4E31'` +
      `&rowlimit=25`;

    const res = await _context.spHttpClient.get(url, SPHttpClient.configurations.v1);
    const json = await res.json();

    const rows = json.PrimaryQueryResult.RelevantResults.Table.Rows || [];
    return rows.map((row: { Cells: any[]; }) => {
      const obj: any = {};
      row.Cells.forEach((c: any) => (obj[c.Key] = c.Value));

      return {
        id: 0,
        loginName: obj.AccountName,
        text: obj.PreferredName,
        email: obj.WorkEmail
      };
    });
  },
  /** Ensure an array of logins exist in the site, returning their user IDs. */
  async ensureUsers(logins: string[]): Promise<IPeoplePickerUser[]> {
    const ensured: IPeoplePickerUser[] = [];

    for (const login of logins) {
      const u = await _sp.web.ensureUser(login);

      ensured.push({
        id: u.data.Id,
        loginName: u.data.LoginName,
        text: u.data.Title,
        email: u.data.Email
      });
    }

    return ensured;
  },

  /** Load TMS Documents as suggestions (Document No = FileLeafRef without extension). */
  // async getTmsDocumentSuggestions(webUrl: string, listTitle: string): Promise<IDocumentSuggestion[]> {
  //   // ✅ Use .web before .lists
  //   const spWeb = spfi(webUrl).using(SPFx(_context));
  //   const items = await spWeb.web.lists
  //     .getByTitle(listTitle)
  //     .items
  //     .select('Id', 'Title', 'FileLeafRef', 'EncodedAbsUrl', 'ContentType/Name')
  //     .expand('ContentType')
  //     .filter(`ContentType/Name eq 'TMS Documents'`)
  //     .top(5000)();
  //   const suggestions: IDocumentSuggestion[] = items.map((i: any) => {
  //     const fileLeaf: string = i.FileLeafRef || '';
  //     const docNo = fileLeaf.includes('.') ? fileLeaf.substring(0, fileLeaf.lastIndexOf('.')) : fileLeaf;
  //     return {
  //       key: i.Id,
  //       text: docNo,
  //       title: i.Title,
  //       url: i.EncodedAbsUrl
  //     };
  //   });
  //   suggestions.sort((a, b) => a.text.localeCompare(b.text));
  //   return suggestions;
  // },

  async getTmsDocumentSuggestions(webUrl: string, listTitle: string): Promise<IDocumentSuggestion[]> {
    const spWeb = spfi(webUrl).using(SPFx(_context));

    const items = await spWeb.web.lists
      .getByTitle(listTitle)
      .items
      .select('Id', 'Title', 'FileLeafRef', 'EncodedAbsUrl', 'TBDocOwner/Title'
        , "TBPrimaryElement/ActualValue")
      .filter("ContentType eq 'TMS Documents'") 
     // .filter(`ContentType/Name eq 'TMS Documents'`)
      .expand('TBPrimaryElement', 'TBDocOwner')
      .top(5000)();

    const suggestions: IDocumentSuggestion[] = items.map((i: any) => {
      const fileLeaf: string = i.FileLeafRef || '';
      const docNo = fileLeaf.includes('.')
        ? fileLeaf.substring(0, fileLeaf.lastIndexOf('.'))
        : fileLeaf;

      return {
        key: i.Id,
        text: docNo,
        element: i.TBPrimaryElement.ActualValue,
        docOwner: i.TBDocOwner!=undefined?i.TBDocOwner.Title:"",
        title: i.Title,
        url: i.EncodedAbsUrl
      };
    });

    suggestions.sort((a, b) => a.text.localeCompare(b.text));
    return suggestions;
  },
  /**
   * Create item in "TMS Document Deviation Register"
   */
  async createDeviationItem(
    webUrl: string,
    listTitle: string,
    data: IDeviationFormData,
    tmsDocumentItemId?: number,
    riskAssessedIsBoolean: boolean = true
  ): Promise<number> {
    // ✅ Use .web before .lists
    const spWeb = spfi(webUrl).using(SPFx(_context));

    const today = new Date();
    // If the field is Date only, prefer a date-only string:
    const toDateOnly = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD

    // Ensure users and get IDs
    const approverEnsured = data.approver ? await this.ensureUsers([data.approver.loginName]) : [];
    const requestorEnsured = data.requestor ? await this.ensureUsers([data.requestor.loginName]) : [];
    const assessorsEnsured = data.assessors?.length ? await this.ensureUsers(data.assessors.map(a => a.loginName)) : [];
    const approverId = approverEnsured[0]?.id;
    const requestorId = requestorEnsured[0]?.id;
    const assessorIds = assessorsEnsured.map((a: { id: any; }) => a.id);
    // RiskAssessed mapping
    const riskAssessedBool = data.riskAssessed === '1';
    const riskAssessedValue = riskAssessedIsBoolean ? riskAssessedBool : (riskAssessedBool ? 'Yes' : 'No');
    const payload: any = {
      Title: data.documentNo?.text || '',
      DocumentTitle: data.documentTitle || '',
      RequestorRole: data.requestorRole || '',
      ReferenceNumber: data.referenceNumber || '',
      DocumentNumber: data.documentNo?.text || '',
      DeviationRequestArea: data.devRequestLoc || '',
      Justification: data.justification || '',
      RiskAssessed: riskAssessedValue,
      RiskAssessment: data.riskAssessment || '',
      Status: 'Awaiting Approval',
      DeviationPeriod: data.deviationPeriod || '',
      Element: data.documentNo?.element || '',
      DocumentOwner: data.documentNo?.docOwner || '',
      DateRequestedorExtended: toDateOnly(today)
    };
    if (requestorId) payload['RequestorNameId'] = requestorId;
    if (approverId) payload['TMSDeviationApproverId'] = approverId;
    //if (assessorIds.length > 0) payload['RiskAssessorsId'] = { results: assessorIds };
    // if (tmsDocumentItemId) {
    //   if (tmsDocumentIdIsLookup) {
    payload['TMSDocumentIdId'] = tmsDocumentItemId;
    //   } else {
    //payload['TMSDocumentId'] = tmsDocumentItemId;
    //   }
    // }
    payload['RiskAssessorsId'] = assessorIds;
    const addRes = await spWeb.web.lists.getByTitle(listTitle).items.add(payload);
    return addRes.data?.Id;
  },
  /** Upload a single attachment to the created list item */
  async uploadAttachment(webUrl: string, listTitle: string, itemId: number, file: File): Promise<void> {
    // ✅ Use .web before .lists
    const spWeb = spfi(webUrl).using(SPFx(_context));
    await spWeb.web.lists.getByTitle(listTitle).items.getById(itemId).attachmentFiles.add(file.name, file);
  }
};


