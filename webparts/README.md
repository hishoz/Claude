# Webparts

This folder contains two **SharePoint Framework (SPFx) client‑side web parts** that power the TAQA UK *TMS Bookshelf* SharePoint site (`https://taqaglobal.sharepoint.com/sites/TBR-Bookshelf/`). Both are written in React + TypeScript and use the [PnPjs](https://pnp.github.io/pnpjs/) library (`@pnp/sp`) to talk to SharePoint lists and libraries, and Fluent UI / Office UI Fabric React for the UI.

| Web part | Folder | Purpose |
| --- | --- | --- |
| **UK Bookshelf** | `ukBookshelf/` | The main multi‑view portal for browsing the TMS (Technical Management System) document library by element, expectation, legislation, role, and "what's new". |
| **TMS Deviation Request** | `tmsDeviationRequest/` | A form that lets users raise a request to deviate from a TMS document, writing the request into a SharePoint register list. |

---

## 1. UK Bookshelf web part (`ukBookshelf/`)

### Overview
A single page web part that renders one of several "views" depending on the `selected` query‑string parameter of the hosting page (`SitePages/Bookshelf.aspx?selected=...`). It surfaces the organisation's Technical Management System (TMS) documents and the relationships between documents, *elements*, *expectations*, *legislation* and *user roles*.

### Files
| File | Description |
| --- | --- |
| `UkBookshelfWebPart.ts` | SPFx web part entry point. Initialises PnPjs (`getSP`) and the MS Graph client in `onInit`, renders the `UkBookshelf` React component, and exposes a property pane with a single **page size** slider (5–30, step 5). |
| `UkBookshelfWebPart.manifest.json` | Web part manifest. Id `c18a5363-9559-470e-b5dc-9899e3a47735`, alias `UkBookshelfWebPart`, supports SharePoint/Teams hosts, theme variants and full‑bleed. |
| `components/UkBookshelf.tsx` | The main React component (class component). Holds all view state (`IBookshelfAppState`), loads the data for the active view in `componentDidMount` → `_loadListData`, and renders the appropriate view. |
| `components/Service.ts` | Data‑access layer. All SharePoint list/library reads & writes go through `Service` methods (see *Service API* below). |
| `components/pnpjsConfig.ts` | Sets up and caches the PnPjs `SPFI` instance (`getSP`) bound to the SPFx context. |
| `components/IBookshelfAppState.ts` | Type for the component state (selected tab, panel items, dropdown selections, role/legislation data, etc.). |
| `components/IUkBookshelfProps.ts` | Props passed from the web part to the component (`graphHttpClient`, `webClient`, `spHttpClient`, `pageSize`, `context`, `redirectUrl`, `tmsDocumentIdIsLookup`). |
| `components/IDocument.ts` | Document‑shaped interfaces: `IDocument`, `IRenditionDocument`, `ISafetyReferenceDocument`, `IRoleBasedDocument`, `IlocationDropdownOption`. |
| `components/IItem.ts` | Misc list‑item interfaces: `IItem` (supporting docs), `IEssentialSafetyRulesItems`, `ISafetyCases`, `ITMSExpectations`, `IWhatsNew`. |
| `components/IScrollablePaneItem.ts` | Interfaces for the left‑hand navigation panel (`IScrollablePaneItem`, `IScrollableListItems`). |
| `components/ListView.tsx` | A Fluent UI `DetailsList`‑based document list (currently mostly superseded by inline rendering in `UkBookshelf.tsx`, but still used for some views). Renders document number / title / "templates" / "extracts" columns. |
| `components/WhatsNewListView.tsx` | `DetailsList` for the "What's New" view (Document Number / Document Title / Date) plus a `Pagination` control. |
| `components/Pagination.tsx` | Simple Previous/Next pager with "Showing X to Y of N entries" text, used by `WhatsNewListView`. |
| `components/UkBookshelf.module.scss` / `.scss.ts` | Component styles. |
| `loc/en-us.js`, `loc/mystrings.d.ts` | Localised strings. **Important:** many "strings" are actually configuration values – SharePoint list/library titles (e.g. `TMS Elements`, `TMS Documents`, `Supporting Documents`), the site URL, and the bookshelf logo URL. |
| `assets/welcome-light.png`, `assets/welcome-dark.png` | Default web part preview images. |

### Views
The active view is chosen by the `selected` query‑string value (read in `getQuerystingValue`). If the page is `Bookshelf.aspx` with no `selected` value, the user is redirected to the `TAQAUKBookshelf` view.

| `selected` value | View | What it shows |
| --- | --- | --- |
| `TAQAUKBookshelf` | **Bookshelf** | Left nav of TMS *elements* (grouped by element type, colour‑coded). Selecting an element shows: its documents (grouped by primary site, with links plus "templates"/"extracts" dialogs), related documents, an info dialog (element sponsor/owner/description), *Key Documents*, and element‑specific *Supporting Documents*. Two dropdowns filter the document list by **location** and **department**. |
| `Expectations` | **TMS Expectations** | Left nav of elements that have expectations; a middle column lists the *Expectations* for the selected element; the right column lists the TMS documents aligned to the selected expectation (`TBRelatedEIExpectations/ExCode`). |
| `WhatsNew` | **What's New** | A paged, searchable `DetailsList` of TMS documents issued/updated in the last 90 days (`TBRDateRef`). Page size dropdown (5–30) and a free‑text search over document number/title/date. |
| `Legislations` | **Legislation** | Searchable left list of legislation items (`Legislations List`). Selecting one shows the TMS documents whose `RelatedLegislations` lookup points to it. Search is debounced (250 ms) and runs server‑side (`substringof`). |
| `MyDocuments` | **My Documents / My Quick Links** | Role‑based view. Resolves the current user's saved role & location from `User Defined Roles`; lets them pick a location (Onshore/Offshore) and role (`Roles` list). Shows TMS documents grouped into **Level 1 / Level 2 / Level 3** based on the document's `KeyUserLevel1/2/3` people fields (always including "All Personnel" docs). Also a **My Quick Links** section where the user can add/remove personal links to documents (`User Defined Links`) and to procedures/extracts (`User Defined Procedures Links`). |

### Service API (`Service` class)
All methods take the PnPjs `SPFI` instance as the first argument.

**Reads – core bookshelf data**
- `getTMSElements(sp, listName)` → `IScrollablePaneItem[]` – elements grouped by `ElementType` for the left navigation pane (includes sponsor/owner/description).
- `getElements(sp, listName)` → `IScrollablePaneItem[]` – flat list of elements.
- `getTMSDocumentsData(sp, query, tmsAssets)` → `IDocument[]` – TMS documents from the `TMS Documents` library matching an OData `query` (e.g. by primary element / expectation), restricted to `DocImplemented eq 'Yes'`, ordered by site order then name.
- `getRelativeDocumentsData(sp, query, tmsAssets)` → `IDocument[]` – documents *related* to an element (`TBRelatedElements`).
- `getRelativeTempSubData(sp, query)` → `IDocument[]` – templates/sub‑procedures linked to a related document (used to populate the templates/extracts dialog).
- `getRenditionDocs(sp, query)` → `IRenditionDocument[]` – published rendition documents.
- `getSafetyReferenceDocs(sp)` → `ISafetyReferenceDocument[]` – safety case reference documents.

**Reads – lookups & lists**
- `getDepartmentChoiceFields(sp, listName)` → `IDropdownOption[]` – departments for the department filter (prepends "All").
- `getLocationChoiceFields(sp, listName)` → `IlocationDropdownOption[]` – locations/assets for the location filter (prepends "All").
- `getKeyDocuments(sp, listName)` → `IDropdownOption[]` – "Key Documents" links.
- `getSupportingDocuments(sp, listName)` → `IItem[]` – supporting documents, tagged with the element they belong to.
- `getEssentialSafetyRulesElements(sp, listName)` → `IEssentialSafetyRulesItems[]`
- `getTMSExpectations(sp, listName)` → `ITMSExpectations[]` – expectation codes/titles mapped to elements.
- `getSafetyCases(sp, listName)` → `ISafetyCases[]`
- `getWhatsNew(sp, listName)` → `IWhatsNew[]` – documents with `TBRDateRef` in the last 90 days, newest first.

**Reads – legislation**
- `getLegislations(sp)` → `any[]` – all items from `Legislations List`.
- `searchLegislations(sp, text)` → `any[]` – server‑side `substringof` search on legislation title.
- `getTmsDocsByLegislation(sp, legislationId)` → `any[]` – TMS docs whose `RelatedLegislations/Id` matches.

**Reads/writes – roles & "My Documents"**
- `getUserDefinedRole(sp, userId)` → `{ id, role, location } | null` – the user's saved role record.
- `saveUserDefinedRole(sp, userId, role, location, id?)` → `number` – creates or updates the user's role record; returns the item id.
- `getRolesByLocation(sp, location)` → `IDropdownOption[]` – non‑hidden roles for a location.
- `getRoleBasedTmsDocuments(sp, role)` → `{ level1, level2, level3 }` – TMS docs split by `KeyUserLevel1/2/3` people fields, matching the role or "All Personnel".
- `getAllTmsDocuments(sp)` / `getAllProcedures(sp)` → `IDocument[]` – all TMS documents / all supporting procedures (filtered by content‑type id), used to populate the Quick Links pickers.

**Writes – Quick Links**
- `getUserQuickLinks(sp, listName, userId)` → `any[]` – the current user's quick links from the given list.
- `addUserQuickLink(sp, listName, { Title, DocumentTitle, DocumentUrl })` → `void`
- `deleteUserQuickLink(sp, listName, id)` → `void`

### SharePoint dependencies (lists & libraries)
Configured via `loc/en-us.js`:
`TMS Elements`, `TMSHQElements`, `TMS Departments`, `Assets`, `Key Documents`, `Supporting Documents`, `TMS Document Deviation Register`, `Essential Safety Rules`, `TMS Expectations`, `What's New`, `Rendition` library, `Safety Case Reference Documents` library, `TMS Documents` library, `User Defined Roles`, `Roles`, plus (referenced in code) `Legislations List`, `User Defined Links`, `User Defined Procedures Links`. Site URL: `https://taqaglobal.sharepoint.com/sites/TBR-Bookshelf/`.

---

## 2. TMS Deviation Request web part (`tmsDeviationRequest/`)

### Overview
A self‑contained form (functional React component) that lets a user submit a request to deviate from a specific TMS document. On submit it creates an item in the **`TMS Document Deviation Register`** list (status `Awaiting Approval`) and optionally uploads a risk‑assessment attachment, then redirects back to the host web.

### Files
| File | Description |
| --- | --- |
| `TmsDeviationRequestWebPart.ts` | SPFx web part entry point. Renders the `TmsDeviationRequest` component and exposes a property‑pane toggle, `tmsDocumentIdIsLookup`, for whether the register's `TMSDocumentId` column is a Lookup or a Number. |
| `TmsDeviationRequestWebPart.manifest.json` | Web part manifest. Id `5734a766-cf44-49e7-84f5-359969d858c9`, alias `TmsDeviationRequestWebPart`. |
| `components/TmsDeviationRequest.tsx` | The form UI and submit logic (validation, people pickers, document combo box, attachment handling). |
| `components/Service.ts` | `DeviationService` – PnPjs‑based data access (current‑user profile, user search/ensure, TMS document suggestions, create register item, upload attachment). |
| `components/ITmsDeviationRequestProps.ts` | Props: `context`, `redirectUrl?`, `tmsDocumentIdIsLookup?`. |
| `components/IDeviation.ts` | Form/data interfaces: `IPeoplePickerUser`, `IDocumentSuggestion`, `IDeviationFormData`, and the `IDeviationService` contract. |
| `components/TmsDeviationRequest.module.scss` / `.scss.ts` | Component styles. |
| `loc/en-us.js`, `loc/mystrings.d.ts` | Strings/config: `TMS Document Deviation Register`, `TMS Documents`, site URL. |
| `assets/welcome-light.png`, `assets/welcome-dark.png` | Default web part preview images. |

> Note: `TmsDeviationRequest.tsx` and its `Service.ts` import strings from `UkBookshelfWebPartStrings` (the Bookshelf web part's string module) for the site URL and library/list names, so the two web parts share that configuration.

### Form fields
1. **Your Details** – Name and Job Title, pre‑filled (read‑only) from the current user's profile (`SPS-JobTitle`).
2. **Which document** – `Document No` combo box (type‑ahead over TMS Documents; auto‑opens the dropdown while typing) and a read‑only `Document Title`. Selecting a document also captures its primary element and document owner. `Area of document` free‑text.
3. **Deviation details** – `Is the deviation related to competence?` (Yes/No). If **Yes**, a warning is shown, all other fields are disabled and submission is blocked (the user is told to contact Learning & Development). `Justification` (multiline), `How long is the deviation required for (months)` (1–12), `Reference if applicable` (eMOC / Job No).
4. **Risk assessment** – `Has the deviation been risk assessed in accordance with the RAM Procedure?` (Yes/No; selecting **No** shows a warning). `How was it risk assessed?` (multiline). `Who was involved in the risk assessment?` – a `NormalPeoplePicker` requiring **at least three** people. `Attach risk assessment` – a single file, validated for size (≤ 50 MB), name length (≤ 128 chars) and forbidden characters (`~ # % & * { } \ : < > ? / | "`).
5. **Approval** – `TMS Deviation Approver` – single‑person `NormalPeoplePicker`.
6. **Actions** – **Submit** and **Reset**.

### Submit flow
1. Client‑side validation collects errors for all required fields (and blocks if competence‑related). Errors are shown in a `MessageBar`.
2. `DeviationService.createDeviationItem(siteUrl, "TMS Document Deviation Register", form, documentItemId, riskAssessedIsBoolean)`:
   - `ensureUser`s the requestor, approver and assessors to get site user ids.
   - Builds the list item payload: `Title`/`DocumentNumber` = document no, `DocumentTitle`, `RequestorRole`, `ReferenceNumber`, `DeviationRequestArea`, `Justification`, `RiskAssessed` (boolean or Yes/No), `RiskAssessment`, `Status = 'Awaiting Approval'`, `DeviationPeriod`, `Element`, `DocumentOwner`, `DateRequestedorExtended` (today), `RequestorNameId`, `TMSDeviationApproverId`, `RiskAssessorsId` (multi‑user), `TMSDocumentIdId` (lookup id of the selected TMS document).
   - Returns the new item id.
3. If a file was attached, `DeviationService.uploadAttachment(...)` adds it to the new list item.
4. A success message is shown and after ~1.2 s the browser navigates to `redirectUrl` (defaults to the current web).

### `DeviationService` API
- `init(context)` – sets up the PnPjs `SPFI` from the SPFx context.
- `getCurrentUserProfile()` → `{ loginName, jobTitle, displayName, id }` – current site user + `SPS-JobTitle` from the user profile.
- `searchUsers(query)` → `IPeoplePickerUser[]` – people search via the SharePoint Search REST API (people result source).
- `ensureUsers(logins)` → `IPeoplePickerUser[]` – `web.ensureUser` for each login, returning their ids.
- `getTmsDocumentSuggestions(webUrl, listTitle)` → `IDocumentSuggestion[]` – TMS Documents (content type `TMS Documents`) mapped to `{ key, text=Document No, element, docOwner, title, url }`, sorted by document no.
- `createDeviationItem(...)` → `number` – see *Submit flow* above.
- `uploadAttachment(webUrl, listTitle, itemId, file)` → `void`.

---

## Tech stack (both web parts)
- **SPFx** (`@microsoft/sp-*`) client‑side web parts hosted on SharePoint Online / Teams.
- **React** class component (`ukBookshelf`) and functional component (`tmsDeviationRequest`) + TypeScript.
- **PnPjs** (`@pnp/sp`, `@pnp/logging`) for SharePoint data access; instances are created from the SPFx context (`SPFx(context)`).
- **MS Graph** client v3 (initialised in `UkBookshelfWebPart.onInit`, though most data access is via PnPjs).
- **Fluent UI** (`@fluentui/react`) and **Office UI Fabric React** for UI controls (`DetailsList`, `Dropdown`, `ComboBox`, `Dialog`, `NormalPeoplePicker`, `MessageBar`, etc.).
- **dayjs** for date formatting in the "What's New" list.
- Styling via SCSS modules (`*.module.scss` + generated `*.module.scss.ts`).

> The `webparts/` folder contains only the web part source (no build tooling). It is intended to be dropped into an SPFx solution that provides `package.json`, `gulpfile.js`, `config/`, etc. (The repository root `package.json` / `vite.config.js` / `src/` belong to an unrelated "Business Case Assessor" app.)
