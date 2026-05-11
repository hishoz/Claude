import * as React from 'react';
import { SPFI } from "@pnp/sp";
import { getSP } from './pnpjsConfig';
import styles from './UkBookshelf.module.scss';
import type { IUkBookshelfProps } from './IUkBookshelfProps';
import { IBookshelfAppState } from './IBookshelfAppState';
import { Service } from './Service';
import * as strings from 'UkBookshelfWebPartStrings';
import { IScrollablePaneItem } from './IScrollablePaneItem';
import { ComboBox, DefaultButton, Dialog, DialogFooter, Dropdown, IComboBox, IComboBoxOption, IComboBoxStyles, IDropdownOption, IDropdownStyles, Icon, PrimaryButton, TextField } from '@fluentui/react';
// import { DialogItems } from './DialogContent';
// import ListView from './ListView';
import {
  IItem,
  // IEssentialSafetyRulesItems,  ISafetyCases, 
  ITMSExpectations, IWhatsNew
} from './IItem';
import WhatsNewListView from './WhatsNewListView';
import {
  IDocument,
  // IRenditionDocument, ISafetyReferenceDocument
} from './IDocument';

const dropdownStyles: Partial<IDropdownStyles> = {
  dropdown: {
    width: '50%',
    zIndex: 1000,
    position: 'relative',
    backgroundColor: 'white',
    marginTop: '3px',
    float: 'left',
    fontFamily: 'Arial'
  },
  title: {
    height: '20px',
    lineHeight: '20px',
    fontSize: '12px'
  },
  caretDownWrapper: {
    height: '20px',
    lineHeight: '20px'
  },

  callout: {
    width: '290px'
  },
  dropdownOptionText: {
    fontSize: '12px'
  },
  dropdownItem: {
    minHeight: '25px'
  }
};

const comboboxStyles: Partial<IComboBoxStyles> = {
  root: {
    height: '20px !important',

  },
  container: {
    height: '15px !important'
  },
  input: {
    fontSize: '1em'
  },
  optionsContainer: {
    fontSize: '1em',
    minHeight: '20px',
    lineHeight: '20px',
  },
  callout: {
    width: '155px !important'
  }

  // optionsContainerWrapper: {
  //   height: '17px !important'
  // },
};

const controlStyles = {
  root: {
    margin: '0 30px 20px 0',
    maxWidth: '300px',
  },
  fieldGroup: {
    height: '20px !important'
  }
};
const modelProps = {
  isBlocking: false,
  styles: {
    main: { maxWidth: '650px !important', minHeight: '200px !important' },
    actions: { marginTop: '60px !important' }
  },

};

export default class UkBookshelf extends React.Component<IUkBookshelfProps, IBookshelfAppState> {
  private _service: Service;
  private _sp: SPFI;
  private _legSearchTimer: number | undefined;

  public constructor(props: IUkBookshelfProps, state: IBookshelfAppState) {
    super(props);
    this._sp = getSP();
    this.state = {
      tabSelectedValue: "",
      isBold: false,
      isOpen: false,
      headerText: '',
      panelColor: '',
      panelItems: [],
      selectedPanelItems: [],
      scrollablePaneItems: [],
      headerPaneItems: [],
      tempPanelItems: [],
      tmsAssets: [],
      relativeDocuments: [],
      locations: [],
      departments: [],
      location: "",
      department: "",
      keyDocuments: [],
      supportingDocuments: [],
      selectedSupportingDocuments: [],
      hideDialogContent: true,
      hideDialog: true,
      dialogContent: [],
      selectedPaneElement: { header: "", color: "", text: [], index: 0, sponsor: "", owner: "", description: "", elementText: "" },
      dialogTitle: "",
      sponsor: "",
      owner: "",
      dialogList: [],
      dialogdescription: "",
      isHQ: true,
      safetyRules: [],
      selectedSafetyRule: { Id: 0, Title: "", Description: "", Icon: "", Order: "" },
      whatsNew: [],
      // isSearchBtnPressed: false,
      currentPage: 1,
      tmsExpectations: [],
      selectedtmsExpectations: [],
      selectedtmsExpectationsDocs: [],
      filteredWhatsNew: [],
      selectedSafetyRuleDocs: [],
      safetyCases: [],
      selectedSafetyCases: { Id: 0, Title: "", ActualValue: "", Upstream: false, Midstream: false },
      safetyCaseDocs: [],
      selectedSafetyCaseDocs: [],
      safetyReferenceDocs: [],
      defaultDropdownSelectedLocationKey: '',
      defaultDropdownSelectedDepartmentKey: '',
      pageSize: 25,
      // Add these to this.state = { ... }
      legislations: [],
      filteredLegislations: [],
      legSearchText: "",
      legDocuments: [],
      legSelectedHeader: "",
      userRole: "",
      userLocation: "Onshore",
      userRoleItemId: 0,

      level1Docs: [],
      level2Docs: [],
      level3Docs: [],

      roleOptions: [],

      myQuickDocLinks: [],
      myQuickProcedureLinks: [],
      allQuickLinkDocuments: [],
      allQuickLinkProcedures: [],
      quickLinkSearchText: ""
    }
    this._service = new Service();
  }

  public componentDidMount = (): void => {
    this.checkLocation();

    const selectedTab = this.getQuerystingValue('selected');
    this.setState({
      // isHQ: this.props.isHQ,
      tabSelectedValue: selectedTab
    })
    //this.InvokeAPIAndSetDataIntoState();

    this._loadListData(selectedTab)
      .then()
      .catch(err =>
        console.log(err));
    //this._getSanctionItems(5,0);

  }

  private async _loadListData(selectedTab: string): Promise<void> {

    if (selectedTab === 'TAQAUKBookshelf') {
      Promise.all(
        [
          this._service.getTMSElements(this._sp, strings.TMSElementsList),
          // this.props.isHQ ? strings.TMSHQElementsList : strings.TMSElementsList),
          this._service.getElements(this._sp, strings.TMSElementsList),
          // this.props.isHQ ? strings.TMSHQElementsList : strings.TMSElementsList),
          // this._service.getTMSDocumentsData(this._sp),
          this._service.getDepartmentChoiceFields(this._sp, strings.TMSDepartments),
          this._service.getLocationChoiceFields(this._sp, strings.TMSAssets),
          this._service.getSupportingDocuments(this._sp, strings.SupportingDocuments),
          this._service.getKeyDocuments(this._sp, strings.KeyDocuments)
        ]
      ).then((
        [
          tmsElements,
          elements,
          // tmsDocumentsData,
          tmsDepartments,
          TMSAssets,
          supportinDocuments,
          keyDocuments
        ]) => {
        Promise.all(
          [
            this._service.getTMSDocumentsData(this._sp, "TBPrimaryElement/ActualValue eq '" + elements[0].elementText + "'", TMSAssets),
            this._service.getRelativeDocumentsData(this._sp, "TBRelatedElements/ActualValue eq '" + elements[0].elementText + "'", TMSAssets)
          ]
        ).then((
          [
            tmsDocumentsData,
            tmsRelativeData
          ]) => {
          this.setState({
            scrollablePaneItems: tmsElements,
            headerPaneItems: elements,
            panelItems: tmsDocumentsData,
            selectedPanelItems: tmsDocumentsData,
            tempPanelItems: tmsDocumentsData,
            relativeDocuments: tmsRelativeData,
            departments: tmsDepartments,
            locations: TMSAssets,
            supportingDocuments: supportinDocuments,
            keyDocuments: keyDocuments,
            selectedPaneElement: elements[0],
            headerText: elements[0].elementText,
            panelColor: elements[0].color,
            selectedSupportingDocuments: this.state.supportingDocuments
              .filter(m => m.element === elements[0].elementText)
          });
          const element = document.getElementById('bspElement-00');
          if (element) {
            element.style.fontWeight = 'bold';
          }
        }).catch((error) => console.log(error));

      }).catch(err =>
        console.log(err));

    }


    if (selectedTab === 'WhatsNew') {

      Promise.all(
        [
          this._service.getWhatsNew(this._sp, strings.WhatsNew)
        ]
      ).then((
        [
          whatsNew
        ]) => {
        this.setState({
          whatsNew: whatsNew,
          filteredWhatsNew: whatsNew.slice(0, this.state.pageSize)
        });
      }).catch(err =>
        console.log(err));
    }

    if (selectedTab === 'Expectations') {
      Promise.all(
        [
          this._service.getTMSElements(this._sp, strings.TMSElementsList),
          // this.props.isHQ ? strings.TMSHQElementsList : strings.TMSElementsList),
          this._service.getElements(this._sp, strings.TMSElementsList),
          // this.props.isHQ ? strings.TMSHQElementsList : strings.TMSElementsList),
          // this._service.getTMSDocumentsData(this._sp),
          this._service.getLocationChoiceFields(this._sp, strings.TMSAssets),
          this._service.getTMSExpectations(this._sp, strings.TMSExpectaions)
        ]
      ).then((
        [
          tmsElements,
          elements,
          TMSAssets,
          // tmsDocumentsData,
          tmsExpectationsList
        ]) => {
        //  console.log(tmsDocumentsData);
        Promise.all(
          [
            this._service.getTMSDocumentsData(this._sp, "TBRelatedEIExpectations/ExCode eq '" + tmsExpectationsList.filter(m => m.EIElement === elements[0].elementText)[0].ExpectationCode + "'", TMSAssets)
          ]
        ).then((
          [
            tmsDocumentsData
          ]) => {
          this.setState({
            scrollablePaneItems: tmsElements,
            headerPaneItems: elements,
            // panelItems: tmsDocumentsData,
            // selectedPanelItems: tmsDocumentsData.filter(m => m.primaryElement === elements[0].elementText),
            // tempPanelItems: tmsDocumentsData.filter(m => m.primaryElement === elements[0].elementText),
            // selectedPanelItems: tmsDocumentsData,
            // tempPanelItems: tmsDocumentsData,
            tmsAssets: TMSAssets,
            selectedPaneElement: elements[0],
            headerText: elements[0].elementText,
            panelColor: elements[0].color,
            tmsExpectations: tmsExpectationsList,
            selectedtmsExpectations: tmsExpectationsList.filter(m => m.EIElement === elements[0].elementText),
            // selectedtmsExpectationsDocs: tmsDocumentsData.filter(i => i.expectations !== null)
            //   .filter(n => n.expectations.includes(tmsExpectationsList.filter(m => m.EIElement === elements[0].elementText)[0].ExpectationCode)),
            selectedtmsExpectationsDocs: tmsDocumentsData.filter(i => i.expectations !== null)
          });
          const element = document.getElementById('bspElement-00');
          if (element) {
            element.style.fontWeight = 'bold';
          }
          const element1 = document.getElementById('exptElement-0');
          if (element1) {
            element1.style.fontWeight = 'bold';
          }
        }).catch((error) => console.log(error));
      }).catch(err =>
        console.log(err));

    }

    if (selectedTab === 'Legislations') {
      Promise.all(
        [
          this._service.getLegislations(this._sp)
        ]
      ).then((
        [
          legislations
        ]) => {
        this.setState({
          legislations,
          filteredLegislations: legislations,
          legDocuments: [],
          legSelectedHeader: "",
          legSearchText: ""
        });
      }).catch(err =>
        console.log(err));
    }

    if (selectedTab === "MyDocuments") {
      const userId = this.props.context.pageContext.legacyPageContext.userId;

      const userRole = await this._service.getUserDefinedRole(this._sp, userId);
      const location = userRole?.location || "Onshore";
      const role = userRole?.role || "";
      const itemId = userRole?.id || 0;

      const roleOptions = await this._service.getRolesByLocation(this._sp, location);

      // const roleDocs = role
      //   ? await this._service.getRoleBasedTmsDocuments(this._sp, role)
      //   : { level1: [], level2: [], level3: [] };

      const roleDocs = await this._service.getRoleBasedTmsDocuments(this._sp, role);

      const [docs, procs] = await Promise.all([
        this._service.getAllTmsDocuments(this._sp),
        this._service.getAllProcedures(this._sp)
      ]);


      const [docLinks, procedureLinks] = await Promise.all([
        this._service.getUserQuickLinks(this._sp, "User Defined Links", userId),
        this._service.getUserQuickLinks(this._sp, "User Defined Procedures Links", userId)
      ]);


      this.setState({
        userRole: role,
        userLocation: location,
        userRoleItemId: itemId,
        roleOptions,
        level1Docs: roleDocs.level1,
        level2Docs: roleDocs.level2,
        level3Docs: roleDocs.level3,

        myQuickDocLinks: docLinks,
        myQuickProcedureLinks: procedureLinks,

        allQuickLinkDocuments: docs,
        allQuickLinkProcedures: procs
      });
    }

  }

  public render(): React.ReactElement<IUkBookshelfProps> {

    const pageSizes: IDropdownOption[] = [{ key: "5", text: "5" },
    { key: "10", text: "10" },
    { key: "15", text: "15" },
    { key: "20", text: "20" },
    { key: "25", text: "25" },
    { key: "30", text: "30" },
    ]

    const createDialogContentArea = (item: IDocument): JSX.Element => (
      // <div className={styles.flexContainer} >
      //   <div className={styles.dialogList} >
      //     <a className={styles.aDialogList} href={item.Link} data-interception="off" target="_blank" rel="noreferrer"> {item.name}</a>
      //   </div>
      //   <div className={styles.dialogList} >
      //     <a className={styles.aDialogList} href={item.Link} data-interception="off" target="_blank" rel="noreferrer"> {item.title}</a>
      //   </div>
      // </div>
      <div className={styles.TMSbratanibookshelfrenditionline} key={1}>
        <div className={styles.TMSbratanibookshelfrenid}>
          <a className={styles.aTMSbratanibookshelf} href={item.Link} data-interception="off" target="_blank" rel="noreferrer"> {item.name}</a>
        </div>
        <div className={styles.TMSAlignedDocumenttitle}>
          <a className={styles.aTMSbratanibookshelf} href={item.Link} data-interception="off" target="_blank" rel="noreferrer"> {item.title}</a>
        </div>
      </div>

    );
    const dialogList = this.state.tempPanelItems.filter(m => m.parentDocNo === this.state.dialogContent[1] &&
      (this.state.dialogContent[3] === "templates" ? m.documentType === "Template" || m.documentType === "Form" : m.documentType === "Subprocedure")).map(createDialogContentArea);

    const dialogListRelative = this.state.relativeDocuments.filter(m => m.parentDocNo === this.state.dialogContent[1] &&
      (this.state.dialogContent[3] === "templates" ? m.documentType === "Template" || m.documentType === "Form" : m.documentType === "Subprocedure")).map(createDialogContentArea);

    const createDocumentList = (item: any, n: number): JSX.Element => (
      <>
        {item.Ids.sort((x: any, y: any) => x.name > y.name ? 1 : -1).map((x: IDocument) => {
          return (
            <div className={styles.TMSbratanibookshelfrenditionline} key={1}>
              <div className={styles.TMSbratanibookshelfrenid}>
                <a className={styles.aTMSbratanibookshelf} href={x.Link} data-interception="off" target='_blank' rel="noreferrer" >{x.name}</a>
              </div>
              <div className={styles.TMSbratanibookshelfrentitle}>
                <a className={styles.aTMSbratanibookshelf} href={x.Link} data-interception="off" target='_blank' rel="noreferrer" >{x.title}</a>
              </div>
              {
                x.templates === "templates" || x.documentType === "Form" ?
                  <div className={styles.TMSTemplateLink}>
                    <a className={styles.aDocTitle} style={{ color: '#675C53', fontStyle: 'italic' }}
                      onClick={() => this.setOpenDialogContent(x, "templates", "normal")}>{x.templates}</a>
                  </div> :
                  <></>
              }
              {
                x.extracts === "extracts" ?
                  <div className={styles.TMSSubLink}>
                    <a className={styles.aDocTitle} style={{ color: '#675C53', fontStyle: 'italic' }}
                      onClick={() => this.setOpenDialogContent(x, "extracts", "normal")}>{x.extracts}</a>
                  </div> :
                  <></>
              }
            </div>
          )
        })}
        <div className={styles.TMSbratanibookshelfgap}>&nbsp;<br /></div>
      </>
    );

    const finalPanelItems = this.state.tempPanelItems.filter(m => !(this.state.tempPanelItems.filter(x => x.templates === "templates" || x.extracts === "extracts" || x.documentType === "Form")
      .find(y => y.name === m.parentDocNo && (m.documentType === "Template" || m.documentType === "Subprocedure" || m.documentType === "Form"))
    )).filter(n => n.documentType !== "Template" && n.documentType !== "Subprocedure" && n.documentType !== "Form");
    const groupedDocuments = this.groupArray(finalPanelItems);
    const documentList = groupedDocuments.map(createDocumentList);


    const createRelativeDocumentList = (x: any, n: number): JSX.Element => (

      <>
        <div className={styles.TMSbratanibookshelfrenditionline}>
          <div className={styles.TMSbratanibookshelfrenid}>
            <a className={styles.aTMSbratanibookshelf} href={x.Link} data-interception="off" target='_blank' rel="noreferrer" >{x.name}</a>
          </div>
          <div className={styles.TMSbratanibookshelfrentitle}>
            <a className={styles.aTMSbratanibookshelf} href={x.Link} data-interception="off" target='_blank' rel="noreferrer" >{x.title}</a>
          </div>
          {
            x.templates === "templates" ?
              <div className={styles.TMSTemplateLink}>
                <a className={styles.aDocTitle} style={{ color: '#675C53', fontStyle: 'italic' }}
                  onClick={() => this.setOpenDialogContent(x, "templates", "relative")}>{x.templates}</a>
              </div> :
              <></>
          }
          {
            x.extracts === "extracts" ?
              <div className={styles.TMSSubLink}>
                <a className={styles.aDocTitle} style={{ color: '#675C53', fontStyle: 'italic' }}
                  onClick={() => this.setOpenDialogContent(x, "extracts", "relative")}>{x.extracts}</a>
              </div> :
              <></>
          }
        </div>

      </>

    );

    const finalRelativeDocs = this.state.relativeDocuments.length > 0 ? this.state.relativeDocuments.filter(m => !(this.state.tempPanelItems.filter(x => x.templates === "templates" || x.extracts === "extracts")
      .find(y => y.name === m.parentDocNo && (m.documentType === "Template" || m.documentType === "Subprocedure"))
    )).filter(n => n.documentType !== "Template" && n.documentType !== "Subprocedure") : [];
    const relativeDocumentList = finalRelativeDocs.map(createRelativeDocumentList);


    const createContentArea = (item: IScrollablePaneItem, i: number): JSX.Element => (
      <>
        <div key={item.index} className={styles.elementheader} style={{ backgroundColor: item.color }}>
          {item.header}
        </div>
        {item.text.map((m, n) => {
          return (
            <div key={1} id={"bspElement-" + i + "" + n} className={styles.bookshelfSidePanel}>
              <a className={styles.aBookshelfSidePanel}
                onClick={() => this.renderPanelItemHandler(m.value, item.color, "bspElement-" + i + "" + n)}>{m.text}</a>
            </div>
          )
        })
        }
      </>
    );

    const selectedElements = this.state.tmsExpectations.map(x => x.EIElement);
    const leftNavigation = this.state.tabSelectedValue === 'Expectations' ?
      this.state.scrollablePaneItems.filter(m => selectedElements.includes(m.elementText)) :
      this.state.scrollablePaneItems;
    const contentAreas = leftNavigation.map(createContentArea);

    const liKeyLink = (item: IDropdownOption): JSX.Element => (
      <div className={styles.tmsKeyDocLink}>
        <a className={styles.aPanel} href={"" + item.key} data-interception="off" target='_blank' rel="noreferrer">{item.text}</a>
      </div>
    );
    const liSupLink = (item: IItem): JSX.Element => (
      <div className={styles.tmsKeyDocLink}>
        <a className={styles.aPanel} href={"" + item.url} data-interception="off" target='_blank' rel="noreferrer">{item.value}</a>
      </div>
    );
    const liKeyDocLinks = this.state.keyDocuments.map(liKeyLink);
    const liSupDocLinks = this.state.selectedSupportingDocuments.map(liSupLink);

    const tmsExpectationElements = (item: ITMSExpectations, n: number): JSX.Element => (
      <div className={styles.tmsExpecationListLink} id={"exptElement-" + n}>
        <a className={styles.aExpecationListLink}
          onClick={() => this.renderExpectationDocs(item.ExpectationCode, "exptElement-" + n)}>{item.ExpectationTitle}</a>
      </div>

    );
    const tmsExpectationsList = this.state.selectedtmsExpectations.map(tmsExpectationElements);

    const tmsAlignedDocsElements = (item: IDocument): JSX.Element => (
      <div className={styles.TMSbratanibookshelfrenditionline} key={1}>
        <div className={styles.TMSbratanibookshelfrenid}>
          <a className={styles.aTMSbratanibookshelf} href={item.Link} data-interception="off" target="_blank" rel="noreferrer"> {item.name}</a>
        </div>
        <div className={styles.TMSAlignedDocumenttitle} >
          <a className={styles.aTMSbratanibookshelf} href={item.Link} data-interception="off" target="_blank" rel="noreferrer"> {item.title}</a>
        </div>
      </div>

    );
    const tmsAlignedDocumentsList = this.state.selectedtmsExpectationsDocs.map(tmsAlignedDocsElements);

    // const liSafetyRules = (item: IEssentialSafetyRulesItems, n: number): JSX.Element => (
    //   <div className={styles.liSafetyRules} id={"srElement-" + n}>
    //     <a className={styles.aSafetyRules}
    //       onClick={() => this.renderSafetyRules(item.Title, "srElement-" + n)}>
    //       {item.Order}.  <img className={styles.imgSafetyRules} src={item.Icon} />
    //       {item.Description}
    //     </a>
    //   </div>
    // );
    // const olSafetyRules = this.state.safetyRules.map(liSafetyRules);

    // const liSafetyCases = (item: ISafetyCases, n: number): JSX.Element => (
    //   <div className={styles.safetycase} id={"scElement-" + n}>
    //     <a className={styles.aSafetycase}
    //       onClick={() => this.renderSafetyCasesDocs(item.ActualValue, "scElement-" + n)}>
    //       {item.Title}
    //     </a>
    //   </div>
    // );
    // const olSafetyCases = this.state.safetyCases.map(liSafetyCases);
    // const safetyCasePrimaryAsset = this.state.selectedSafetyCaseDocs
    //   .filter(m => m.name === (this.state.selectedSafetyCases.ActualValue.split(' ')[0] + "-RS-001"));


    // const safetycaseline = (item: IRenditionDocument, n: number): JSX.Element => (
    //   <div className={styles.safetycaseline} key={1}>
    //     <div className={styles.safetycaseid}>
    //       <a className={styles.aTMSbratanibookshelf} href={item.Link} data-interception="off" target='_blank' rel="noreferrer" >{item.name}</a>
    //     </div>
    //     <div className={styles.safetycasetitle}>
    //       <a className={styles.aTMSbratanibookshelf} href={item.Link} data-interception="off" target='_blank' rel="noreferrer" >{item.title}</a>
    //     </div>
    //   </div>
    // );
    // const safetycasedocdisplay = safetyCasePrimaryAsset.map(safetycaseline);

    // const safetyCaseTMSDocsline = (item: IDocument, n: number): JSX.Element => (
    //   <div className={styles.safetycaseline} key={2}>
    //     <div className={styles.safetycaseid}>
    //       <a className={styles.aTMSbratanibookshelf} href={item.Link} data-interception="off" target='_blank' rel="noreferrer" >{item.name}</a>
    //     </div>
    //     <div className={styles.safetycasetitle}>
    //       <a className={styles.aTMSbratanibookshelf} href={item.Link} data-interception="off" target='_blank' rel="noreferrer" >{item.title}</a>
    //     </div>
    //   </div>
    // );
    // const safetyCaseTMSDocs = this.state.tempPanelItems.map(safetyCaseTMSDocsline);

    // const safetycaseRelDocline = (item: IRenditionDocument, n: number): JSX.Element => (
    //   <div className={styles.safetycaseline} key={3}>
    //     <div className={styles.safetycaseid}>
    //       <a className={styles.aTMSbratanibookshelf} href={item.Link} data-interception="off" target='_blank' rel="noreferrer" >{item.name}</a>
    //     </div>
    //     <div className={styles.safetycasetitle}>
    //       <a className={styles.aTMSbratanibookshelf} href={item.Link} data-interception="off" target='_blank' rel="noreferrer" >{item.title}</a>
    //     </div>
    //   </div>

    // );
    // const safetyCaseRelatedDocs = this.state.selectedSafetyCaseDocs.map(safetycaseRelDocline);

    // const safetycaseExtDocline = (item: ISafetyReferenceDocument, n: number): JSX.Element => (
    //   <div className={styles.safetycaseline} key={3}>
    //     <div className={styles.safetycaseid}>
    //       <a className={styles.aTMSbratanibookshelf} href={item.Link} data-interception="off" target='_blank' rel="noreferrer" >{item.name}</a>
    //     </div>
    //     <div className={styles.safetycasetitle}>
    //       <a className={styles.aTMSbratanibookshelf} href={item.Link} data-interception="off" target='_blank' rel="noreferrer" >{item.title}</a>
    //     </div>
    //   </div>

    // );
    // const safetyCaseExternalDocs = this.state.safetyReferenceDocs.filter(m => m.safetyCase.includes(this.state.selectedSafetyCases.Title)).map(safetycaseExtDocline);

    const ElementHeaderSup = this.state.headerText.includes(' –') ? "Element " + Number(this.state.headerText.split(' –')[0]) + " Supporting Documents" : this.state.headerText + " Supporting Documents";
    const ElementHeader = this.state.headerText.includes(' –') ? "Element " + Number(this.state.headerText.split(' –')[0]) + " –" + this.state.headerText.split('–')[1] : this.state.headerText;
    const ExpectationText = "This page demonstrates how TAQA UK Management System documents align with our Expectations. Select an Element then an Expectation to display the aligned documents.";
    const WhatsNewText = "The following documents have recently been issued or updated:";

    const renderRoleDocs = (docs: IDocument[]) =>
      docs.map(d => (
        <div className={styles.TMSbratanibookshelfrenditionline} key={d.fileLeafRef}>
          <div className={styles.TMSbratanibookshelfrenid}>
            <a className={styles.aTMSbratanibookshelf} href={d.Link} target="_blank" rel="noreferrer">
              {d.name}
            </a>
          </div>
          <div className={styles.TMSAlignedDocumenttitle}>
            <a className={styles.aTMSbratanibookshelf} href={d.Link} target="_blank" rel="noreferrer">
              {d.title}
            </a>
          </div>
        </div>
      ));

    return (
      <div className={styles.ukBookshelf}>
        {this.state.tabSelectedValue === "Expectations" || this.state.tabSelectedValue === "WhatsNew" ?
          <div className={styles.ukBookshelfHeader}>{this.state.tabSelectedValue === "Expectations" ?
            ExpectationText : this.state.tabSelectedValue === "WhatsNew" ? WhatsNewText : ""}</div> : <></>}
        <div className={styles.bookshelfpage}>
          {this.state.tabSelectedValue === "TAQAUKBookshelf" || this.state.tabSelectedValue === "Expectations" ?
            <>
              <div className={styles.bookshelves} id={'bspElementParent'}>
                {...contentAreas}
              </div>

              {/* {this.props.selectedTab === "TAQAUKBookshelf" ? */}
              {this.state.tabSelectedValue === "TAQAUKBookshelf" ?
                <>
                  {/* //Bookshelf Right Panel */}
                  <div className={styles.bookshelfrenditions}>

                    {/* //Right Panel Header */}
                    <div className={styles.bookshelfheader}
                      style={{ backgroundColor: this.state.panelColor }}>
                      <div>{ElementHeader}
                        <Icon iconName="info" className={styles.infoIcon} onClick={this.openDialog} />

                        {/* <DialogItems
                          title={this.state.dialogTitle}
                          sponsor={this.state.sponsor}
                          owner={this.state.owner}
                          description={this.state.dialogdescription}
                          // dialogList={this.state.dialogList}
                          hideDialogContent={this.state.hideDialogContent}
                          // setOpenDialogContent={this._setOpenDialogContent}
                          onClose={this.dismissDialog.bind(this)}
                          color={this.state.panelColor}
                        /> */}

                        <Dialog
                          hidden={this.state.hideDialogContent}
                          onDismiss={() => this.setState({ hideDialogContent: true })}
                          modalProps={modelProps}
                        >
                          <div className={styles.mainDialogTitle}>{this.state.dialogTitle}</div>
                          <div className={styles.dialogTitle}>{this.state.sponsor}</div>
                          <div className={styles.dialogTitle}>{this.state.owner}</div>
                          <div className={styles.dialogDescription}>
                            {this.state.dialogdescription}
                          </div>
                          <DialogFooter>
                            <PrimaryButton onClick={() => this.setState({ hideDialogContent: true })} text="OK" />
                          </DialogFooter>
                        </Dialog>

                      </div>
                      <div className={styles.bookshelfDropDownMenu}>
                        <Dropdown
                          placeholder="Select location..."
                          options={this.state.locations}
                          onChange={this._onDropdownChange}
                          // defaultSelectedKey={this.state.defaultDropdownSelectedLocationKey}
                          selectedKey={this.state.location || null}
                          styles={dropdownStyles}
                          id="Location" />

                        <Dropdown
                          placeholder="Select department..."
                          options={this.state.departments}
                          onChange={this._onDropdownChange}
                          //defaultSelectedKey={this.state.defaultDropdownSelectedDepartmentKey}
                          selectedKey={this.state.department || null}
                          styles={dropdownStyles}
                          id="Department"
                        />

                      </div>
                    </div>

                    {/* //tmsDocumentsData */}
                    <div className={styles.documentList} style={{ borderColor: this.state.panelColor }}>
                      {/* <ListView
                        items={finalPanelItems}
                        safetyReferenceItems={[]}
                        // hideDialogContent={this.state.hideDialog}
                        setOpenDialogContent={this._openDialogList}
                        // onClose={this.closeDialog.bind(this)}
                        // navTabSelected={this.props.selectedTab}
                        navTabSelected={this.state.tabSelectedValue}
                      /> */}
                      {...documentList}
                      {
                        relativeDocumentList.length > 0 ?
                          <>
                            <div className={styles.TMSbratanibookshelfrelatedoc}>Related Documents</div>
                            {...relativeDocumentList}
                          </>
                          :
                          ""}
                    </div>

                    {/* tms key documents and supporting documents */}
                    <div className={styles.tmsKeyDocuments}>
                      <div>
                        <div className={styles.tmsKeyDocsHeader}>Key Documents</div>
                        {...liKeyDocLinks}
                      </div>
                      <br />
                      <div>
                        <div className={styles.tmsKeyDocsHeader}>{ElementHeaderSup}</div>
                        {...liSupDocLinks}
                      </div>
                    </div>
                  </div>
                  <Dialog
                    hidden={this.state.hideDialog}
                    onDismiss={() => this.setState({ hideDialog: true })}
                    modalProps={modelProps}
                  >
                    <div>
                      <div>
                        <a className={styles.dialogTitle} href={this.state.dialogContent[2]} data-interception="off" target="_blank" rel="noreferrer">{this.state.dialogContent[0]}</a>
                      </div>
                      <div style={{ marginTop: '15px', marginBottom: '70px' }}>
                        {this.state.dialogContent[4] === "relative" ?

                          <>{...dialogListRelative}</> :
                          <>{...dialogList}</>
                        }
                      </div>
                    </div>
                    <DialogFooter>
                      <DefaultButton onClick={() => this.setState({ hideDialog: true })} text="OK" />
                    </DialogFooter>
                  </Dialog>
                </>

                : this.state.tabSelectedValue === "Expectations" ?
                  <>
                    <div className={styles.tmsComplianceExpectationsComp} style={{ width: '32%', marginLeft:'5px', minWidth:'400px' }}>
                      <div className={styles.tmsComplianHeader} style={{ backgroundColor: this.state.panelColor }}>Expectations</div>
                      <div className={styles.tmsComplianceExpectationCompList} id={'exptElementParent'}>
                        {...tmsExpectationsList}
                      </div>
                    </div>
                    <div className={styles.tmsComplianceExpectationsComp} style={{ width: '42%' }}>
                      <div className={styles.tmsComplianHeader} style={{ backgroundColor: this.state.panelColor }}>Aligned Documents</div>
                      <div className={styles.tmsComplianceExpectationCompList}>
                        {this.state.selectedtmsExpectationsDocs.length !== 0 ?
                          // <ListView
                          //   items={this.state.selectedtmsExpectationsDocs}
                          //   safetyReferenceItems={[]}
                          //   setOpenDialogContent={this._openDialogList}
                          //   // navTabSelected={this.props.selectedTab}
                          //   navTabSelected={this.state.tabSelectedValue}

                          // /> 
                          <>{...tmsAlignedDocumentsList}</>
                          :
                          <div style={{ fontSize: '12px' }}>There are currently no documents aligned to this expectation. Contact TMS Administrator to propose any documents for alignment.</div>
                        }

                      </div>
                    </div>
                  </> : <></>}
            </>
            :

            this.state.tabSelectedValue === "WhatsNew" ?
              <>
                <div className={styles.whatsNewTopBar}>
                  <div className={styles.whatsNewDropdown}>
                    <Dropdown
                      options={pageSizes}
                      onChange={this._onDropdownChange}
                      defaultSelectedKey={"" + this.state.pageSize}
                      selectedKey={"" + this.state.pageSize}
                      styles={dropdownStyles}
                      id="pageSize"
                      label='Show Entries:' />
                  </div>
                  <div className={styles.whatsNewSearch}>
                    <TextField label="Search:" onChange={this._onTextChange} styles={controlStyles} />
                  </div>
                </div>

                <div className={styles.documentList1}>
                  <WhatsNewListView
                    whatsNewItems={this.state.filteredWhatsNew}
                    totalPerPage={this.state.pageSize}
                    totalItemsCount={this.state.whatsNew.length}
                    currentPage={this.state.currentPage}
                    fetchedItemsCount={this.state.filteredWhatsNew.length}
                    // isSearchBtnPressed={this.state.isSearchBtnPressed}
                    _renderPagedItemHandler={this._renderItems}
                  />
                </div>
              </> :

              this.state.tabSelectedValue === "Legislations" ?
                <>
                  <div className={styles.locationpage}>
                    <div>
                      Select or search for a piece of legislation in the left-hand panel to display the compliant TMS documents
                    </div>
                    <br /> 
                    <div className={styles.searchInput}>
                      <b>Search Legislation:&nbsp;</b>
                      <input
                        type="text"
                        value={this.state.legSearchText}
                        onChange={(e) => this.onLegislationSearch((e.target as HTMLInputElement).value)}
                      />
                    </div>

                    {/* LEFT PANE */}
                    <div className={styles.locationselector}
                    // style={{ overflowY: 'auto', border: '1px solid #000', width: '40%' }}
                    >
                      {/* List of legislations */}
                      {this.state.filteredLegislations.map((leg: any) => (
                        <div key={leg.Id} className={styles.locationselected}>
                          <a style={{marginLeft:'-3px'}}
                            className={styles.aBookshelfSidePanel}
                            onClick={() => this.onLegislationClick(leg.Id, leg.Title)}
                          >
                            {leg.Title}
                          </a>
                        </div>
                      ))}
                    </div>

                    {/* RIGHT PANE */}
                    <div className={styles.locationcontent}>
                      <div className={styles.locationheader} style={{ backgroundColor: 'rgb(17, 17, 33)' }}>
                        <div>{this.state.legSelectedHeader}</div>
                      </div>

                      {/* Documents list (reuse your documentList + row classes) */}
                      <div className={styles.locationpanel} style={{ borderColor: 'rgb(17, 17, 33)' }}>
                        {this.state.legDocuments.map((doc: any) => (
                          <div className={styles.TMSbratanibookshelfrenditionline} key={doc.Id}>
                            <div className={styles.TMSbratanibookshelfrenid}>
                              <a className={styles.aTMSbratanibookshelf} href={doc.EncodedAbsUrl} data-interception="off" target="_blank" rel="noreferrer">
                                {doc.RenID}
                              </a>
                            </div>
                            <div className={styles.TMSbratanibookshelfrentitle}>
                              <a className={styles.aTMSbratanibookshelf} href={doc.EncodedAbsUrl} data-interception="off" target="_blank" rel="noreferrer">
                                {doc.Title}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </>
                :

                this.state.tabSelectedValue === "MyDocuments" ?
                  <div className={styles.locationpage} style={{ width: '85%' }}>
                    <div style={{ marginRight: "2%" }}>
                      This tool is intended as a guide to help you quickly locate documents which are most relevant to your role. It is based on where your role appears in a TMS document, but is not intended to detail all of your responsibilities. If your role does not appear on the list, if you do not see the expected documents or if you have any other feedback – please contact the TMS Team.
                    </div>
                    <br />
                    <div className={styles.roleselector} style={{ width: '51%' }}>
                      <div className={styles.myDocuments}>My Documents</div>
                      <br />
                      <div style={{ float: "left", paddingLeft: "5px" }}>Select your location then role:</div>
                      <div style={{ float: 'right', width: '70%' }}>
                        <Dropdown
                          // label="Location"
                          options={[
                            { key: "Onshore", text: "Onshore" },
                            { key: "Offshore", text: "Offshore" }
                          ]}
                          selectedKey={this.state.userLocation}
                          onChange={this.onLocationChange}
                          //styles={{dropdown:{marginLeft:'-4px'} }}
                          styles={dropdownStyles}
                          style={{ marginLeft: '-5px', width: '85px', marginTop: '-3px' }}
                        />

                        <Dropdown
                          // label="Role"
                          options={this.state.roleOptions}
                          selectedKey={this.state.userRole}
                          onChange={this.onRoleChange}
                          styles={dropdownStyles}
                          style={{ marginLeft: '5px', width: '325px', marginTop: '-3px' }}
                        // styles={{dropdown:{marginLeft:'5px',width:'325px'} }}
                        />
                      </div>
                      <br /><br />

                      <div className={styles.rolePanelsContainer}>
                        <div className={styles.levelHeader} >
                          Level 1 <span style={{ fontWeight: 'normal' }}> – Documents you must have detailed knowledge of and where you have documented responsibilities:</span>
                        </div>
                        <br />
                        <div className={styles.rolePanel}>
                          {renderRoleDocs(this.state.level1Docs)}
                        </div>
                        <br /><br />
                        <div className={styles.levelHeader} >
                          Level 2<span style={{ fontWeight: 'normal' }}> – Documents you must have general knowledge of:</span>
                        </div>
                        <br />
                        <div className={styles.rolePanel} >
                          {renderRoleDocs(this.state.level2Docs)}
                        </div>
                        <br />
                        <div className={styles.levelHeader} >
                          Level 3 <span style={{ fontWeight: 'normal' }}> – Documents you should be aware of:</span>
                        </div><br />
                        <div className={styles.rolePanel} >
                          {renderRoleDocs(this.state.level3Docs)}
                        </div>
                      </div>

                    </div>


                    {/* MY QUICK LINKS */}
                    <div className={styles.roleselector} style={{ width: "45%", paddingLeft: '20px' }}>
                      <div className={styles.myDocuments} style={{ marginLeft: '-10px' }}>
                        My Quick Links
                      </div>
                      <br />
                      <div>
                        <label>Add your quick links by typing in the auto-complete textbox: </label>

                        {/* <ComboBox
                          // placeholder="Type document number or title..."
                          options={this.state.allQuickLinkDocuments.map(d => ({
                            key: d.fileLeafRef,
                            text: `${d.name} – ${d.title}`
                          }))}
                          onChange={(e, o) => this.onQuickLinkChange(e, o, "document")}
                          allowFreeform
                          autoComplete="on"
                          style={{ float: 'right', width: '30%', marginBottom: '10px', marginRight: '10px' }}
                          styles={comboboxStyles}
                        /> */}
                        <ComboBox
                          //  placeholder="Type document number or title..."
                          options={this.getFilteredQuickLinkOptions(
                            this.state.allQuickLinkDocuments
                          )}
                          onChange={(e, o) => this.onQuickLinkChange(e, o, "document")}
                          onInputValueChange={this.onQuickLinkInputChange}
                          allowFreeform
                          autoComplete="off"   // ✅ IMPORTANT
                          openOnKeyboardFocus
                          style={{ float: 'right', width: '30%', marginBottom: '10px', marginRight: '10px' }}
                          styles={comboboxStyles}

                          onRenderOption={(option) => {
                            //const [docNo, title] = option.text.split(" – ");

                            return (
                              <div
                                style={{
                                  fontSize: '12px',
                                  lineHeight: '18px',
                                  padding: '6px 8px',
                                  display: 'flex',
                                  flexDirection: 'column'
                                }}
                              >
                                <span>{option?.text}</span>
                              </div>
                            );
                          }}

                        />

                      </div>

                      <div className={styles.quickLinksSection}>
                        {this.state.myQuickDocLinks.map(l =>
                          this.renderQuickLink(l, this.deleteQuickDoc)
                        )}
                      </div>

                      {/* <hr /> */}
                      <br /><br />
                      <div>
                        <label>Add links to individual procedures/extracts: </label>
                        {/* <ComboBox
                          // placeholder="Type procedure number..."
                          options={this.state.allQuickLinkProcedures.map(d => ({
                            key: d.fileLeafRef,
                            text: `${d.name} – ${d.title}`
                          }))}
                          onChange={(e, o) => this.onQuickLinkChange(e, o, "procedure")}
                          allowFreeform
                          autoComplete="on"
                          style={{ float: 'right', width: '30%', marginBottom: '10px', marginRight: '10px' }}
                          styles={comboboxStyles}
                        /> */}
                        <ComboBox
                          //  placeholder="Type procedure number..."
                          options={this.getFilteredQuickLinkOptions(
                            this.state.allQuickLinkProcedures
                          )}
                          onChange={(e, o) => this.onQuickLinkChange(e, o, "procedure")}
                          onInputValueChange={this.onQuickLinkInputChange}
                          allowFreeform
                          autoComplete="off"
                          openOnKeyboardFocus
                          style={{ float: 'right', width: '30%', marginBottom: '10px', marginRight: '10px' }}
                          styles={comboboxStyles}
                        />
                      </div>

                      <div>
                        {this.state.myQuickProcedureLinks.map(l =>
                          this.renderQuickLink(l, this.deleteQuickProcedure)
                        )}
                      </div>
                    </div>
                  </div> :
                  <></>
          }

        </div>
      </div>



    );
  }

  private renderPanelItemHandler = (headerText: string, panelColor: string, elementId: string): void => {
    Promise.all(
      [
        this.state.tabSelectedValue === 'Expectations' ?
          this._service.getTMSDocumentsData(this._sp, "TBRelatedEIExpectations/ExCode eq '" + this.state.tmsExpectations.filter(m => m.EIElement === headerText)[0].ExpectationCode + "'", this.state.tmsAssets) :
          this._service.getTMSDocumentsData(this._sp, "TBPrimaryElement/ActualValue eq '" + headerText + "'", this.state.locations),
        this._service.getRelativeDocumentsData(this._sp, "TBRelatedElements/ActualValue eq '" + headerText + "'", this.state.locations)

      ]
    ).then((
      [
        tmsDocumentsData,
        tmsRelativeData
      ]) => {

      // Assuming you have a parent element with the ID 'parentElement'
      const parentElement = document.getElementById('bspElementParent');

      // Check if the parent element exists
      if (parentElement) {
        // Get all child elements
        const childElements = parentElement.querySelectorAll('*');

        // Loop through the child elements
        childElements.forEach(child => {
          // Check if the child element has font-weight set to bold
          if (window.getComputedStyle(child).fontWeight === 'bold' || window.getComputedStyle(child).fontWeight === '700') {
            console.log('Found a bold element:', child);
            child.setAttribute('style', 'fontWeight:normal');
            // You can perform further actions here
          }
        });
      }

      this.state.tabSelectedValue === "Expectations" ?
        this.setState({
          headerText: headerText,
          panelColor: panelColor,
          selectedtmsExpectations: this.state.tmsExpectations.filter(m => m.EIElement === headerText),
          selectedtmsExpectationsDocs: tmsDocumentsData.filter(i => i.expectations !== null)
        }) :
        this.setState({
          headerText: headerText,
          panelColor: panelColor,
          // selectedPanelItems: this.state.panelItems.filter(m => m.primaryElement === headerText),
          // tempPanelItems: this.state.panelItems.filter(m => m.primaryElement === headerText),
          selectedPanelItems: tmsDocumentsData,
          tempPanelItems: tmsDocumentsData,
          selectedPaneElement: this.state.headerPaneItems.filter(m => m.elementText === headerText)[0],
          selectedSupportingDocuments: this.state.supportingDocuments.filter(m => m.element === headerText),
          selectedtmsExpectations: this.state.tmsExpectations.filter(m => m.EIElement === headerText),
          relativeDocuments: tmsRelativeData,
          location:null,
          department:null
        });

      ///For TMS Documents
      //set selected element as bold
      const element = document.getElementById(elementId);
      if (element) {
        element.style.fontWeight = 'bold';
      }

      ///For Expectations
      //set unselected element as normal
      const parentElement1 = document.getElementById('exptElementParent');
      if (parentElement1) {
        // Get all child elements
        const childElements = parentElement1.querySelectorAll('*');
        childElements.forEach(child => {
          if (window.getComputedStyle(child).fontWeight === 'bold' || window.getComputedStyle(child).fontWeight === '700') {
            console.log('Found a bold element:', child);
            child.setAttribute('style', 'fontWeight:normal');
          }
        });
      }
      //set selected element as bold
      const element1 = document.getElementById('exptElement-0');
      if (element1) {
        element1.style.fontWeight = 'bold';
      }

      //console.log(this.state.selectedPaneElement);
    }).catch((error) => console.log(error));
  };

  private renderExpectationDocs = (selectedExpectations: string, elementId: string): void => {
    // const expectationDocs = this.state.panelItems.filter(i => i.expectations !== null)
    //   .filter(n => n.expectations.includes(selectedExpectations));
    Promise.all(
      [
        this._service.getTMSDocumentsData(this._sp, "TBRelatedEIExpectations/ExCode eq '" + selectedExpectations + "'", this.state.locations)
      ]
    ).then((
      [
        tmsDocumentsData
      ]) => {
      //set unselected element as normal
      const parentElement = document.getElementById('exptElementParent');
      if (parentElement) {
        // Get all child elements
        const childElements = parentElement.querySelectorAll('*');
        childElements.forEach(child => {
          if (window.getComputedStyle(child).fontWeight === 'bold' || window.getComputedStyle(child).fontWeight === '700') {
            console.log('Found a bold element:', child);
            child.setAttribute('style', 'fontWeight:normal');
          }
        });
      }

      //set selected element as bold
      const element = document.getElementById(elementId);
      if (element) {
        element.style.fontWeight = 'bold';
      }

      this.setState({
        selectedtmsExpectationsDocs: tmsDocumentsData.filter(i => i.expectations !== null)
      })
    }).catch((error) => console.log(error));
    // console.log(this.state.selectedtmsExpectationsDocs);
  };


  private openDialog = (): void => {
    this.setState({
      hideDialogContent: false,
      dialogTitle: "Element " + this.state.selectedPaneElement.elementText,
      sponsor: "Element Sponsor: " + this.state.selectedPaneElement.sponsor,
      owner: "Element Owner: " + this.state.selectedPaneElement.owner,
      dialogdescription: this.state.selectedPaneElement.description
    });
  }

  //Exctracts and templates dialog
  // private _openDialogList = (value: boolean, dialogContent: string[]): void => {
  //   this.setState({
  //     hideDialog: value,
  //     dialogContent: dialogContent
  //   });
  // }

  /**
  * triggers dropdown change event
  * @param event 
  * @param value 
  */
  private _onDropdownChange = (event: React.FormEvent<HTMLDivElement>, value: IDropdownOption): void => {

    if ((event.target as HTMLElement).id === "Location") {
      this.setState({
        location: "" + value.key,
        tempPanelItems: value.text === "All" ?
          this.state.selectedPanelItems :
          this.state.selectedPanelItems.filter(m => m.primarySite === value.key)
      });
    }

    console.log(this.state.selectedPanelItems);
    //console.log(this.state.selectedPanelItems.filter(m => m.department!==null?m.department[0] === value.key:m.department === value.key));

    if ((event.target as HTMLElement).id === "Department") {
      this.setState({
        department: "" + value.key,
        tempPanelItems: value.text === "All" ?
          this.state.selectedPanelItems :
          this.state.selectedPanelItems.filter(m => m.department === value.key)
      });
    }

    if ((event.target as HTMLElement).id === "pageSize") {
      this.setState({
        pageSize: +value.key
      });
      this._renderItems(1, +value.key, [], false);
    }

  }

  private _onTextChange = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
    let filteredWhatsNew: IWhatsNew[] = [];

    if (text.length > 0) {
      // console.log(text ?
      //   this.state.whatsNew
      //     .filter(i => i.DocumentNumber.toLowerCase().indexOf(text) > -1 || i.DocumentTitle.toLowerCase().indexOf(text) > -1 ||
      //       i.DateRef.toLowerCase().indexOf(text) > -1)
      //   : this.state.whatsNew);
      filteredWhatsNew = text ? this.state.whatsNew
        .filter(i => i.DocumentNumber.toLowerCase().indexOf(text) > -1 || i.DocumentTitle.toLowerCase().indexOf(text) > -1 ||
          i.DateRef.toLowerCase().indexOf(text) > -1) : this.state.whatsNew;
      this._renderItems(1, this.state.pageSize, filteredWhatsNew, true);
      // this.setState({
      //   filteredWhatsNew: text ?
      //     this.state.whatsNew
      //       .filter(i => i.DocumentNumber.toLowerCase().indexOf(text) > -1 || i.DocumentTitle.toLowerCase().indexOf(text) > -1 ||
      //         i.DateRef.toLowerCase().indexOf(text) > -1)
      //     : this.state.whatsNew,
      //   // isSearchBtnPressed: true
      // });

    }
    else {
      this._renderItems(1, this.state.pageSize, [], false);
    }
    // else {
    //   this.setState({
    //     filteredWhatsNew: text ?
    //       this.state.whatsNew
    //         .filter(i => i.DocumentNumber.toLowerCase().indexOf(text) > -1 || i.DocumentTitle.toLowerCase().indexOf(text) > -1 ||
    //           i.DateRef.toLowerCase().indexOf(text) > -1)
    //       : this.state.whatsNew,
    //     // isSearchBtnPressed: false
    //   });

    // }
  //  this._renderItems(1, this.state.pageSize, filteredWhatsNew, true);
  }

  /**
* pagination
* @returns {void}
*/
  private _renderItems = (currentPage: number, pageSize: number, filteredWhatsNew: IWhatsNew[], IsSearched?: boolean): void => {
    currentPage = currentPage - 1;
    //  let remainingItems = this.props.itemCount - (currentPage * pageSize;
    const itemsToGet = pageSize !== undefined ? pageSize : this.state.pageSize;
    const skipItems = currentPage !== 0 ? (currentPage * itemsToGet) : 0;
    let whatsNewItems: IWhatsNew[] = [];
    let renderItems: IWhatsNew[] = [];

    if (IsSearched)
      whatsNewItems = filteredWhatsNew;

    else
      whatsNewItems = this.state.whatsNew;

    renderItems = whatsNewItems.slice(skipItems, itemsToGet + skipItems);

    // this._getIndividualItems(itemsToGet, skipItems);

    this.setState({
      filteredWhatsNew: renderItems,
      currentPage: currentPage + 1
    });

  }

  /**
* gets query string value
* @param key 
* @returns 
*/
  protected getQuerystingValue = (key: string): string => {
    const href = window.location.href;
    const reg = new RegExp('[?&]' + key + '=([^&#]*)', 'i');
    const string = reg.exec(href);
    let returnString = string ? string[1] : "";
    returnString = href.includes('/SitePages/Bookshelf.aspx') && returnString === "" ? "TAQAUKBookshelf" : returnString;
    if (href.includes('/SitePages/Bookshelf.aspx') && returnString === "")
      window.location.href = 'https://taqaglobal.sharepoint.com/sites/TBR-Bookshelf/SitePages/Bookshelf.aspx?selected=TAQAUKBookshelf';
    // return string ? string[1] : "";
    return returnString;
  }

  private checkLocation = (): void => {
    if (localStorage.getItem('location') === window.location.href)
      console.log("no change");
    else
      window.location.reload();
    localStorage.location = window.location.href;
    // window.location.reload();

  }

  private setOpenDialogContent = (item: IDocument, docType: string, listType: string): void => {
    const dialogTitle = item.templates === "templates" ?
      "Templates within " + item.title + " (" + item.name + ")" :
      "Extracts from " + item.title + " (" + item.name + ")";
    const dialogName = item.name;
    const dialogDocLink = item.Link;

    if (listType === "relative") {
      Promise.all(
        [
          this._service.getRelativeTempSubData(this._sp, `LinkedDocNo eq '` + dialogName + `' and DocImplemented eq 'Yes'`)
        ]
      ).then((
        [
          tmsRelativeTemplateData
        ]) => {

        let relativeData = this.state.relativeDocuments
        relativeData = relativeData.concat(tmsRelativeTemplateData);

        this.setState({
          relativeDocuments: relativeData,
          hideDialog: false,
          dialogContent: [dialogTitle, dialogName, dialogDocLink, docType, listType]
        });
      }).catch((error) => console.log(error));
    }

    else {

      this.setState({
        hideDialog: false,
        dialogContent: [dialogTitle, dialogName, dialogDocLink, docType, listType]
      });
    }

  }

  private groupArray = (arr: IDocument[]): any[] => {

    let groups: any[] = [];
    arr.map(item => { return item.primarySite })
      .filter((value, index, self) => { return self.indexOf(value) === index })
      .map(item => {
        groups.push({
          Title: item,
          Ids: arr.filter(r => { return r.primarySite === item })
        });
      });
    groups = groups.sort((m, n) => m.Ids[0].order > n.Ids[0].order ? 1 : -1);
    return groups;
  }

  private onLegislationSearch = (text: string): void => {
    this.setState({ legSearchText: text });

    // Debounce search
    window.clearTimeout(this._legSearchTimer);
    this._legSearchTimer = window.setTimeout(async () => {
      try {
        const q = (text || "").trim();
        if (!q) {
          this.setState({ filteredLegislations: this.state.legislations });
          return;
        }
        const results = await this._service.searchLegislations(this._sp, q);
        this.setState({ filteredLegislations: results });
      } catch (error) {
        console.log(error);
      }
    }, 250);
  };

  private onLegislationClick = async (id: number, title: string): Promise<void> => {
    try {
      const docs = await this._service.getTmsDocsByLegislation(this._sp, id);
      this.setState({
        legDocuments: docs,
        legSelectedHeader: title
      });
    } catch (error) {
      console.log(error);
    }
  };


  private onLocationChange = async (_: any, option?: IDropdownOption): Promise<void> => {

    if (!option) return;
    const location = option.key as string;

    // 1️⃣ Load roles for selected location 
    const roleOptions = await this._service.getRolesByLocation(this._sp, location);

    // 2️⃣ IMPORTANT: reload documents with EMPTY role 
    // This ensures "All Personnel" documents remain visible 
    //const roleDocs = await this._service.getRoleBasedTmsDocuments( this._sp, ""   ); 

    // 3️⃣ Update state WITHOUT clearing documents 
    this.setState({
      userLocation: location,
      roleOptions,
      userRole: ""
      // level1Docs: roleDocs.level1, 
      // level2Docs: roleDocs.level2, 
      // level3Docs: roleDocs.level3 
    });

  };

  private onRoleChange = async (
    _: any,
    option?: IDropdownOption
  ): Promise<void> => {
    if (!option) return;

    const userId = this.props.context.pageContext.legacyPageContext.userId;

    const newId = await this._service.saveUserDefinedRole(
      this._sp,
      userId,
      option.key as string,
      this.state.userLocation,
      this.state.userRoleItemId
    );

    const roleDocs = await this._service.getRoleBasedTmsDocuments(
      this._sp,
      option.key as string
    );

    this.setState({
      userRole: option.key as string,
      userRoleItemId: newId,
      level1Docs: roleDocs.level1,
      level2Docs: roleDocs.level2,
      level3Docs: roleDocs.level3
    });
  };

  private renderQuickLink = (
    item: any,
    deleteFn: (id: number) => void
  ): JSX.Element => (
    <div className={styles.TMSbratanibookshelfrenditionline} key={item.Id}>
      <div className={styles.TMSbratanibookshelfrenid}>
        <a
          className={styles.aTMSbratanibookshelf}
          href={item.DocumentUrl}
          target="_blank"
          rel="noreferrer"
        >
          {item.Title}
        </a>
      </div>
      <div className={styles.TMSAlignedDocumenttitle}>
        <a
          className={styles.aTMSbratanibookshelf}
          href={item.DocumentUrl}
          target="_blank"
          rel="noreferrer"
        >
          {item.DocumentTitle}
        </a>
        <Icon
          iconName="Delete"
          style={{ marginLeft: 10, cursor: "pointer" }}
          onClick={() => deleteFn(item.Id)}
        />
      </div>
    </div>
  );

  private deleteQuickDoc = async (id: number): Promise<void> => {

    const confirmed = window.confirm(
      "Are you sure you want to remove the link?"
    );

    if (!confirmed) {
      return; // ✅ user cancelled
    }

    await this._service.deleteUserQuickLink(this._sp, "User Defined Links", id);
    const userId = this.props.context.pageContext.legacyPageContext.userId;
    const links = await this._service.getUserQuickLinks(this._sp, "User Defined Links", userId);
    this.setState({ myQuickDocLinks: links });

    alert("The link is deleted");
  };

  private deleteQuickProcedure = async (id: number): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to remove the link?"
    );

    if (!confirmed) {
      return; // ✅ user cancelled
    }
    await this._service.deleteUserQuickLink(this._sp, "User Defined Procedures Links", id);
    const userId = this.props.context.pageContext.legacyPageContext.userId;
    const links = await this._service.getUserQuickLinks(this._sp, "User Defined Procedures Links", userId);
    this.setState({ myQuickProcedureLinks: links });
    alert("The link is deleted");
  };


  private onQuickLinkChange = async (
    _: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    source: "document" | "procedure" = "document"
  ): Promise<void> => {

    if (!option) return;

    // Decide source list + data set
    const docs =
      source === "document"
        ? this.state.allQuickLinkDocuments
        : this.state.allQuickLinkProcedures;

    const listName =
      source === "document"
        ? "User Defined Links"
        : "User Defined Procedures Links";

    const doc = docs.find(d => d.fileLeafRef === option.key);

    if (!doc?.Link) {
      console.error("Unable to resolve document URL for quick link");
      return;
    }


    // ✅ NEW: confirmation alert (legacy‑style)
    const confirmed = window.confirm(
      `Are you sure you want to add this link?\n\n${doc.name} – ${doc.title}`
    );

    if (!confirmed) {
      return; // ✅ user cancelled
    }


    try {
      await this._service.addUserQuickLink(this._sp, listName, {
        Title: doc.name,
        DocumentTitle: doc.title,
        DocumentUrl: doc.Link
      });

      const userId =
        this.props.context.pageContext.legacyPageContext.userId;

      const refreshedLinks = await this._service.getUserQuickLinks(
        this._sp,
        listName,
        userId
      );

      if (source === "document") {
        this.setState({ myQuickDocLinks: refreshedLinks });
      } else {
        this.setState({ myQuickProcedureLinks: refreshedLinks });
      }

      alert("The link was added successfully.");

    } catch (error) {
      console.log("Error adding quick link", error);
    }
  };

  private onQuickLinkInputChange = (
    value?: string
  ): void => {
    this.setState({
      quickLinkSearchText: value || ""
    });
  };

  private getFilteredQuickLinkOptions = (
    docs: IDocument[]
  ): { key: string; text: string }[] => {

    const search = this.state.quickLinkSearchText.toLowerCase();

    return docs
      .filter(d =>
        !search ||
        d.name.toLowerCase().includes(search) ||
        d.title.toLowerCase().includes(search)
      )
      .map(d => ({
        key: d.fileLeafRef,
        //  text: `${d.name} – ${d.title}`
        text: `${d.name}`
      }));
  };

}
