import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';
//import { IItem } from './IItem';
import { IDocument, ISafetyReferenceDocument } from './IDocument';
import { mergeStyleSets } from '@fluentui/react/lib/Styling';
// import styles from './Bookshelf.module.scss';
import { IDetailsListStyleProps, IDetailsListStyles, IDetailsRowStyleProps, IDetailsRowStyles, IStyleFunctionOrObject } from 'office-ui-fabric-react';

const detailListStyles: IStyleFunctionOrObject<IDetailsListStyleProps, IDetailsListStyles> = {
    root: {
        minHeight: '18px !important',
        textAlign: 'left',
        display:'block !important',
        fontFamily:'Arial, Helvetica, sans-serif !important',
        borderBottom:'0px'
        // height:'30px !important'
    },

};

const detailRowStyles: IStyleFunctionOrObject<IDetailsRowStyleProps, IDetailsRowStyles> = {
    cell: {
        display: 'flex',
        alignItems: 'stretch',
        paddingTop: '6px !important',
        paddingLeft:'0px !important',
        overflowX:'visible !important',
        overflowY:'visible !important',
        fontFamily:'Arial, Helvetica, sans-serif'
    },
    root: {
        minHeight: '18px !important',
        textAlign: 'left',
        display:'block !important',
        fontFamily:'Arial, Helvetica, sans-serif !important',
        borderBottom:'0px'
        // height:'30px !important'
    },
};

const classNames = mergeStyleSets({
    header: {
        padding: 0,
        fontSize: '16px',
        backgroundColor: 'gainsboro',
        textOverflow: 'clip'
    },

    row: {
        textAlign: 'center',
        selectors: {
            '&:before': {
                content: '.',
                display: 'inline-block',
                verticalAlign: 'middle',
                height: '100%',
                width: '0px',
                visibility: 'hidden',
                
            },
        root:{
            minHeight: '18px !important',
            textAlign: 'left',
            display:'block !important',
            fontFamily:'Arial, Helvetica, sans-serif !important'
        }
        },
        wordBreak:'normal',
        // width:60,
        backgroundColor: '$ms-color-neutralLight'
    },

    cell: {
        minHeight: '18px !important',
        maxWidth: '120px !important',
        minWidth: '8% !important',
        textAlign: 'left',
        paddingTop: '0px !important',
        paddingBottom: '0px !important',
        paddingLeft:'0px !important',
        overflowX:'visible !important',
        overflowY:'visible !important',
        selectors: {
            '&:before': {
                content: '.',
                display: 'inline-block',
                verticalAlign: 'middle',
                height: '100%',
                width: '0px',
                visibility: 'hidden',
            },
        },
        backgroundColor: '$ms-color-neutralLight'
    },
    isMultiline: {
        minHeight: '18px !important',
        maxWidth: '500px !important',
        minWidth: '66% !important',
        textAlign: 'left',
        paddingTop: '0px !important',
        paddingBottom: '0px !important',
        selectors: {
            '&:before': {
                content: '.',
                display: 'inline-block',
                verticalAlign: 'middle',
                height: '100%',
                width: '0px',
                visibility: 'hidden',
            },
        },
        backgroundColor: '$ms-color-neutralLight'
    },
    docTitle: {
        color: 'rgb(44, 42, 42)',
        textDecoration: 'none',
        fontSize: '12px',
        selectors: {
            // '&:visited': {
            //     color: 'blue',
            // },
            '&:hover': {
                textDecoration: 'underline',
                cursor: 'pointer'
            }
        }
    }

});

// const onRenderDetailsHeader = (headerProps: any, defaultRender: (arg0: any) => any): any => {
//     if (!headerProps || !defaultRender) {
//         //technically these may be undefined...
//         return null;
//     }
//     return defaultRender({
//         ...headerProps,
//         styles: {
//             root: {
//                 selectors: {
//                     '.ms-DetailsHeader-cell': {
//                         whiteSpace: 'normal',
//                         textOverflow: 'clip',
//                         lineHeight: 'normal',
//                     },
//                     '.ms-DetailsHeader-cellTitle': {
//                         height: '100%',
//                         alignItems: 'center',
//                         justifyContent: 'center'
//                     },
//                 },
//             },
//         },
//     })
// }

// const onRenderDetailRows = (props: any, defaultRender: (arg0: any) => any): any => {
//     if (!props || !defaultRender) {
//         //technically these may be undefined...
//         return null;
//     }
//     return defaultRender({
//         ...props,
//         styles: {
//             detailRowStyles,
//             root:{
//                 selectors:{
//                     'ms-DetailsRow-cell':{
//                         minHeight:'30px',
//                         maxWidth:'120px',
//                         minWidth:'8%',
//                         textAlign:'left',
//                         paddingTop:'0px',
//                         paddingBottom:'0px',
//                         backgroundColor:'red'
//                     },
//                     '.ms-DetailsRow-cell.isMultiline':{
//                         minHeight:'30px',
//                         maxWidth:'500px',
//                         minWidth:'75%',
//                         textAlign:'left',
//                         paddingTop:'0px',
//                         paddingBottom:'0px'
//                     }
//                 },

//                 }
//             }

//     });
// }

// const dialogContentProps = {
//     type: DialogType.largeHeader,
//     title: `Element 1 – Leadership Involvement and Responsibility
//             Element Sponsor: Donald Taylor
//             Element Owner: John Mulvany`,
//     subText: `Assurance of our operational integrity requires visible leadership commitment and accountability al all levels of the organisation.

//             Management must establish a Health, Safety and Environmental (HSE) Policy, provide HSE perspective, set safety performance targets and provide the structure/resources necessary to achieve them.",
//     `
// };

// const modelProps = {
//     isBlocking: false,
//     styles: { main: { maxWidth: 600 } },
// };

export interface IListProps {
    items: IDocument[];
    safetyReferenceItems: ISafetyReferenceDocument[];
    // hideDialogContent: boolean;
    setOpenDialogContent: (value: boolean, item: string[]) => void;
    // onClose: () => void;
    navTabSelected: string;
    // whatsNewItems: IWhatsNew[];
    isSafetyReferenceDocs?: boolean;
}

export default class ListView extends React.Component<IListProps, {}> {
    // private hideDialog: boolean = true;
    private _columns: IColumn[];
    // private _whatsNewColumns: IColumn[];
    private safetyRuleColumns: IColumn[];
    private dialogTitle: string = "";
    private dialogDocLink: string = "";
    private dialogName: string = "";

    constructor(props: IListProps) {
        super(props);

        this._columns = [

            {
                key: 'column1',
                name: '',
                className: classNames.cell,
                // headerClassName: classNames.header,
                // fieldName: strings.ConfidenceScore,
                //isMultiline: true,
                styles: detailRowStyles,
                minWidth: 60,
                maxWidth: 250,
                onRender: (item: IDocument) => {
                    return (
                        <a className={classNames.docTitle} href={item.Link} data-interception="off" target="_blank" rel="noreferrer">{item.name}</a>
                    );
                },
            },
            {
                key: 'column2',
                name: '',
                styles: detailRowStyles,
                className: classNames.isMultiline,
                minWidth: 200,
                maxWidth: 500,
                isMultiline: true,

                onRender: (item: IDocument) => {
                    return (
                        <a className={classNames.docTitle} href={item.Link} data-interception="off" target="_blank" rel="noreferrer">{item.title}</a>
                    );
                },
            },
            {
                key: 'column3',
                name: '',
                styles: detailRowStyles,
                className: classNames.cell,
                minWidth: 60,
                maxWidth: 120,

                onRender: (item: IDocument) => {
                    return (
                        <a className={classNames.docTitle} style={{ color: 'blue', fontStyle: 'italic', textDecoration: 'underline' }}
                            onClick={() => this.openDialog(item,"templates")}>{item.templates}</a>
                    );
                },
            },
            {
                key: 'column4',
                name: '',
                styles: detailRowStyles,
                className: classNames.cell,
                minWidth: 60,
                maxWidth: 120,

                onRender: (item: IDocument) => {
                    return (
                        <a className={classNames.docTitle} style={{ color: 'blue', fontStyle: 'italic', textDecoration: 'underline' }}
                            onClick={() => this.openDialog(item,"extracts")}>{item.extracts}</a>
                    );
                },
            }
        ];

        this.safetyRuleColumns = [

            {
                key: 'column1',
                name: '',
                className: classNames.cell,
                // headerClassName: classNames.header,
                // fieldName: strings.ConfidenceScore,
                //isMultiline: true,
                styles: detailRowStyles,
                minWidth: this.props.navTabSelected === "EssentialSafetyRules" || this.props.navTabSelected === "SafetyCases" ? 100 : 30,
                maxWidth: 100,
                onRender: (item: IDocument) => {
                    return (
                        <a className={classNames.docTitle} href={item.Link} data-interception="off" target="_blank" rel="noreferrer">{item.name}</a>
                    );
                },
            },
            {
                key: 'column2',
                name: '',
                className: classNames.isMultiline,
                styles: detailRowStyles,
                minWidth: this.props.navTabSelected === "EssentialSafetyRules" || this.props.navTabSelected === "SafetyCases" ? 400 : 100,
                maxWidth: 400,
                isMultiline: true,

                onRender: (item: IDocument) => {
                    return (
                        <a className={classNames.docTitle} href={item.Link} data-interception="off" target="_blank" rel="noreferrer">{item.title}</a>
                    );
                },
            },
        ];

    }


    public render(): React.ReactElement<IListProps> {
        // const [hideDialogContent, setOpenDialogContent] = React.useState(true);
        // const { onClose } = this.props;

        // const createContentArea = (item: IDocument): JSX.Element => (
        //     <div className={styles.flexContainer} >
        //         <div className={styles.dialogList} >
        //             <a className={styles.aDialogList} href={item.Link} data-interception="off" target="_blank" rel="noreferrer"> {item.name}</a>
        //         </div>
        //         <div className={styles.dialogList} >
        //             <a className={styles.aDialogList} href={item.Link} data-interception="off" target="_blank" rel="noreferrer"> {item.title}</a>
        //         </div>
        //     </div>

        // );
        // const dialogList = this.props.items.filter(m => m.parentDocNo === this.dialogName).map(createContentArea);
        // const handleClose = () => (): void => {
        //     onClose();
        // };
        return (
            <div>
                {

                    this.props.isSafetyReferenceDocs ?
                        <DetailsList
                            items={this.props.safetyReferenceItems}
                            columns={this.safetyRuleColumns}
                            setKey="set"
                            selectionMode={SelectionMode.none}
                            layoutMode={DetailsListLayoutMode.justified}
                            selectionPreservedOnEmptyClick={true}
                            //  onRenderDetailsHeader={onRenderDetailsHeader}
                            ariaLabelForSelectionColumn="Toggle selection"
                            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                            checkButtonAriaLabel="select row"
                            isHeaderVisible={false}
                            styles={detailListStyles}
                            compact={true}
                        // onRenderRow={onRenderDetailRows}
                        />
                        :
                        <DetailsList
                            items={this.props.items}
                            columns={this.props.navTabSelected === "EssentialSafetyRules" || this.props.navTabSelected === "Expectations" || this.props.navTabSelected === "SafetyCases" ? this.safetyRuleColumns : this._columns}
                            setKey="set"
                            selectionMode={SelectionMode.none}
                            layoutMode={DetailsListLayoutMode.justified}
                            selectionPreservedOnEmptyClick={true}
                            //  onRenderDetailsHeader={onRenderDetailsHeader}
                            ariaLabelForSelectionColumn="Toggle selection"
                            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                            checkButtonAriaLabel="select row"
                            isHeaderVisible={false}
                            styles={detailListStyles}
                            compact={true}
                        // onRenderRow={onRenderDetailRows}
                        />
                }
                {/* <Dialog
                    hidden={this.props.hideDialogContent}
                    onDismiss={handleClose()}
                    // dialogContentProps={{
                    //     type: DialogType.largeHeader,
                    //     title: this.dialogTitle
                    // }}
                    modalProps={modelProps}
                >
                    <div>
                        <div>
                            <a className={styles.dialogTitle} href={this.dialogDocLink} data-interception="off" target="_blank" rel="noreferrer">{this.dialogTitle}</a>
                        </div>
                        {...dialogList}
                    </div>
                    <DialogFooter>
                        <DefaultButton onClick={handleClose()} text="OK" />
                    </DialogFooter>
                </Dialog> */}
                {/* <DialogItems
                     title={title}
                     dialogList={dialogList}
                /> */}

            </div>
        );
    }


    // private dismissDialog= () => () => {
    //     this.props.onClose();
    //   };
    private openDialog(item: IDocument,docType:string): void {
        this.dialogTitle = item.templates === "templates" ?
            "Templates within " + item.title + " (" + item.name + ")" :
            "Extracts from " + item.title + " (" + item.name + ")";
        this.dialogName = item.name;
        this.dialogDocLink = item.Link;
        this.props.setOpenDialogContent(false, [this.dialogTitle, this.dialogName, this.dialogDocLink, docType]);
    }
    // private setOpenDialog(value: boolean): void {
    //     this.hideDialog = value;
    // }

}

