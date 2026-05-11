import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneSlider,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { MSGraphClientV3, HttpClient } from '@microsoft/sp-http';

import * as strings from 'UkBookshelfWebPartStrings';
import Bookshelf from './components/UkBookshelf';
import { IUkBookshelfProps } from './components/IUkBookshelfProps';
import { getSP } from './components/pnpjsConfig';

export interface IUkBookshelfWebPartProps {
  _graphHttpClient: MSGraphClientV3;
  // isHQ: boolean;
  // selectedTab:string;
  webClient: HttpClient;
  pageSize: number;
}

export default class UkBookshelfWebPart extends BaseClientSideWebPart<IUkBookshelfWebPartProps> {

  /**
   * Initialize sp
   * @returns {void}
   */
  protected async onInit(): Promise<void> {
    await super.onInit();
    getSP(this.context);
    return new Promise((resolve, reject) => {
      this.context.msGraphClientFactory.getClient("3").then((client) => {
        this.properties._graphHttpClient = client;
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  public render(): void {
    const element: React.ReactElement<IUkBookshelfProps> = React.createElement(
      Bookshelf,
      {
        spHttpClient: this.context.spHttpClient,
        graphHttpClient: this.properties._graphHttpClient,
        webClient: this.context.httpClient,
        pageSize: this.properties.pageSize !== undefined ? this.properties.pageSize : 5,

        context: this.context,
        redirectUrl: this.context.pageContext.web.absoluteUrl,
        tmsDocumentIdIsLookup: false // set true if the Register column is a Lookup

      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneSlider('pageSize', {
                  label: strings.PageSizeFieldLabel,
                  min: 5,
                  max: 30,
                  step: 5,
                  value: 5,
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
