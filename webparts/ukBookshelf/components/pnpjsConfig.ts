/* eslint-disable  @typescript-eslint/no-non-null-assertion */

import { WebPartContext } from "@microsoft/sp-webpart-base";

// import pnp and pnp logging system
import { spfi, SPFI, SPFx } from "@pnp/sp";
import { LogLevel, PnPLogging } from "@pnp/logging";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/batching";

let _sp: SPFI|undefined = undefined;

export const getSP = (context?: WebPartContext): SPFI => {
  if (_sp === undefined && context !== undefined) {
    //You must add the @pnp/logging package to include the PnPLogging behavior it is no longer a peer dependency
    // The LogLevel set's at what level a message will be written to the console
    _sp = spfi().using(SPFx(context)).using(PnPLogging(LogLevel.Warning));
  }
  return _sp!;
};

// var _sp: SPFI | null = null;

// export const getSP = (context?: WebPartContext): SPFI => {
//   if (_sp === undefined && context !== undefined) {
//     //You must add the @pnp/logging package to include the PnPLogging behavior it is no longer a peer dependency
//     // The LogLevel set's at what level a message will be written to the console
//     _sp = spfi().using(SPFx(context)).using(PnPLogging(LogLevel.Warning));
//   }
//   return _sp!;
// };

/*
This definitely seems like an issue in the tutorial. SPFx 1.17.4 began enabling strict null checks by default in newly created solutions. So this error message is correct, you cannot assign null to an SPFI type.

To fix this in your local solution, please change:

var _sp: SPFI = null;

to:

var _sp: SPFI | null = null;

This will then cause the return statement to fail, to address this, simply add a non-null assertion. Change the return line:

return _sp;,

to

return _sp!;*/