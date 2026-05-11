import * as React from 'react';
import styles from './UkBookshelf.module.scss'    
// import { FontIcon } from '@fluentui/react/lib/Icon';
import { IWhatsNew } from './IItem';
import { DefaultButton } from 'office-ui-fabric-react';
// import Pagination from "react-js-pagination";

export interface IPaginationProps {
    totalItemsCount: number;
    totalPerPage: number;
    currentPage: number;
    fetchedItemsCount: number;
    // isSearchBtnPressed: boolean;
    _renderPagedItemHandler: (currentPage: number, pageSize?:number, filteredWhatsNew?: IWhatsNew[], IsSearched?: boolean) => void;
}

export default class Pagination extends React.Component<IPaginationProps, {}> {

    constructor(props: IPaginationProps) {
        super(props);
    }

    public render(): React.ReactElement<IPaginationProps> {
        const totalItems = this.props.totalItemsCount;
        const totalPerPage = this.props.totalPerPage;
        const currentPage = this.props.currentPage;
        const currentItemsCount = this.props.fetchedItemsCount;

        const showFrom = currentItemsCount === 0 ? 0 : ((currentPage - 1) * totalPerPage) + 1;
        let showTo = (showFrom + totalPerPage);
         showTo = ((showTo - 1) < currentItemsCount ? currentItemsCount : (showTo - 1));
        showTo = (currentItemsCount < totalPerPage) ? totalItems : showTo;

        return (
            <div className={styles.pagination}>
                <div className={styles.arrow}>
                    <DefaultButton aria-label="Left" className={totalItems <= totalPerPage ? styles.arrowNavDisabled : showFrom === 1 ? styles.arrowNavDisabled : styles.arrowNav}
                       text="Previous" onClick={currentPage === 1 ? this.returnVoid : this._handlePreviousClick.bind(this)} />
                    <DefaultButton aria-label="ChevronRight" className={totalItems <= totalPerPage ? styles.arrowNavDisabled :
                        currentItemsCount < totalPerPage ? styles.arrowNavDisabled : showTo === totalItems ? styles.arrowNavDisabled : styles.arrowNav}
                        text="Next" onClick={currentItemsCount < totalPerPage ? this.returnVoid : this._handleNextClick.bind(this)} />
                </div>
                <div className={styles.pageNav}>
                    <span className={styles.floatleft}>Showing {showFrom} </span>
                    <span className={currentItemsCount > 1 ? styles.show : styles.hide} > to {showTo}</span>
                    <span className={styles.floatleft}> of {totalItems} entries</span>
                </div>
            </div>
        );
    }

    private _handlePreviousClick(): void {
        let currentPage = this.props.currentPage;
        currentPage = (currentPage === 1) ? currentPage : currentPage - 1;
        this.props._renderPagedItemHandler(currentPage);
    }

    private _handleNextClick(): void {
        let currentPage = this.props.currentPage;
        const totalItems = Math.ceil(this.props.totalItemsCount / this.props.totalPerPage);
        currentPage = (currentPage < totalItems) ? currentPage + 1 : currentPage;
        this.props._renderPagedItemHandler(currentPage);
    }

    private returnVoid(): boolean {
        return false;
    }

}

// export default Pagination;