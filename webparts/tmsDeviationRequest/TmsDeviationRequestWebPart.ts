import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import TmsDeviationRequest from './components/TmsDeviationRequest';
import { ITmsDeviationRequestProps } from './components/ITmsDeviationRequestProps';

export interface ITmsDeviationRequestWebPartProps {
  redirectUrl: string;
  tmsDocumentIdIsLookup: boolean;

}

export default class TmsDeviationRequestWebPart extends BaseClientSideWebPart<ITmsDeviationRequestWebPartProps> {


  public render(): void {
    const element: React.ReactElement<ITmsDeviationRequestProps> = React.createElement(
      TmsDeviationRequest,
      {
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
            description: "TMS Deviation Request settings"
          },
          groups: [
            {
              // groupName: strings.BasicGroupName,
              groupFields: [

                PropertyPaneToggle('tmsDocumentIdIsLookup', {
                  label: 'Register column "TMSDocumentId" is a Lookup',
                  onText: 'Lookup (use TMSDocumentIdId)',
                  offText: 'Number (use TMSDocumentId)'
                })

              ]
            }
          ]
        }
      ]
    };
  }


}
