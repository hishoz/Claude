import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';

import { mergeStyleSets } from '@fluentui/react/lib/Styling';
import { IWhatsNew } from './IItem';
import Pagination from './Pagination';
import * as dayjs from 'dayjs';
// import styles from './UkBookshelf.module.scss';


const classNames = mergeStyleSets({
    header: {
        padding: 0,
        fontSize: '16px',
        backgroundColor: 'gainsboro',
        textOverflow: 'clip'
    },
    row: {
        textAlign: 'left',
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

        // width:60,
        backgroundColor: '$ms-color-neutralLight'
    },
    docTitle: {
        color: 'rgb(44, 42, 42)',
        textDecoration: 'none',
        fontSize: '12px',
        fontFamily:'Arial !important',
        selectors: {
            // '&:visited': {
            //     color: 'blue',
            // },
            '&:hover': {
                textDecoration: 'underline'
            }
        }
    }

});

const onRenderDetailsHeader = (headerProps: any, defaultRender: (arg0: any) => any): any => {
    if (!headerProps || !defaultRender) {
        //technically these may be undefined...
        return null;
    }
    return defaultRender({
        ...headerProps,
        styles: {
            root: {
                selectors: {
                    '.ms-DetailsHeader-cell': {
                        whiteSpace: 'normal',
                        textOverflow: 'clip',
                        lineHeight: 'normal',
                    },
                    '.ms-DetailsHeader-cellTitle': {
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'left',
                        fontFamily:'Arial !important'
                    },
                },
            },
        },
    })
}

export interface IListProps {
    whatsNewItems: IWhatsNew[];
    isSafetyReferenceDocs?: boolean;
    totalPerPage: number;
    totalItemsCount: number;
    currentPage: number;
    fetchedItemsCount: number;
    // isSearchBtnPressed: boolean;
    _renderPagedItemHandler: (currentPage: number, pageSize?:number, filteredWhatsNew?: IWhatsNew[], IsSearched?: boolean) => void;
}

export default class WhatsNewListView extends React.Component<IListProps, {}> {
    private _whatsNewColumns: IColumn[];


    constructor(props: IListProps) {
        super(props);

        this._whatsNewColumns = [
            {
                key: 'column1',
                name: 'Document Number',
                fieldName: 'Document Number',
                headerClassName: classNames.header,
                className: classNames.row,
                minWidth: 40,
                maxWidth: 100,

                onRender: (item: IWhatsNew) => {
                    return (
                        <a className={classNames.docTitle} href={item.URLRef} data-interception="off" target="_blank" rel="noreferrer">{item.DocumentNumber}</a>
                    );
                },
            },
            {
                key: 'column2',
                name: 'Document Title',
                fieldName: 'Document Title',
                headerClassName: classNames.header,
                className: classNames.row,
                minWidth: 400,
                maxWidth: 800,
                isMultiline: true,

                onRender: (item: IWhatsNew) => {
                    return (
                        <a className={classNames.docTitle} href={item.URLRef} data-interception="off" target="_blank" rel="noreferrer">{item.DocumentTitle}</a>
                    );
                },
            },
            {
                key: 'column3',
                name: 'Date',
                fieldName: 'Date',
                headerClassName: classNames.header,
                className: classNames.row,
                minWidth: 100,
                maxWidth: 150,
                isMultiline: true,

                onRender: (item: IWhatsNew) => {

                    return (
                        <span className={classNames.docTitle}>{dayjs(item.DateRef).format('DD/MM/YYYY')}</span>
                    );
                },
            },
        ];

    }


    public render(): React.ReactElement<IListProps> {
        return (
            <div>
            
                    <>
                  {/* <div className={styles.zebraDetailList}> */}
                        <DetailsList
                            items={this.props.whatsNewItems}
                            columns={this._whatsNewColumns}
                            setKey="set"
                            selectionMode={SelectionMode.none}
                            layoutMode={DetailsListLayoutMode.justified}
                            selectionPreservedOnEmptyClick={true}
                            onRenderDetailsHeader={onRenderDetailsHeader}
                            ariaLabelForSelectionColumn="Toggle selection"
                            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                            checkButtonAriaLabel="select row"

                        />
                     {/*    </div> */}
                        <Pagination
                            totalItemsCount={this.props.totalItemsCount}
                            totalPerPage={this.props.totalPerPage}
                            currentPage={this.props.currentPage}
                            // isSearchBtnPressed={this.props.isSearchBtnPressed}
                            fetchedItemsCount={this.props.fetchedItemsCount}
                            _renderPagedItemHandler={this.props._renderPagedItemHandler}
                        />
                    </>
                 
                        
                
               

            </div>
        );
    }



}

