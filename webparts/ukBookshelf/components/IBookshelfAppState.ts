// import type {
//     TabValue
//   } from "@fluentui/react-components";
import { IScrollablePaneItem } from './IScrollablePaneItem';
import { IEssentialSafetyRulesItems, IItem, ISafetyCases, ITMSExpectations, IWhatsNew } from './IItem';
import { IDocument, IlocationDropdownOption, IRenditionDocument, ISafetyReferenceDocument } from './IDocument';
import { IDropdownOption } from "@fluentui/react";

export interface IBookshelfAppState {
  tabSelectedValue: string;
  isBold: boolean;
  // tabArray:IItem[];
  isOpen: boolean;
  headerText: string;
  panelItems: IDocument[];
  selectedPanelItems: IDocument[];
  headerPaneItems: IScrollablePaneItem[];
  tempPanelItems: IDocument[];
  tmsAssets: IlocationDropdownOption[];
  relativeDocuments: IDocument[];
  panelColor: string;
  scrollablePaneItems: IScrollablePaneItem[];
  departments: IDropdownOption[];
  locations: IlocationDropdownOption[];
  department: string | null;
  location: string | null;
  keyDocuments: IDropdownOption[];
  supportingDocuments: IItem[];
  selectedSupportingDocuments: IItem[];
  selectedPaneElement: IScrollablePaneItem;
  hideDialogContent: boolean;
  hideDialog: boolean;
  dialogContent: string[];
  sponsor: string;
  owner: string;
  dialogTitle: string;
  dialogdescription: string;
  dialogList: JSX.Element[];
  isHQ: boolean;
  safetyRules: IEssentialSafetyRulesItems[];
  selectedSafetyRule: IEssentialSafetyRulesItems;
  selectedSafetyRuleDocs: IDocument[];
  tmsExpectations: ITMSExpectations[];
  selectedtmsExpectations: ITMSExpectations[];
  selectedtmsExpectationsDocs: IDocument[];
  whatsNew: IWhatsNew[];
  // isSearchBtnPressed:boolean;
  currentPage: number;
  filteredWhatsNew: IWhatsNew[];
  safetyCases: ISafetyCases[];
  selectedSafetyCases: ISafetyCases;
  safetyCaseDocs: IRenditionDocument[];
  selectedSafetyCaseDocs: IRenditionDocument[];
  safetyReferenceDocs: ISafetyReferenceDocument[];
  defaultDropdownSelectedLocationKey: string;
  defaultDropdownSelectedDepartmentKey: string;
  pageSize: number;

  //legislation
  legislations: any[];
  filteredLegislations: any[];
  legSearchText: string;
  legDocuments: any[];
  legSelectedHeader: string;

  // Role based documents
  userRole: string;
  userLocation: string;
  userRoleItemId: number;

  level1Docs: IDocument[];
  level2Docs: IDocument[];
  level3Docs: IDocument[];

  roleOptions: IDropdownOption[];
  allQuickLinkDocuments: IDocument[];
  allQuickLinkProcedures: IDocument[];

  myQuickDocLinks: any[];
  myQuickProcedureLinks: any[];
  quickLinkSearchText: string;


  selectedDoc?: IDocument;
  selectedProcedure?: IDocument;
}