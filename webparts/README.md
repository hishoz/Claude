# Webparts – Solution & Support Documentation

This document describes the two SharePoint Framework (SPFx) web parts contained in the `webparts/` folder and provides the supporting information required for handover to operational support.

---

## 1. Solution Overview

### High‑level overview of the migrated sites and business purpose
The `webparts/` folder contains two custom SPFx client‑side web parts that power the **TAQA UK *TMS Bookshelf*** SharePoint Online site (`https://taqaglobal.sharepoint.com/sites/TBR-Bookshelf/`). The Bookshelf is the company portal for the Technical Management System (TMS), where staff browse procedures, standards and related documents that describe how the business operates.

| Web part | Folder | Business purpose |
| --- | --- | --- |
| **UK Bookshelf** | `ukBookshelf/` | The multi‑view portal used to browse TMS documents by *element*, *expectation*, *legislation*, *user role* and "what's new", with personal *Quick Links*. |
| **TMS Deviation Request** | `tmsDeviationRequest/` | A form that lets staff raise a formal request to deviate from a specific TMS document. Submissions are written to the **TMS Document Deviation Register** list and routed to an approver. |

### Scope of the migration and any major exclusions
**In scope (this folder):**
- The source code for the two SPFx web parts listed above (TypeScript/React components, services, type definitions, SCSS modules, localised strings, manifest files and default web part preview assets).

**Out of scope / exclusions:**
- The hosting **SharePoint site** itself (`TBR-Bookshelf`), its site columns, content types, lists/libraries, permissions and pages are *not* part of this folder. The web parts assume those exist with specific titles and schemas (see *Section 3 – SharePoint dependencies*).
- The **SPFx solution scaffolding** (`package.json`, `gulpfile.js`, `config/`, `sharepoint/solution/*.sppkg` build output, yo‑office generated files) is not present in this folder – only the web part source. The repo root `package.json`, `vite.config.js` and `src/` directory belong to an unrelated "Business Case Assessor" Vite app.
- **Data migration** of TMS documents, legislation, roles, etc. into the SharePoint lists is out of scope of this documentation.
- The **`UkBookshelfWebPartStrings`** localisation module is shared by the Deviation Request web part for site URL and list names – there is no separate string file for it.

### Summary of any known limitations, risks, or technical debt
- **Hard‑coded site URL.** `loc/en-us.js` in both web parts hard‑codes `https://taqaglobal.sharepoint.com/sites/TBR-Bookshelf/` and the bookshelf logo URL. The web parts will not work on any other site collection without code changes.
- **Hard‑coded SharePoint list/library names** (e.g. `TMS Documents`, `TMS Elements`, `Assets`, `Roles`, `User Defined Links`, `Legislations List`, `TMS Document Deviation Register`). Renaming a list in SharePoint will break the web part.
- **Hard‑coded content‑type IDs** in `Service.getAllTmsDocuments` (`0x010100C9D9CF16A53603408030E2D352479CC601`) and `getAllProcedures` (`0x0101005FCA19EFB27EDB42A9A5BAA8E26E4CD801`). If the content types are re‑provisioned with new IDs, the Quick Links pickers will return no results.
- **Cross‑web‑part coupling.** `tmsDeviationRequest/components/TmsDeviationRequest.tsx` and `Service.ts` import strings from `UkBookshelfWebPartStrings`. The Deviation Request web part therefore depends on the UK Bookshelf string file being present in the same SPFx solution.
- **View routing via query string.** The active Bookshelf view is selected from a `selected=` query‑string parameter; a user landing on `Bookshelf.aspx` with no value is *force‑navigated* via `window.location.href` to `?selected=TAQAUKBookshelf`. `componentDidMount` also calls `window.location.reload()` when `localStorage.location` differs from the current URL, which can cause unexpected page reloads.
- **Mixed coding styles & dead code.** `UkBookshelf.tsx` (~1,680 lines) contains a large amount of commented‑out code, mixes Promise chains with `async/await`, manipulates the DOM directly to toggle bold styling (`document.getElementById`, `window.getComputedStyle`), and uses `console.log` for both diagnostics and error logging. `Service.ts` (~1,100 lines) has several near‑duplicate methods.
- **Older Office UI Fabric React imports** are used alongside newer `@fluentui/react` imports (e.g. `office-ui-fabric-react/lib/Pickers` in the Deviation Request web part). Future Fluent UI upgrades will require consolidating these.
- **`MSGraphClientV3`** is initialised in `UkBookshelfWebPart.onInit` and passed to the React component, but in the code reviewed it is not actively used – it is reserved for future Graph calls.
- **Limited error handling.** Most service calls log errors to the console and silently resolve with `undefined`/empty arrays; the UI generally does not surface failures to the user.
- The **bookshelf page size** property pane setting exists (5–30) but the component primarily uses its own `pageSize` state (default 25 in state, 5 from the web part property if undefined). The two values are not fully reconciled.
- **People search** in `tmsDeviationRequest/Service.searchUsers` uses the SharePoint Search People result source (`B09A7990-05EA-4AF9-81EF-EDFAB16C4E31`) and requires the tenant search index to be healthy and populated.

### Key contacts, site owners, and support ownership
*To be confirmed during handover.*

| Role | Name | Email/Team |
| --- | --- | --- |
| Site owner (TBR‑Bookshelf) | *TBD* | |
| TMS business owner | *TBD* | |
| Element Owners / Sponsors | Maintained inside the `TMS Elements` list (`ElementOwner`, `ElementSponsor` columns) | |
| TMS Deviation Approvers | Listed in para 3 ("Terminology and Deviations") of each TMS document | |
| Application support owner | *TBD* | |
| Tier‑1 / service desk | *TBD* | |
| Tier‑2 / development support | *TBD* | |
| Tier‑3 / vendor / escalation | *TBD* | |

---

## 2. Site & Ownership Information

### List of migrated SharePoint sites and URLs
| Site | URL |
| --- | --- |
| TAQA UK – TMS Bookshelf | `https://taqaglobal.sharepoint.com/sites/TBR-Bookshelf/` |
| Bookshelf landing page | `https://taqaglobal.sharepoint.com/sites/TBR-Bookshelf/SitePages/Bookshelf.aspx` (views selected via `?selected=TAQAUKBookshelf|Expectations|WhatsNew|Legislations|MyDocuments`) |

### Associated SharePoint groups, M365 Groups or Teams (if applicable)
*To be confirmed during handover.* The web parts are declared in their manifests as compatible with `SharePointWebPart`, `SharePointFullPage`, `TeamsTab` and `TeamsPersonalApp` hosts, but the Teams integration is not in active use within this folder's code.

### Permissions model overview, including any significant unique permissions
- The web parts call SharePoint with the **signed‑in user's permissions** via PnPjs/SPFx (no app‑only auth in the code).
- The user must have at least **read** access to: `TMS Documents`, `TMS Elements`, `Assets`, `TMS Departments`, `Key Documents`, `Supporting Documents`, `TMS Expectations`, `What's New`, `Legislations List`, `Roles`, `Rendition`, `Safety Case Reference Documents`.
- The user must have **add / edit / delete** rights on the *personal* lists they interact with: `User Defined Roles`, `User Defined Links`, `User Defined Procedures Links`.
- Submitting a deviation requires **add** rights to `TMS Document Deviation Register` and **add attachment** rights on items in that list.
- The Deviation Request form calls `web.ensureUser(...)` for requestor, approver and assessors, which requires the user to be permitted to add users to the site (default for members in most tenants).
- *Significant unique permissions per list/library are to be confirmed during handover.*

### Retention, compliance, or external sharing considerations (if applicable)
*To be confirmed during handover.* No retention or DLP policies are configured by the web part code itself. Items written to `TMS Document Deviation Register` and personal Quick Links lists will inherit any policies applied at site or library level. The Deviation Request form blocks submission for competence‑related deviations and instructs users to contact Learning & Development instead.

---

## 3. Customisations & Integrations

### Details of any custom branding, layouts, themes, CSS, or JavaScript
- Each web part has its own SCSS module: `ukBookshelf/components/UkBookshelf.module.scss` (with generated `.module.scss.ts`) and `tmsDeviationRequest/components/TmsDeviationRequest.module.scss`.
- The Bookshelf relies on inline styles for the colour bar of the selected element (`backgroundColor: i.BSElementColour` taken from the `TMS Elements` list).
- The UK Bookshelf web part manifest enables `supportsThemeVariants: true` and `supportsFullBleed: true`, so the SharePoint theme variants apply and the part can be rendered full‑width.
- The Bookshelf manipulates the DOM directly to bold the currently selected left‑navigation item (`document.getElementById(...).style.fontWeight = 'bold'`).
- No global CSS or custom JavaScript outside the web parts is included in this folder.

### Details of any SPFx components, custom web parts, or third‑party add‑ons
Two SPFx client‑side web parts:

| Web part | Id (manifest) | Alias |
| --- | --- | --- |
| UK Bookshelf | `c18a5363-9559-470e-b5dc-9899e3a47735` | `UkBookshelfWebPart` |
| TMS Deviation Request | `5734a766-cf44-49e7-84f5-359969d858c9` | `TmsDeviationRequestWebPart` |

**Key third‑party / Microsoft packages referenced:**
- `@microsoft/sp-core-library`, `@microsoft/sp-property-pane`, `@microsoft/sp-webpart-base`, `@microsoft/sp-http` (SPFx)
- `@pnp/sp`, `@pnp/logging` (PnPjs, with the `SPFx` behaviour)
- `@fluentui/react` (Fluent UI v8 controls: `Dropdown`, `ComboBox`, `Dialog`, `TextField`, `PrimaryButton`, `Stack`, `MessageBar`, etc.)
- `office-ui-fabric-react/lib/Pickers` and `/lib/Persona` (`NormalPeoplePicker`, `IPersonaProps`) – used by the Deviation Request form
- `react`, `react-dom`
- `dayjs` (date formatting in the "What's New" list)
- `react-js-pagination` is imported in comments in `Pagination.tsx`; the active implementation is a custom Previous/Next pager

**Files per web part:**

`ukBookshelf/`
- `UkBookshelfWebPart.ts` – SPFx web part class; initialises PnPjs (`getSP`) and the MS Graph client; renders the React component; defines the property pane (one `pageSize` slider 5–30).
- `UkBookshelfWebPart.manifest.json` – web part manifest.
- `components/UkBookshelf.tsx` – main React class component; reads `selected` query‑string and renders one of the five views (Bookshelf, Expectations, What's New, Legislation, My Documents). Holds all state and dispatches data loads to `Service`.
- `components/Service.ts` – data‑access layer over PnPjs (see *Service API* below).
- `components/pnpjsConfig.ts` – memoised PnPjs `SPFI` factory (`getSP`).
- `components/IBookshelfAppState.ts`, `IUkBookshelfProps.ts`, `IDocument.ts`, `IItem.ts`, `IScrollablePaneItem.ts` – TypeScript interfaces.
- `components/ListView.tsx` – Fluent `DetailsList`‑based document grid (largely superseded by inline rendering in `UkBookshelf.tsx`).
- `components/WhatsNewListView.tsx` – `DetailsList` for the What's New view (Document Number / Title / Date) + pagination.
- `components/Pagination.tsx` – Previous/Next pager with "Showing X to Y of N" text.
- `components/UkBookshelf.module.scss` / `.scss.ts` – styles.
- `loc/en-us.js`, `loc/mystrings.d.ts` – localised strings (also used as configuration: list/library titles, site URL, logo URL).
- `assets/welcome-light.png`, `welcome-dark.png` – default web part preview images.

`tmsDeviationRequest/`
- `TmsDeviationRequestWebPart.ts` – SPFx web part class; property pane toggle `tmsDocumentIdIsLookup`.
- `TmsDeviationRequestWebPart.manifest.json` – web part manifest.
- `components/TmsDeviationRequest.tsx` – functional React component containing the entire deviation request form, validation, people pickers, document combo box and submit/redirect logic.
- `components/Service.ts` – `DeviationService` (PnPjs/REST helpers for user profile, search, TMS documents, list‑item creation, attachment upload).
- `components/ITmsDeviationRequestProps.ts`, `components/IDeviation.ts` – props and form/data interfaces.
- `components/TmsDeviationRequest.module.scss` / `.scss.ts` – styles.
- `loc/en-us.js`, `loc/mystrings.d.ts` – strings/config.
- `assets/welcome-light.png`, `welcome-dark.png` – default web part preview images.

**UK Bookshelf views (driven by the `selected` query string):**

| `selected` | View | Description |
| --- | --- | --- |
| `TAQAUKBookshelf` | Bookshelf | Left nav of TMS elements grouped by type and colour‑coded; selecting an element shows its documents (grouped by primary site, with *templates*/*extracts* dialogs), related documents, an info dialog (element sponsor/owner/description), Key Documents, and element‑specific Supporting Documents. Location and Department dropdowns filter the document list. |
| `Expectations` | TMS Expectations | Left nav of elements with expectations; middle column lists expectations for the selected element; right column lists TMS documents aligned to the selected expectation (`TBRelatedEIExpectations/ExCode`). |
| `WhatsNew` | What's New | Paged, searchable list of TMS documents issued/updated in the last 90 days (`TBRDateRef`). Page‑size dropdown and free‑text search on document number/title/date. |
| `Legislations` | Legislation | Searchable left list from `Legislations List`; selecting one shows TMS documents whose `RelatedLegislations` lookup matches. Search is debounced 250 ms and uses `substringof` on the server. |
| `MyDocuments` | My Documents / My Quick Links | Role‑based view. Resolves saved role/location from `User Defined Roles`; lets user pick Onshore/Offshore and a role from `Roles`; shows TMS documents split into Level 1 / 2 / 3 based on `KeyUserLevel1/2/3` people fields (always including "All Personnel"). The right side is *My Quick Links* (add/remove personal links to documents and to procedures/extracts, stored in `User Defined Links` and `User Defined Procedures Links`). |

**UK Bookshelf `Service` API (selected methods):**
- Bookshelf data: `getTMSElements`, `getElements`, `getTMSDocumentsData(query, tmsAssets)`, `getRelativeDocumentsData`, `getRelativeTempSubData`, `getRenditionDocs`, `getSafetyReferenceDocs`.
- Lookups: `getDepartmentChoiceFields`, `getLocationChoiceFields`, `getKeyDocuments`, `getSupportingDocuments`, `getEssentialSafetyRulesElements`, `getTMSExpectations`, `getSafetyCases`, `getWhatsNew` (last 90 days).
- Legislation: `getLegislations`, `searchLegislations(text)`, `getTmsDocsByLegislation(id)`.
- Roles / My Documents: `getUserDefinedRole(userId)`, `saveUserDefinedRole(...)`, `getRolesByLocation(location)`, `getRoleBasedTmsDocuments(role)`, `getAllTmsDocuments()`, `getAllProcedures()`.
- Quick Links: `getUserQuickLinks(listName, userId)`, `addUserQuickLink(listName, payload)`, `deleteUserQuickLink(listName, id)`.

**TMS Deviation Request – `DeviationService` API:**
- `init(context)`, `getCurrentUserProfile()` (current user + `SPS-JobTitle`), `searchUsers(query)` (SharePoint Search people result source), `ensureUsers(logins)`, `getTmsDocumentSuggestions(webUrl, listTitle)`, `createDeviationItem(...)` (writes to `TMS Document Deviation Register` with `Status = 'Awaiting Approval'`), `uploadAttachment(webUrl, listTitle, itemId, file)`.

**SharePoint dependencies (lists, libraries and key columns):**

| List/library | Used for | Notable columns |
| --- | --- | --- |
| `TMS Elements` | Bookshelf left nav, element metadata | `ActualValue`, `BSElementColour`, `DispName`, `SortOrder`, `ElementType`, `ElementOwner`, `ElementSponsor`, `ElementDescription`, `BSDisplay`, `BSIndentLEvel` |
| `TMS Departments` | Department filter | `Title`, `BSDisplay`, `SortOrder` |
| `Assets` | Location filter | `ActualValue`, `TBLocFilter`, `TBLocOrder`, `TBSiteFilter`, `TBSiteFilterOrder`, `DocOrder` |
| `Key Documents` | Right‑hand "Key Documents" links | `Title`, `SortOrder`, `TBRURL` |
| `Supporting Documents` | Element‑specific supporting docs | `Title`, `SortOrder`, `TBRURL`, `Element` (lookup) |
| `TMS Documents` (library) | All TMS documents | `Title`, `LinkFilename`, `FileLeafRef`, `EncodedAbsUrl`, `TBDocType`, `TBPrimaryElement`, `TBPrimarySite`, `TBSafetyCase`, `TBIssuingDept`, `LinkedDocNo`, `HasTemplates`, `HasSubprocedures`, `TBRelatedEIExpectations`, `TBRelatedElements`, `DocImplemented`, `RenID`, `RelatedLegislations`, `KeyUserLevel1/2/3`, `TBDocOwner`, plus content‑type IDs `0x010100C9D9CF16A53603408030E2D352479CC601` (TMS Documents) and `0x0101005FCA19EFB27EDB42A9A5BAA8E26E4CD801` (Supporting/Procedures) |
| `TMS Expectations` | Expectations view | `Title`, `ExCode`, `ExTitle`, `EIElement`, `SortOrder` |
| `What's New` | What's New view | `Title`, `TBRDateRef`, `DocumentNumber`, `DocumentTitle`, `TBRURL` |
| `Essential Safety Rules` | (referenced in code) | `Title`, `Description`, `Icon`, `Order` |
| `Safety Cases` | (referenced in code) | `Title`, `ActualValue` |
| `Rendition` (library) | Rendition docs | as TMS Documents |
| `Safety Case Reference Documents` (library) | External safety case refs | `Title`, `LinkFilename`, `NLSafetyCase` |
| `Legislations List` | Legislation view | `Id`, `Title` |
| `User Defined Roles` | Per‑user role/location | `Title`, `Location`, `UserId` |
| `Roles` | Selectable roles per location | `Title`, `Location`, `Hidden` |
| `User Defined Links` | Per‑user Quick Links (documents) | `Title`, `DocumentTitle`, `DocumentUrl`, `AuthorId` |
| `User Defined Procedures Links` | Per‑user Quick Links (procedures) | as above |
| `TMS Document Deviation Register` | Target list for deviation submissions | `Title`, `DocumentNumber`, `DocumentTitle`, `RequestorRole`, `ReferenceNumber`, `DeviationRequestArea`, `Justification`, `RiskAssessed`, `RiskAssessment`, `Status`, `DeviationPeriod`, `Element`, `DocumentOwner`, `DateRequestedorExtended`, `RequestorNameId`, `TMSDeviationApproverId`, `RiskAssessorsId`, `TMSDocumentIdId` (lookup) |

### Power Platform components in use (Power Automate, Power Apps, etc.)
*None visible in this folder.* Any approval flow for the deviation register (e.g. Power Automate firing on item creation with `Status = 'Awaiting Approval'`) is out of scope of this codebase – to be confirmed during handover.

### Any integrations, APIs, pipelines, scheduled tasks, or automation processes
- **SharePoint REST / PnPjs** – all reads and writes from the web parts to the TBR‑Bookshelf site.
- **SharePoint Search REST** – the Deviation Request form calls `/_api/search/query` with the People result source (`B09A7990-05EA-4AF9-81EF-EDFAB16C4E31`) to populate the people pickers.
- **SharePoint User Profile** – `getCurrentUserProfile` reads `SPS-JobTitle` from the current user's profile properties.
- **MS Graph v3 client** is initialised in `UkBookshelfWebPart.onInit` (passed into the React component), but no Graph calls are made in the reviewed code.
- No external HTTP APIs, scheduled tasks or pipelines are invoked from the web part code.

### Service accounts, app registrations, certificates, or secrets required for operation
- **None directly in the code.** All calls run as the signed‑in user via the SPFx context.
- The signed‑in user requires the SharePoint permissions described in *Section 2*.
- If the MS Graph client is enabled in future, the tenant SPFx API permissions must be approved in the SharePoint admin centre for the corresponding Graph scopes. *Specific scopes – to be confirmed.*

### Source code, repositories, or deployment processes (where applicable)
- Source code lives in this Git repository under `webparts/` on branch `claude/document-webparts-SOrWJ` (this documentation branch).
- The folder contains **only the web part source** – it is intended to be dropped into an SPFx solution (yeoman‑generated) that provides `package.json`, `gulpfile.js`, `config/config.json`, `config/package-solution.json`, etc.
- **Build / deployment process** (gulp bundle → gulp package‑solution → upload `.sppkg` to the tenant App Catalogue → add app to site) – *the full SPFx solution and pipeline are not present in this folder; to be confirmed during handover.*

---

## 4. Operational Support Requirements

### Day‑to‑day operational expectations or support activities, including escalations
- Maintain the data in the supporting lists/libraries (TMS Documents, Elements, Expectations, Legislations, Assets, Departments, Roles, Key Documents, Supporting Documents, What's New, etc.). Bookshelf views are entirely driven by this data; new documents/elements/roles appear automatically.
- Manage user role data via `User Defined Roles` (created/updated by the web part itself when a user picks a role) and the `Roles` list (the master list of selectable roles per location).
- Triage submissions in `TMS Document Deviation Register` (Status defaults to `Awaiting Approval`).
- *Escalation routes and tier model – to be agreed during handover.*

### Backup, restore, and recovery expectations
- Relies on the standard **SharePoint Online recycle bins** (site + site collection) and Microsoft 365 retention. No custom backup is implemented by the web parts.
- *Tenant‑specific backup tooling and RTO/RPO expectations – to be confirmed during handover.*

### Monitoring, alerting, logging, or health‑check arrangements
- No custom monitoring or alerting is implemented by the web parts.
- PnPjs is configured with `PnPLogging(LogLevel.Warning)` in `ukBookshelf/components/pnpjsConfig.ts`; warnings/errors will appear in the browser console only.
- Most service errors are logged via `console.log(error)` – there is no centralised telemetry (e.g. App Insights) wired up.
- *Service‑level monitoring (synthetic page checks, SharePoint health) – to be confirmed during handover.*

### Any infrastructure or connectivity dependencies relevant to support
- SharePoint Online tenant `taqaglobal.sharepoint.com`, specifically the `/sites/TBR-Bookshelf/` site collection.
- Microsoft 365 user profile service (for `SPS-JobTitle`).
- SharePoint Search index (people search must be populated for the Deviation Request approver/assessor pickers to return results).
- SPFx App Catalogue (for deploying the `.sppkg`).
- User browser must be able to reach SharePoint Online and load Fluent UI / Office UI Fabric assets.

---

## 5. Known Issues & Risks

### Known bugs, unsupported functionality, or workarounds
- `componentDidMount` calls `window.location.reload()` whenever `localStorage.location` differs from the current URL, which can cause an unexpected single page reload when navigating to the Bookshelf for the first time in a session.
- If `Bookshelf.aspx` is opened without a `?selected=` query parameter, the user is force‑navigated to `?selected=TAQAUKBookshelf` via `window.location.href` (potentially losing other query parameters).
- The Bookshelf relies on DOM IDs (`bspElement-XY`, `exptElement-N`) and direct style manipulation to bold the selected list item; CSS overrides or React re‑renders can leave items in a stale bold/unbold state.
- `Service.getTMSElements` does not call `resolve` when the SharePoint response is empty – the promise can hang in that case; the caller swallows the result with `.catch(...) => console.log`.
- Several service methods log errors and resolve with no value/`undefined` rather than rejecting, so failures are largely silent to the user.
- The page‑size property pane setting (5–30) and the in‑component `pageSize` state (default 25) are not fully aligned; the active value shown on the What's New view depends on the dropdown rather than the property pane.
- The Deviation Request form's "Document No" combo box uses `allowFreeform=true` but only persists a document when an option is *selected* from the dropdown – freeform entries are ignored.

### Outstanding migration issues or post go‑live actions
*To be confirmed during handover.* Suggested checks:
- Verify all required lists, libraries, content types, columns and views exist in the migrated site with the exact titles and internal names used by the code.
- Verify content‑type IDs match the hard‑coded prefixes (`0x010100C9D9CF16A53603408030E2D352479CC601`, `0x0101005FCA19EFB27EDB42A9A5BAA8E26E4CD801`); if not, update `Service.getAllTmsDocuments` / `getAllProcedures`.
- Confirm the people search result source GUID is unchanged in the target tenant; otherwise replace it in `tmsDeviationRequest/components/Service.ts`.
- Confirm any Power Automate flow that processes new `TMS Document Deviation Register` items is migrated and re‑pointed.

### Areas requiring specialist knowledge or support
- SharePoint Framework (SPFx) build/deployment.
- PnPjs query patterns (especially the `select` + `expand` for lookup/multi‑lookup fields used throughout `Service.ts`).
- The TMS information architecture (Elements / Expectations / Sites / Assets / Departments / Roles) and how it maps onto the SharePoint columns referenced by the code.
- Fluent UI v8 / Office UI Fabric React, including the older `NormalPeoplePicker` component used in the Deviation Request form.

### Dependencies that may impact future support or maintenance
- Microsoft deprecation timelines for **Office UI Fabric React** and **Fluent UI v8** will require future migration to Fluent UI v9.
- Future PnPjs major versions may require updates to the `SPFx` behaviour usage and the imported `@pnp/sp/*` selectors.
- SharePoint Online schema changes (rename of any list/library/column) will break the web parts.
- The shared `UkBookshelfWebPartStrings` module is consumed by the Deviation Request web part – both must continue to be packaged together.

---

## 6. Supporting Documentation & Knowledge Transfer

### Any relevant troubleshooting guidance
- **Bookshelf renders blank.** Verify the page URL has a recognised `?selected=` value. Open browser dev tools – the code logs PnPjs errors to the console. Confirm the lists named in `loc/en-us.js` exist and that the user has read permission.
- **Left‑hand element list is empty.** Check that `TMS Elements` has items with `BSDisplay = 1` and that `ElementOwner` and `ElementSponsor` people fields are populated (the code expands these and will throw if missing).
- **My Documents shows no documents.** Confirm the user has selected a role; the role must exist in `Roles` (and not be `Hidden`) for the chosen `Location`. Documents only appear in Level 1/2/3 if their `KeyUserLevel1/2/3` people field contains the selected role or "All Personnel".
- **Quick Links picker returns no options.** Check the hard‑coded content‑type IDs (`0x010100C9D9CF16A53603408030E2D352479CC601` for TMS Documents, `0x0101005FCA19EFB27EDB42A9A5BAA8E26E4CD801` for procedures) match the deployed content types.
- **Deviation Request – approver/assessor picker returns nothing.** People search relies on the SharePoint Search People result source; ensure the tenant search index is healthy and that the user can hit `/_api/search/query`.
- **Deviation Request – submission fails.** Errors are shown in a `MessageBar`. Common causes: missing required field, fewer than three assessors, attachment > 50 MB, attachment name > 128 characters or containing `~ # % & * { } \ : < > ? / | "`, competence‑related flag set to Yes (blocks submission).
- **Unexpected page reload on first navigation.** Expected – caused by the `checkLocation` localStorage check; subsequent loads will not reload.

### Migration validation or testing evidence
*To be supplied during handover.*

### Knowledge transfer sessions/materials
*To be supplied during handover.*

### Any additional documentation useful for ongoing support
- This README (`webparts/README.md`).
- Source code comments inside `UkBookshelf.tsx`, `Service.ts`, `TmsDeviationRequest.tsx` and `IDeviation.ts`.
- Standard Microsoft documentation for SPFx, PnPjs and Fluent UI.

---

# Handover to Support – Operational Transition

The following checklist tracks the items that should be completed (and evidenced) as part of the handover from project delivery to operational support.

### Operational walkthroughs / demos completed
- [ ] UK Bookshelf – walkthrough of all five views (Bookshelf, Expectations, What's New, Legislation, My Documents/Quick Links).
- [ ] TMS Deviation Request – walkthrough of form, validation, attachment rules, competence‑related block, and the resulting `TMS Document Deviation Register` item.
- [ ] Demo of the SharePoint data dependencies (lists/libraries/columns) the web parts read from and write to.

### Support model, ownership, and escalation routes agreed
- [ ] Tier‑1 / service desk contact agreed.
- [ ] Tier‑2 / application support owner agreed.
- [ ] Tier‑3 / development or vendor escalation agreed.
- [ ] SharePoint platform / M365 administrator escalation route agreed.
- [ ] Business owner (TMS) and site owner (`TBR-Bookshelf`) confirmed.

### Required operational access and any monitoring in place
- [ ] Support team has access to the `TBR-Bookshelf` site (at least Read for triage; elevated rights for fixes).
- [ ] Support team has access to the SPFx App Catalogue for deploying updated `.sppkg` packages.
- [ ] Support team has access to the source code repository / branch and the build pipeline (if any).
- [ ] Monitoring / health‑check expectations agreed (note: no custom telemetry is implemented; rely on M365 service health + manual checks).

### Key operational procedures and any recovery expectations understood
- [ ] List/library backup and restore using SharePoint recycle bins and tenant retention policies understood.
- [ ] Process for redeploying the `.sppkg` after a code fix documented and rehearsed.
- [ ] Process for adding/editing entries in `Roles`, `User Defined Roles`, `Key Documents`, `Supporting Documents`, `Legislations List`, etc., understood.
- [ ] Process for handling submissions in `TMS Document Deviation Register` (approval flow, if any) documented.

### Known issues, risks, limitations, and outstanding actions documented
- [ ] All items in *Section 1 – Known limitations* and *Section 5 – Known Issues & Risks* reviewed with the support team.
- [ ] Outstanding post‑go‑live actions captured in a tracked backlog (ticket/issue tracker).
- [ ] Hard‑coded site URL, list names and content‑type IDs called out explicitly to the support team.

### Go‑live, bubble support, and operational acceptance / sign‑off completed
- [ ] Go‑live date confirmed.
- [ ] Bubble / hypercare support period agreed (start, end, contacts, success criteria).
- [ ] Operational acceptance sign‑off captured from the support owner and the business owner.
