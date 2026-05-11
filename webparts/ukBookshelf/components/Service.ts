//import { Caching } from "@pnp/queryable";
// import { SPHttpClient } from '@microsoft/sp-http';
import "@pnp/sp/files";
import "@pnp/sp/folders";

import {
    SPFI,
    // spfi 
} from "@pnp/sp";
//import { SPFx } from '@pnp/sp/compat'; // use compat for SPFx 1.20 projects
import { IDropdownOption } from "@fluentui/react";
import { IScrollablePaneItem, IScrollableListItems } from './IScrollablePaneItem';
import { IDocument, IlocationDropdownOption, IRenditionDocument, ISafetyReferenceDocument } from './IDocument';
import { IEssentialSafetyRulesItems, IItem, ISafetyCases, ITMSExpectations, IWhatsNew } from "./IItem";
import * as strings from "UkBookshelfWebPartStrings";
import { IRoleBasedDocument } from "./IDocument";

export class Service {
    // constructor() {
    // }


    /**
     * 
     * @param listName 
     * @returns 
     */
    public getTMSElements(sp: SPFI, listName: string): Promise<IScrollablePaneItem[]> {
        // const spCache = spfi(sp).using(Caching());
        const spCache = sp;
        return new Promise<IScrollablePaneItem[]>((resolve, reject) => {
            // try{
            // const response = await spCache.web.lists.getByTitle(listName).items.select('Title', 'Datasource')();
            // const output = async ()=>{
            spCache.web.lists.getByTitle(listName).items.select(
                'Title', 'ActualValue', 'BSElementColour', 'DispName', 'SortOrder', 'ElementType', 'ElementOwner/Title', 'ElementSponsor/Title', 'ElementDescription', 'BSIndentLEvel'
            ).expand('ElementOwner', 'ElementSponsor')
                .filter('BSDisplay eq 1')
                .orderBy('SortOrder')().then(response => {

                    //const items2: any [] = await sp.web.lists.getByTitle ("My List").items.select ("Title", "Description").top (5).orderBy ("Modified", true) ();
                    const items: IScrollablePaneItem[] = [];
                    let item: IScrollableListItems[] = [];
                    let tempItem: IScrollablePaneItem = { header: "", color: "", text: [], index: 0, sponsor: "", owner: "", description: "", elementText: "" };
                    let index: number = 0;
                    if (response.length > 0) {
                        response.map((i: any, n: number) => {
                            if (n === 0) {
                                item.push({ value: i.ActualValue, text: i.Title, order: i.SortOrder });
                                //header=i.ElementType
                                tempItem = {
                                    header: i.ElementType,
                                    color: i.BSElementColour,
                                    text: i.ActualValue,
                                    elementText: i.ActualValue,
                                    index: index,
                                    sponsor: i.ElementSponsor.Title,
                                    owner: i.ElementOwner.Title,
                                    description: i.ElementDescription.replace(/<[^>]+>/g, '')
                                };
                            }
                            else if (n === response.length - 1) {
                                if (i.ElementType === tempItem.header) {
                                    item.push({ value: i.ActualValue, text: i.Title, order: i.SortOrder });
                                    items.push({
                                        header: tempItem.header,
                                        color: tempItem.color,
                                        text: item,
                                        elementText: tempItem.elementText,
                                        index: tempItem.index,
                                        sponsor: tempItem.sponsor,
                                        owner: tempItem.owner,
                                        description: tempItem.description
                                    });
                                }
                                else {
                                    items.push({
                                        header: tempItem.header,
                                        color: tempItem.color,
                                        text: item,
                                        elementText: tempItem.elementText,
                                        index: tempItem.index,
                                        sponsor: tempItem.sponsor,
                                        owner: tempItem.owner,
                                        description: tempItem.description
                                    });
                                    item = [];
                                    item.push({ value: i.ActualValue, text: i.Title, order: i.SortOrder });
                                    items.push({
                                        header: i.ElementType,
                                        color: i.BSElementColour,
                                        text: item,
                                        elementText: i.ActualValue,
                                        index: index,
                                        sponsor: i.ElementSponsor.Title,
                                        owner: i.ElementOwner.Title,
                                        description: i.ElementDescription.replace(/<[^>]+>/g, '')
                                    });
                                }

                            }
                            else {
                                if (i.ElementType === tempItem.header) {
                                    item.push({ value: i.ActualValue, text: i.Title, order: i.SortOrder });
                                }
                                else {
                                    index = index + 1;
                                    items.push({
                                        header: tempItem.header,
                                        color: tempItem.color,
                                        text: item,
                                        elementText: tempItem.elementText,
                                        index: tempItem.index,
                                        sponsor: tempItem.sponsor,
                                        owner: tempItem.owner,
                                        description: tempItem.description
                                    });

                                    tempItem = {
                                        header: i.ElementType,
                                        color: i.BSElementColour,
                                        text: i.ActualValue,
                                        elementText: i.ActualValue,
                                        index: index,
                                        sponsor: i.ElementSponsor.Title,
                                        owner: i.ElementOwner.Title,
                                        description: i.ElementDescription.replace(/<[^>]+>/g, '')
                                    };
                                    item = [];
                                    item.push({ value: i.ActualValue, text: i.Title, order: i.SortOrder });
                                }
                            }
                        });
                        resolve(items);
                    }
                }).catch((error) => console.log(error));
            // }
            // console.log(output);

            // }catch(error){
            //     return reject(error);
            // }
        });
    }

    public getElements(sp: SPFI, listName: string): Promise<IScrollablePaneItem[]> {
        const spCache = sp;

        return new Promise<IScrollablePaneItem[]>((resolve) => {
            // const response = await spCache.web.lists.getByTitle(listName).items.select('Title', 'Datasource')();
            spCache.web.lists.getByTitle(listName).items.select(
                'ActualValue', 'BSElementColour', 'DispName', 'SortOrder', 'ElementType', 'ElementOwner/Title', 'ElementSponsor/Title', 'ElementDescription'
            ).expand('ElementOwner', 'ElementSponsor').filter('BSDisplay eq 1')
                .orderBy('SortOrder')().then(response => {

                    const itemArray: IScrollablePaneItem[] = [];
                    // const index: number = 0;
                    if (response.length > 0) {
                        response.map((i: any, n: number) => {

                            itemArray.push({
                                header: i.ElementType,
                                color: i.BSElementColour,
                                text: i.ActualValue,
                                elementText: i.ActualValue,
                                index: i.SortOrder,
                                sponsor: i.ElementSponsor.Title,
                                owner: i.ElementOwner.Title,
                                description: i.ElementDescription !== null ? i.ElementDescription.replace(/<[^>]+>/g, '') : "",

                            })
                        });
                        resolve(itemArray);
                    }
                }).catch((error) => console.log(error));
        });
    }

    /**
* 
* @param listName 
* @returns 
*/
    // public getTMSDocumentsData1(sp: SPFI, query: string, tmsAssets: IlocationDropdownOption[]): Promise<IDocument[]> {

    //     const spCache = spfi(sp).using(Caching());
    //     return new Promise<IDocument[]>((resolve, reject) => {
    //         spCache.web.lists.getByTitle(strings.TMSDocumentLib).items.select("Title", "Modified", "LinkFilename", "TBDocType", "TBPrimaryElement", "TBPrimarySite","TBSafetyCase","ContentType",
    //             "TBIssuingDept", "LinkedDocNo", "HasTemplates", "HasSubprocedures", "TBRelatedEIExpectations", "FileLeafRef", 'DocImplemented', 'TBRelatedElements')
    //             // .filter(query).top(1000)().then(response => {
    //             .filter(query + ` and DocImplemented eq 'Yes'`).top(1000)().then(response => {

    //                 let items: IDocument[] = [];
    //                 if (response.length > 0) {
    //                     response.map((i: any) => {
    //                         items.push({
    //                             title: i.Title,
    //                             name: i.LinkFilename.split('.')[0],
    //                             documentType: i.TBDocType,
    //                             primaryElement: i.TBPrimaryElement,
    //                             primarySite: i.TBPrimarySite,
    //                             Link: strings.SiteUrl + "TMSDocuments/" + i.LinkFilename +"?web=1",
    //                             department: i.TBIssuingDept !== null ? i.TBIssuingDept[0] : i.TBIssuingDept,
    //                             parentDocNo: i.LinkedDocNo,
    //                             templates: i.HasTemplates === "Yes" ? "templates" : "",
    //                             extracts: i.HasSubprocedures === "Yes" ? "extracts" : "",
    //                            // midstream: i.Midstream,
    //                             expectations: i.TBRelatedEIExpectations,
    //                            // safetyRule: i.EssentialSafetyRules,
    //                             order: i.TBPrimarySite !== "" && i.TBPrimarySite !== null ?tmsAssets.length!==0? +tmsAssets.filter(m => m.key === i.TBPrimarySite)[0].order:0 : 0,
    //                             fileLeafRef: i.FileLeafRef,
    //                             relatedElement: i.TBRelatedElements,
    //                             safetyCase: i.TBSafetyCase,
    //                             contentType:i.contentType
    //                         });
    //                         items = items.sort((m, n) => m.order > n.order ? 1 : -1)
    //                             .sort((x, y) => x.name > y.name ? 1 : -1);
    //                     });
    //                     resolve(items);
    //                 }
    //                 else {
    //                     resolve([]);
    //                 }
    //             }).catch((error) => console.log(error));
    //     });
    // }


    /**
* 
* @param listName 
* @returns 
*/
    public getTMSDocumentsData(sp: SPFI, query: string, tmsAssets: IlocationDropdownOption[]): Promise<IDocument[]> {

        // const spCache = spfi(sp).using(Caching());
        const spCache = sp;
        return new Promise<IDocument[]>((resolve, reject) => {
            spCache.web.lists.getByTitle(strings.TMSDocumentLib).items.select("Title", "Modified", "LinkFilename", "TBDocType/Title", "TBPrimaryElement/ActualValue", "TBPrimarySite/ActualValue", "TBSafetyCase/ActualValue", "ContentType/Name",
                "TBIssuingDept/Title", "LinkedDocNo", "HasTemplates", "HasSubprocedures", "TBRelatedEIExpectations/ExCode", "FileLeafRef", 'DocImplemented', 'TBRelatedElements/ActualValue')
                .expand('TBDocType', 'TBPrimaryElement', 'TBPrimarySite', 'TBSafetyCase', 'TBIssuingDept', 'TBRelatedEIExpectations', 'TBRelatedElements', 'ContentType')
                //.filter(query)
                .filter(query + ` and DocImplemented eq 'Yes'`)
                .top(1000)().then(response => {

                    let items: IDocument[] = [];

                    if (!response?.length) {
                        return [];
                    }

                    if (response.length > 0) {
                        response.map((i: any) => {

                            const asset = tmsAssets.find(m => m.key === i.TBPrimarySite?.ActualValue);

                            items.push({
                                title: i.Title,
                                name: i.LinkFilename.split('.')[0],
                                documentType: i.TBDocType?.Title,
                                primaryElement: i.TBPrimaryElement !== null ? i.TBPrimaryElement.ActualValue : "",
                                primarySite: i.TBPrimarySite !== null ? i.TBPrimarySite.ActualValue : "",
                                Link: strings.SiteUrl + "TMSDocuments/" + i.LinkFilename + "?web=1",
                                department: i.TBIssuingDept !== null && i.TBIssuingDept.length !== 0 ? i.TBIssuingDept[0].Title : "",
                                parentDocNo: i.LinkedDocNo,
                                templates: i.HasTemplates === "Yes" ? "templates" : "",
                                extracts: i.HasSubprocedures === "Yes" ? "extracts" : "",
                                // midstream: i.Midstream,
                                expectations: i.TBRelatedEIExpectations?.length ? i.TBRelatedEIExpectations[0].ExCode : [],
                                // safetyRule: i.EssentialSafetyRules,
                                // order: i.TBPrimarySite !== "" && i.TBPrimarySite !== null ?tmsAssets.length!==0? +tmsAssets.filter(m => m.key === i.TBPrimarySite.ActualValue)[0].order:0 : 0,
                                order: asset?.order ?? 0,
                                fileLeafRef: i.FileLeafRef,
                                relatedElement: i.TBRelatedElements !== null ? i.TBRelatedElements.ActualValue : "",
                                // safetyCase: i.TBSafetyCase !== undefined ? i.TBSafetyCase.ActualValue : "",
                                contentType: i.ContentType?.Name
                            });
                            // items = items.sort((m, n) => m.order > n.order ? 1 : -1)
                            //     .sort((x, y) => x.name > y.name ? 1 : -1);
                        });
                        resolve(items.sort((m, n) => m.order > n.order ? 1 : -1)
                            .sort((x, y) => x.name > y.name ? 1 : -1));
                    }
                    else {
                        resolve([]);
                    }
                }).catch((error) => { console.log(error); reject(error); });
        });
    }


    /**
* 
* @param listName 
* @returns 
*/
    public getRelativeDocumentsData(sp: SPFI, query: string, tmsAssets: IlocationDropdownOption[]): Promise<IDocument[]> {

        // const spCache = spfi(sp).using(Caching());
        const spCache = sp;

        return new Promise<IDocument[]>((resolve, reject) => {
            // spCache.web.lists.getByTitle(strings.TMSDocumentLib).items.select("Title", "Modified", "LinkFilename", "TBDocType", "TBPrimaryElement", "TBPrimarySite","TBSafetyCase",
            //     "TBIssuingDept", "LinkedDocNo", "HasTemplates", "HasSubprocedures", "TBRelatedEIExpectations", "FileLeafRef", 'DocImplemented', 'TBRelatedElements')
            spCache.web.lists.getByTitle(strings.TMSDocumentLib).items.select("Title", "Modified", "LinkFilename", "TBDocType/Title", "TBPrimaryElement/ActualValue", "TBPrimarySite/ActualValue", "TBSafetyCase/ActualValue", "ContentType",
                "TBIssuingDept/Title", "LinkedDocNo", "HasTemplates", "HasSubprocedures", "TBRelatedEIExpectations/ExCode", "FileLeafRef", 'DocImplemented', 'TBRelatedElements/ActualValue')
                .expand('TBDocType', 'TBPrimaryElement', 'TBPrimarySite', 'TBSafetyCase', 'TBIssuingDept', 'TBRelatedEIExpectations', 'TBRelatedElements')
                // .filter(query).top(1000)().then(response => {
                .filter(query + ` and DocImplemented eq 'Yes'`)
                .top(1000)().then(response => {

                    let items: IDocument[] = [];

                    if (!response?.length) {
                        resolve([]);
                    }

                    if (response.length > 0) {
                        response.map((i: any) => {
                            // items.push({
                            //     title: i.Title,
                            //     name: i.LinkFilename.split('.')[0],
                            //     documentType: i.TBDocType,
                            //     primaryElement: i.TBPrimaryElement,
                            //     primarySite: i.TBPrimarySite,
                            //     Link: strings.SiteUrl + "TMSDocuments/" + i.LinkFilename +"?web=1",
                            //     department: i.TBIssuingDept !== null ? i.TBIssuingDept[0] : i.TBIssuingDept,
                            //     parentDocNo: i.LinkedDocNo,
                            //     templates: i.HasTemplates === "Yes" ? "templates" : "",
                            //     extracts: i.HasSubprocedures === "Yes" ? "extracts" : "",
                            //   //  midstream: i.Midstream,
                            //     expectations: i.TBRelatedEIExpectations,
                            //  //   safetyRule: i.EssentialSafetyRules,
                            //     order: i.TBPrimarySite !== "" ?tmsAssets.length!==0?  +tmsAssets.filter(m => m.key === i.TBPrimarySite)[0].order :0: 0,
                            //     fileLeafRef: i.FileLeafRef,
                            //     relatedElement: i.TBRelatedElements
                            // });
                            items.push({
                                title: i.Title,
                                name: i.LinkFilename.split('.')[0],
                                documentType: i.TBDocType.Title,
                                primaryElement: i.TBPrimaryElement !== null ? i.TBPrimaryElement.ActualValue : "",
                                primarySite: i.TBPrimarySite !== null ? i.TBPrimarySite.ActualValue : "",
                                Link: strings.SiteUrl + "TMSDocuments/" + i.LinkFilename + "?web=1",
                                department: i.TBIssuingDept !== null && i.TBIssuingDept.length !== 0 ? i.TBIssuingDept[0].Title : "",
                                parentDocNo: i.LinkedDocNo,
                                templates: i.HasTemplates === "Yes" ? "templates" : "",
                                extracts: i.HasSubprocedures === "Yes" ? "extracts" : "",
                                // midstream: i.Midstream,
                                expectations: i.TBRelatedEIExpectations !== null && i.TBRelatedEIExpectations.length !== 0 ? i.TBRelatedEIExpectations[0].ExCode : "",
                                // safetyRule: i.EssentialSafetyRules,
                                order: i.TBPrimarySite !== "" && i.TBPrimarySite !== null ? tmsAssets.length !== 0 ? +tmsAssets.filter(m => m.key === i.TBPrimarySite.ActualValue)[0].order : 0 : 0,
                                fileLeafRef: i.FileLeafRef,
                                relatedElement: i.TBRelatedElements !== null ? i.TBRelatedElements.ActualValue : "",
                                //  safetyCase: i.TBSafetyCase !== null?i.TBSafetyCase.ActualValue:"",
                                contentType: i.contentType
                            });
                            items = items.sort((m, n) => m.order > n.order ? 1 : -1)
                                .sort((x, y) => x.fileLeafRef > y.fileLeafRef ? 1 : -1);

                        });
                        resolve(items);
                    }
                    else {
                        resolve(items);
                    }
                }).catch((error) => console.log(error));
        });
    }

    /**
* 
* @param listName 
* @returns 
*/
    public getRelativeTempSubData(sp: SPFI, query: string): Promise<IDocument[]> {

        // const spCache = spfi(sp).using(Caching());
        const spCache = sp;

        return new Promise<IDocument[]>((resolve, reject) => {

            // spCache.web.lists.getByTitle(strings.TMSDocumentLib).items.select("Title", "Modified", "LinkFilename", "TBDocType", "TBPrimaryElement", "TBPrimarySite","TBSafetyCase",
            //     "TBIssuingDept", "LinkedDocNo", "HasTemplates", "HasSubprocedures", "TBRelatedEIExpectations", "FileLeafRef", 'DocImplemented', 'TBRelatedElements')
            spCache.web.lists.getByTitle(strings.TMSDocumentLib).items.select("Title", "Modified", "LinkFilename", "TBDocType/Title", "TBPrimaryElement/ActualValue", "TBPrimarySite/ActualValue", "TBSafetyCase/ActualValue", "ContentType",
                "TBIssuingDept/Title", "LinkedDocNo", "HasTemplates", "HasSubprocedures", "TBRelatedEIExpectations/ExCode", "FileLeafRef", 'DocImplemented', 'TBRelatedElements/ActualValue')
                .expand('TBDocType', 'TBPrimaryElement', 'TBPrimarySite', 'TBSafetyCase', 'TBIssuingDept', 'TBRelatedEIExpectations', 'TBRelatedElements')
                // .filter(query).top(1000)().then(response => {
                .filter(query).top(1000)().then(result => {

                    let items: IDocument[] = [];
                    if (result.length > 0) {
                        result.map((j: any) => {
                            // items.push({
                            //     title: j.Title,
                            //     name: j.LinkFilename.split('.')[0],
                            //     documentType: j.TBDocType,
                            //     primaryElement: j.TBPrimaryElement,
                            //     primarySite: j.TBPrimarySite,
                            //     Link: strings.SiteUrl + "TMSDocuments/" + j.LinkFilename+"?web=1",
                            //     department: j.TBIssuingDept !== null ? j.TBIssuingDept[0] : j.TBIssuingDept,
                            //     parentDocNo: j.LinkedDocNo,
                            //     templates: j.HasTemplates === "Yes" ? "templates" : "",
                            //     extracts: j.HasSubprocedures === "Yes" ? "extracts" : "",
                            //   //  midstream: j.Midstream,
                            //     expectations: j.TBRelatedEIExpectations,
                            //   //  safetyRule: j.EssentialSafetyRules,
                            //     order: j.TBPrimarySite,
                            //     fileLeafRef: j.FileLeafRef,
                            //     relatedElement: j.TBRelatedElements
                            // });
                            items.push({
                                title: j.Title,
                                name: j.LinkFilename.split('.')[0],
                                documentType: j.TBDocType.Title,
                                primaryElement: j.TBPrimaryElement.ActualValue,
                                primarySite: j.TBPrimarySite.ActualValue,
                                Link: strings.SiteUrl + "TMSDocuments/" + j.LinkFilename + "?web=1",
                                department: j.TBIssuingDept !== null && j.TBIssuingDept.length !== 0 ? j.TBIssuingDept[0].Title : "",
                                parentDocNo: j.LinkedDocNo,
                                templates: j.HasTemplates === "Yes" ? "templates" : "",
                                extracts: j.HasSubprocedures === "Yes" ? "extracts" : "",
                                // midstream: j.Midstream,
                                expectations: j.TBRelatedEIExpectations !== null && j.TBRelatedEIExpectations.length !== 0 ? j.TBRelatedEIExpectations[0].ExCode : "",
                                // safetyRule: j.EssentialSafetyRules,
                                order: j.TBPrimarySite !== "" && j.TBPrimarySite !== null ? j.TBPrimarySite.ActualValue : 0,
                                fileLeafRef: j.FileLeafRef,
                                relatedElement: j.TBRelatedElements.ActualValue
                            });
                            items = items.sort((m, n) => m.order > n.order ? 1 : -1)
                                .sort((x, y) => x.fileLeafRef > y.fileLeafRef ? 1 : -1);
                        });
                        resolve(items);
                    }
                    else {
                        resolve([]);
                    }
                }).catch((error) => console.log(error));


        })
    }




    /**    
    * 
    * @param listName 
    * @returns 
    */
    public getRenditionDocs(sp: SPFI, query: string): Promise<IRenditionDocument[]> {
        //  const spCache = spfi(sp).using(Caching());
        const spCache = sp;
        return new Promise<IRenditionDocument[]>((resolve, reject) => {
            // spCache.web.lists.getByTitle(strings.RenditionDocsLib).items.select("Title", "Modified", "LinkFilename", "TBDocType", "TBPrimaryElement", "TBPrimarySite", 
            //     "TBIssuingDept", "LinkedDocNo", "HasTemplates", "HasSubprocedures", "TBRelatedEIExpectations", "FileLeafRef", "TBRelatedElements1", "RenPublish")
            spCache.web.lists.getByTitle(strings.RenditionDocsLib).items.select("Title", "Modified", "LinkFilename", "TBDocType/Title", "TBPrimaryElement/ActualValue", "TBPrimarySite/ActualValue", "TBSafetyCase/ActualValue", "ContentType",
                "TBIssuingDept/Title", "LinkedDocNo", "HasTemplates", "HasSubprocedures", "TBRelatedEIExpectations/ExCode", "FileLeafRef", 'DocImplemented', 'TBRelatedElements/ActualValue')
                .expand('TBDocType', 'TBPrimaryElement', 'TBPrimarySite', 'TBSafetyCase', 'TBIssuingDept', 'TBRelatedEIExpectations', 'TBRelatedElements')
                .filter(query + ` and RenPublish eq 'Yes'`)().then(response => {

                    let items: IRenditionDocument[] = [];
                    if (response.length > 0) {
                        response.map((i: any) => {
                            // items.push({
                            //     title: i.Title,
                            //     name: i.LinkFilename.split('.')[0],
                            //     documentType: i.TBDocType,
                            //     primaryElement: i.TBPrimaryElement,
                            //     primarySite: i.TBPrimarySite,
                            //     Link: strings.SiteUrl + "Rendition/" + i.LinkFilename +"?web=1",
                            //     department: i.TBIssuingDept,
                            //     parentDocNo: i.LinkedDocNo,
                            //     templates: i.HasTemplates === "Yes" ? "templates" : "",
                            //     extracts: i.HasSubprocedures === "Yes" ? "extracts" : "",
                            //   //  midstream: i.Midstream,
                            //     expectations: i.TBRelatedEIExpectations,
                            //   //  safetyRule: i.EssentialSafetyRules,
                            //     safetyCase: i.TBSafetyCase,
                            //     linkFileName: i.LinkFilename,
                            //     order: i.Primary_x0020_Site_x003a_DocOrder,
                            //     fileLeafRef: i.FileLeafRef,
                            //     relatedElement: i.TBRelatedElements1
                            // });
                            items.push({
                                title: i.Title,
                                name: i.LinkFilename.split('.')[0],
                                documentType: i.TBDocType.Title,
                                primaryElement: i.TBPrimaryElement.ActualValue,
                                primarySite: i.TBPrimarySite.ActualValue,
                                Link: strings.SiteUrl + "TMSDocuments/" + i.LinkFilename + "?web=1",
                                department: i.TBIssuingDept !== null && i.TBIssuingDept.length !== 0 ? i.TBIssuingDept[0].Title : "",
                                parentDocNo: i.LinkedDocNo,
                                templates: i.HasTemplates === "Yes" ? "templates" : "",
                                extracts: i.HasSubprocedures === "Yes" ? "extracts" : "",
                                // midstream: i.Midstream,
                                expectations: i.TBRelatedEIExpectations !== null && i.TBRelatedEIExpectations.length !== 0 ? i.TBRelatedEIExpectations[0].ExCode : "",
                                // safetyRule: i.EssentialSafetyRules,
                                order: i.TBPrimarySite !== "" && i.TBPrimarySite !== null ? i.TBPrimarySite.ActualValue : 0,
                                fileLeafRef: i.FileLeafRef,
                                relatedElement: i.TBRelatedElements.ActualValue,
                                safetyCase: i.TBSafetyCase.ActualValue,
                                linkFileName: i.LinkFilename
                                // contentType:i.contentType
                            });
                            items = items.sort((m, n) => m.order > n.order ? 1 : -1).sort((x, y) => x.fileLeafRef > y.fileLeafRef ? 1 : -1);
                        });
                        resolve(items);
                    }
                }).catch((error) => console.log(error));
        });
    }


    /**
* 
* @param listName 
* @returns 
*/
    public getSafetyReferenceDocs(sp: SPFI): Promise<ISafetyReferenceDocument[]> {
        // const spCache = spfi(sp).using(Caching());
        const spCache = sp;
        return new Promise<ISafetyReferenceDocument[]>((resolve, reject) => {
            spCache.web.lists.getByTitle(strings.ReferenceSafetyDocsLib).items
                .select("Title", "LinkFilename", "NLSafetyCase")().then(response => {

                    let items: ISafetyReferenceDocument[] = [];
                    if (response.length > 0) {
                        response.map((i: any) => {
                            items.push({
                                title: i.Title,
                                name: i.LinkFilename.split('.')[0],
                                safetyCase: i.NLSafetyCase,
                                Link: strings.SiteUrl + "SafetyCaseReferenceDocs/" + i.LinkFilename + "?web=1",
                            });
                            items = items.sort((m, n) => m.name > n.name ? 1 : -1);

                        });
                        resolve(items);
                    }
                }).catch((error) => console.log(error));
        });
    }


    /**
  * 
  * @param listName 
  * @returns 
  */
    public getDepartmentChoiceFields(sp: SPFI, listName: string): Promise<IDropdownOption[]> {
        //  const spCache = spfi(sp).using(Caching());
        const spCache = sp;
        return new Promise<IDropdownOption[]>((resolve, reject) => {
            spCache.web.lists.getByTitle(listName).items.select('Title', 'BSDisplay', 'SortOrder')
                .filter('BSDisplay eq 1')
                .orderBy('SortOrder')().then(response => {

                    const items: IDropdownOption[] = [];
                    items.push({ key: "", text: "All" });
                    if (response.length > 0) {
                        response.map((i: any) => {
                            items.push({ key: i.Title, text: i.Title });
                        });
                        resolve(items);
                    }
                }).catch((error) => console.log(error));
        });
    }

    /**
  * 
  * @param listName 
  * @returns 
  */
    public getKeyDocuments(sp: SPFI, listName: string): Promise<IDropdownOption[]> {
        //    const spCache = spfi(sp).using(Caching());
        const spCache = sp;
        return new Promise<IDropdownOption[]>((resolve, reject) => {
            spCache.web.lists.getByTitle(listName).items
                .select('Title', 'SortOrder', 'TBRURL').orderBy('SortOrder')().then(response => {

                    const items: IDropdownOption[] = [];
                    // items.push({ key: "", text: "All" });
                    if (response.length > 0) {
                        response.map((i: any) => {
                            items.push({ key: i.TBRURL + "?web=1", text: i.Title });
                        });
                        resolve(items);
                    }
                }).catch((error) => console.log(error));
        });
    }

    /**
     * 
     * @param listName 
     * @returns 
     */
    public getSupportingDocuments(sp: SPFI, listName: string): Promise<IItem[]> {
        //  const spCache = spfi(sp).using(Caching());
        const spCache = sp;
        return new Promise<IItem[]>((resolve, reject) => {
            spCache.web.lists.getByTitle(listName).items
                .select('Title', 'SortOrder', 'TBRURL', 'Element/ActualValue').expand('Element')
                .orderBy('SortOrder')().then(response => {

                    const items: IItem[] = [];
                    if (response.length > 0) {
                        response.map((i: any) => {
                            items.push({
                                value: i.Title, url: i.TBRURL + "?web=1",
                                element: i.Element.ActualValue, order: i.SortOrder
                            });
                        });
                        resolve(items);
                    }
                }).catch((error) => console.log(error));
        });
    }

    /**
     * 
     * @param listName 
     * @returns 
     */
    public getLocationChoiceFields(sp: SPFI, listName: string): Promise<IlocationDropdownOption[]> {
        //  const spCache = spfi(sp).using(Caching());
        const spCache = sp;
        return new Promise<IlocationDropdownOption[]>((resolve, reject) => {
            spCache.web.lists.getByTitle(listName).items.select('Title', 'ActualValue', 'TBSiteFilter', 'TBSiteFilterOrder', 'DocOrder', 'TBLocFilter', 'TBLocOrder')
                .filter('TBLocFilter eq 1')
                .orderBy('TBLocOrder')().then(response => {

                    const items: IlocationDropdownOption[] = [];
                    items.push({ key: "", text: "All", order: 0, siteFilter: true });
                    if (response.length > 0) {
                        response.map((i: any) => {
                            items.push({
                                key: i.ActualValue,
                                text: i.Title,
                                order: i.TBLocOrder,
                                siteFilter: i.TBLocFilter
                            });
                        });
                        resolve(items);
                    }
                }).catch((error) => console.log(error));
        });
    }

    /**
  * 
  * @param listName 
  * @returns 
  */
    public getEssentialSafetyRulesElements(sp: SPFI, listName: string): Promise<IEssentialSafetyRulesItems[]> {
        const spCache = sp;

        return new Promise<IEssentialSafetyRulesItems[]>((resolve, reject) => {
            spCache.web.lists.getByTitle(listName).items.select('ID', 'Title', 'Description', 'Icon', 'Order')().then(response => {

                const items: IEssentialSafetyRulesItems[] = [];
                if (response.length > 0) {
                    response.map((i: any) => {
                        items.push({
                            Id: i.ID, Title: i.Title, Description: i.Description, Icon: i.Icon,
                            Order: (("" + i.Order) === "1100" || ("" + i.Order) === "1200" ? "" : "0") +
                                (("" + i.Order) === "1000" ? ("" + i.Order).split('0')[0] + "0" : ("" + i.Order).split('0')[0])
                        });
                    });
                    resolve(items);
                }
            }).catch((error) => console.log(error));
        });
    }

    /**
     * 
     * @param listName 
     * @returns 
     */
    public getTMSExpectations(sp: SPFI, listName: string): Promise<ITMSExpectations[]> {
        const spCache = sp;

        return new Promise<ITMSExpectations[]>((resolve, reject) => {
            spCache.web.lists.getByTitle(listName).items.select('ID', 'Title', 'ExCode', 'ExTitle', 'EIElement/ActualValue', 'SortOrder').top(1000).expand('EIElement')().then(response => {

                const items: ITMSExpectations[] = [];
                if (response.length > 0) {
                    response.map((i: any) => {
                        items.push({
                            Title: i.Title, Id: i.ID,
                            EIElement: i.EIElement !== undefined ? i.EIElement.ActualValue : "",
                            ExpectationCode: i.ExCode,
                            ExpectationTitle: i.ExTitle,
                            Order: +i.SortOrder
                        });
                    });
                    items.sort((m, n) => m.Order > n.Order ? 1 : -1)
                    resolve(items);
                }
            }).catch((error) => console.log(error));
        });
    }


    /**
 * 
 * @param listName 
 * @returns 
 */
    public getSafetyCases(sp: SPFI, listName: string): Promise<ISafetyCases[]> {
        const spCache = sp;

        return new Promise<ISafetyCases[]>((resolve, reject) => {
            spCache.web.lists.getByTitle(listName).items.select('ID', 'Title', 'ActualValue').orderBy('Title')().then(response => {

                const items: ISafetyCases[] = [];
                if (response.length > 0) {
                    response.map((i: any) => {
                        items.push({
                            Title: i.Title, Id: i.ID,
                            ActualValue: i.ActualValue,
                            // Midstream: i.Midstream,
                            // Upstream: i.Upstream
                        });
                    });
                    resolve(items);
                }
            }).catch((error) => console.log(error));
        });
    }

    /**
* 
* @param listName 
* @returns 
*/
    public getWhatsNew(sp: SPFI, listName: string): Promise<IWhatsNew[]> {
        const spCache = sp;
        // const date=   dayjs(addDays(new Date(),-90)).format('YYYY-MM-DDT00:00:01Z');
        const date = new Date(new Date().setDate(new Date().getDate() - 90));
        const dateString = date.toISOString();
        return new Promise<IWhatsNew[]>((resolve, reject) => {
            spCache.web.lists.getByTitle(listName).items
                .select('ID', 'Title', 'TBRDateRef', 'DocumentNumber', 'DocumentTitle', 'TBRURL')
                .filter(`TBRDateRef ge datetime'${dateString}'`)
                .top(1000).orderBy('TBRDateRef', false)().then(response => {
                    console.log(dateString);
                    const items: IWhatsNew[] = [];
                    if (response.length > 0) {
                        response.map((i: any) => {
                            items.push({
                                Id: i.ID, Title: i.Title, DateRef: i.TBRDateRef, DocumentNumber: i.DocumentNumber,
                                DocumentTitle: i.DocumentTitle,
                                //Upstream: i.Upstream, Midstream: i.Midstream, 
                                URLRef: i.TBRURL + "?web=1"
                                //URLRef: i.TBRURL.index('.docx')>0?i.TBRURL +"&web=1": i.TBRURL +"?web=1"
                            });
                        });
                        resolve(items);
                    }
                }).catch((error) => console.log(error));
        });
    }


    public async getLegislations(sp: SPFI): Promise<any[]> {
        return await sp.web.lists.getByTitle("Legislations List")
            .items.select("Id", "Title")
            .top(1000)
            .orderBy("Title", true)();
    }

    public async searchLegislations(sp: SPFI, text: string): Promise<any[]> {
        // escape single quotes for OData
        const safe = (text || "").replace(/'/g, "''");
        if (!safe) return this.getLegislations(sp);

        return await sp.web.lists.getByTitle("Legislations List")
            .items
            .filter(`substringof('${safe}', Title)`)
            .select("Id", "Title")
            .orderBy("Title", true)();
    }

    public async getTmsDocsByLegislation(sp: SPFI, legislationId: number): Promise<any[]> {
        return await sp.web.lists.getByTitle(strings.TMSDocumentLib)
            .items
            .select("Id", "Title", "RenID", "EncodedAbsUrl", "RelatedLegislations/Id", "DocImplemented")
            .expand("RelatedLegislations")
            .filter(`DocImplemented eq 'Yes' and RelatedLegislations/Id eq ${legislationId}`)
            .orderBy("RenID", true)();
    }


    // ================= USER ROLE =================

    public async getUserDefinedRole(
        sp: SPFI,
        userId: number
    ): Promise<{ id: number; role: string; location: string } | null> {

        const spCache = sp;

        const items = await spCache.web.lists
            .getByTitle(strings.UserDefinedRoles)
            .items
            .filter(`UserId eq ${userId}`)
            .select("Id", "Title", "Location")
            .top(1000)();

        if (!items?.length) {
            return null;
        }

        return {
            id: items[0].Id,
            role: items[0].Title,
            location: items[0].Location
        };
    }

    public async saveUserDefinedRole(
        sp: SPFI,
        userId: number,
        role: string,
        location: string,
        id?: number
    ): Promise<number> {

        const list = sp.web.lists.getByTitle(strings.UserDefinedRoles);

        if (id && id > 0) {
            // ✅ UPDATE existing item
            await list.items.getById(id).update({
                Title: role,
                Location: location
            });
            return id; // ✅ return same ID
        } 
        
        else {
           const result =  await list.items.add({
                Title: role,
                Location: location,
                UserId: userId
            });

             return result.data.Id; // ✅ RETURN NEW ID
        }
    }

    // ================= ROLES =================

    public async getRolesByLocation(
        sp: SPFI,
        location: string
    ): Promise<IDropdownOption[]> {

        const spCache = sp;

        const roles = await spCache.web.lists
            .getByTitle(strings.Roles)
            .items
            .select("Id", "Title", "Location", "Hidden")
            .filter(`Hidden ne 1 and Location eq '${location}'`)
            .top(1000)
            .orderBy("Title")();

        const options: IDropdownOption[] = [
            { key: "", text: "-- Select your role --" }
        ];

        roles.forEach(r => {
            options.push({ key: r.Title, text: r.Title });
        });

        return options;
    }

    // ================= ROLE BASED DOCUMENTS =================


    public async getRoleBasedTmsDocuments(
        sp: SPFI,
        role: string
    ): Promise<{
        level1: IRoleBasedDocument[];
        level2: IRoleBasedDocument[];
        level3: IRoleBasedDocument[];
    }> {

        const spCache = sp;

        const docs = await spCache.web.lists
            .getByTitle(strings.TMSDocumentLib)
            .items
            .select(
                "Id",
                "Title",
                "FileLeafRef",
                "EncodedAbsUrl",
                "KeyUserLevel1/Title",
                "KeyUserLevel2/Title",
                "KeyUserLevel3/Title"
            )
            .expand("KeyUserLevel1",
                "KeyUserLevel2",
                "KeyUserLevel3")
            .top(5000)();

        const mapDoc = (i: any): IRoleBasedDocument => ({
            title: i.Title,
            name: i.FileLeafRef?.split(".")[0],
            Link: i.EncodedAbsUrl,
            fileLeafRef: i.FileLeafRef,
            order: 0,
            documentType: "",
            primaryElement: "",
            primarySite: "",
            department: "",
            parentDocNo: "",
            templates: "",
            extracts: "",
            expectations: [],
            relatedElement: "",

            keyUserLevel1: i.KeyUserLevel1?.map((r: any) => r.Title) ?? [],
            keyUserLevel2: i.KeyUserLevel2?.map((r: any) => r.Title) ?? [],
            keyUserLevel3: i.KeyUserLevel3?.map((r: any) => r.Title) ?? []

        });

        // const matchesRole = (roles?: string[]): boolean =>
        //     roles?.includes(role) === true ||
        //     roles?.includes("All Personnel") === true;

        const matchesRole = (
            roles?: string[],
            role?: string
        ): boolean => {
            if (!roles || roles.length === 0) return false;

            // ✅ When no role selected → default to All Personnel 
            if (!role || role.trim() === "") {
                return roles.includes("All Personnel");
            }
            return (
                roles.includes(role) ||
                roles.includes("All Personnel")
            );
        };


          const mapped = docs.map(mapDoc).sort((a, b) => a.name.localeCompare(b.name)); 

        // return {
        //     level1: mapped.filter(d => match(d.keyUserLevel1)),
        //     level2: mapped.filter(d => match(d.keyUserLevel2)),
        //     level3: mapped.filter(d => match(d.keyUserLevel3))
        // };
        return {
            level1: mapped.filter(d => matchesRole(d.keyUserLevel1, role)),
            level2: mapped.filter(d => matchesRole(d.keyUserLevel2, role)),
            level3: mapped.filter(d => matchesRole(d.keyUserLevel3, role))
        };
    }

    // ================= USER QUICK LINKS =================

    public async getUserQuickLinks(
        sp: SPFI,
        listName: string,
        userId: number
    ): Promise<any[]> {

        const spCache = sp;

        return await spCache.web.lists
            .getByTitle(listName)
            .items
            .select("Id", "Title", "DocumentTitle", "DocumentUrl")
            .filter(`AuthorId eq ${userId}`)
            .orderBy("Title")();
    }

    public async addUserQuickLink(
        sp: SPFI,
        listName: string,
        payload: {
            Title: string;
            DocumentTitle: string;
            DocumentUrl: string;
        }
    ): Promise<void> {

        await sp.web.lists
            .getByTitle(listName)
            .items.add(payload);
    }

    public async deleteUserQuickLink(
        sp: SPFI,
        listName: string,
        id: number
    ): Promise<void> {

        await sp.web.lists
            .getByTitle(listName)
            .items.getById(id)
            .delete();
    }

    /**
 * Returns ALL TMS Documents for Quick Links (GLOBAL – no role/location filter)
 * Matches legacy `alldocuments` behavior
 */
    public async getAllTmsDocuments(sp: SPFI): Promise<IDocument[]> {

        const spCache = sp;

        const items = await spCache.web.lists
            .getByTitle(strings.TMSDocumentLib)
            .items
            .select(
                "Title",
                "LinkFilename",
                "FileLeafRef",
                "EncodedAbsUrl",
                "ContentTypeId"
            )
            //.expand("ContentType")
            // .filter(`ContentType/Name eq 'TMS Documents'`)
            .filter(`startswith(ContentTypeId, '0x010100C9D9CF16A53603408030E2D352479CC601')`)  // ✅ TMS Documents
            .top(5000)();

        return items.map((i: any) => ({
            title: i.Title,
            name: i.LinkFilename.split(".")[0],
            documentType: "",
            primaryElement: "",
            primarySite: "",
            Link: i.EncodedAbsUrl,
            department: "",
            parentDocNo: "",
            templates: "",
            extracts: "",
            expectations: [],
            order: 0,
            fileLeafRef: i.FileLeafRef,
            relatedElement: ""
        }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Returns ALL Procedures / Extracts for Quick Links
     * Matches legacy `allprocedures` behavior
     */
    public async getAllProcedures(sp: SPFI): Promise<IDocument[]> {

        const spCache = sp;

        const items = await spCache.web.lists
            .getByTitle(strings.TMSDocumentLib)
            .items
            .select(
                "Title",
                "LinkFilename",
                "FileLeafRef",
                "EncodedAbsUrl",
                "ContentTypeId"
                //  "ContentType/Name"
            )
            // .expand("ContentType")
            // .filter(`ContentType/Name eq 'TMS Supporting Documents'`)
            .filter(`startswith(ContentTypeId, '0x0101005FCA19EFB27EDB42A9A5BAA8E26E4CD801')`)
            .top(5000)();

        return items.map((i: any) => ({
            title: i.Title,
            name: i.LinkFilename.split(".")[0],
            documentType: "",
            primaryElement: "",
            primarySite: "",
            Link: i.EncodedAbsUrl,
            department: "",
            parentDocNo: "",
            templates: "",
            extracts: "",
            expectations: [],
            order: 0,
            fileLeafRef: i.FileLeafRef,
            relatedElement: ""
        }))
            .sort((a, b) => a.name.localeCompare(b.name));
    }
}


