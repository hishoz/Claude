export interface IItem {
    value: string;
    url: string;
    element: string;
    order: number;
}


export interface IEssentialSafetyRulesItems {
    Id: number;
    Title: string;
    Description: string;
    Icon: string;
    Order: string;
}

export interface ISafetyCases {
    Id: number;
    Title: string;
    ActualValue: string;
    Midstream?: boolean;
    Upstream?: boolean;
}

export interface ITMSExpectations {
    Id: number;
    Title: string;
    ExpectationCode: string;
    ExpectationTitle: string;
    EIElement: string;
    Order:number;
}

export interface IWhatsNew {
    Id: number;
    Title: string;
    DateRef: string;
    DocumentNumber: string;
    DocumentTitle: string;
    Upstream?: boolean;
    Midstream?: boolean;
    URLRef: string;
}

