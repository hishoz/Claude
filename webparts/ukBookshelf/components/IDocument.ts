export interface IDocument {
    title: string;
    name: string;
    documentType: string;
    primaryElement: string;
    primarySite:string;
    Link:string;
    department:string;
    parentDocNo:string;
    templates:string;
    extracts:string;
    midstream?:string;
    expectations:string[];
    safetyRule?:string;
    order:number;
    fileLeafRef:string;
    relatedElement:string;
    safetyCase?:string;
    contentType?:string;
  }

  export interface IlocationDropdownOption{
    key: string;
    text: string;
    order:number;
    siteFilter:boolean;
  }

  export interface IRenditionDocument {
    title: string;
    name: string;
    documentType: string;
    primaryElement: string;
    primarySite:string;
    Link:string;
    department:string;
    parentDocNo:string;
    templates:string;
    extracts:string;
    midstream?:string;
    expectations:string[];
    safetyRule?:string;
    safetyCase:string;
    linkFileName:string;
    order:number;
    fileLeafRef:string;
    relatedElement:string;
  }

  export interface ISafetyReferenceDocument {
    title: string;
    name: string;
    safetyCase:string[];
    Link:string;
  }

  // Used for Role-based "My Documents" view
export interface IRoleBasedDocument extends IDocument {
  keyUserLevel1?: string[];
  keyUserLevel2?: string[];
  keyUserLevel3?: string[];

}
