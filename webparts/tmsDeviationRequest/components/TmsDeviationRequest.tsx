// src/webparts/ukBookshelf/components/TmsDeviationRequest.tsx

import * as React from 'react';

import {
  Stack,
  Text,
  TextField,
  Dropdown,
  IDropdownOption,
  PrimaryButton,
  DefaultButton,
  MessageBar,
  MessageBarType,
  ComboBox,
  IComboBoxOption,
  Spinner,
  SpinnerSize,
  Separator,
  IComboBox,
  // IComboBoxStyles
} from '@fluentui/react';

import {
  NormalPeoplePicker,
  ValidationState,
  IBasePickerSuggestionsProps
} from 'office-ui-fabric-react/lib/Pickers';
import { IPersonaProps } from 'office-ui-fabric-react/lib/Persona';
import {
  IDeviationFormData,
  IDocumentSuggestion,
  IPeoplePickerUser
} from './IDeviation';

import { DeviationService } from './Service';
import * as strings from 'UkBookshelfWebPartStrings';
import { ITmsDeviationRequestProps } from './ITmsDeviationRequestProps';

/** Constants */

// const comboboxStyles: Partial<IComboBoxStyles> = {
//   root: {
//     height: '20px !important',

//   },
//   container: {
//     height: '15px !important'
//   },
//   input: {
//     fontSize: '1em'
//   },
//   optionsContainer: {
//     fontSize: '1em',
//     minHeight: '20px',
//     lineHeight: '20px',
//   },
//   callout: {
//     width: '155px !important'
//   }

//   // optionsContainerWrapper: {
//   //   height: '17px !important'
//   // },
// };

const monthsOptions: IDropdownOption[] = Array.from({ length: 12 }, (_, i) => ({
  key: String(i + 1),
  text: String(i + 1)
}));

const yesNoOptions: IDropdownOption[] = [
  { key: '1', text: 'Yes' },
  { key: '0', text: 'No' }
];

const relatedOptions: IDropdownOption[] = [
  { key: '0', text: 'No' },
  { key: '1', text: 'Yes' }
];

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50 MB
const INVALID_NAME = /[~#%&*{}\\:<>?\/|"]/;

const styles = {
  sectionTitle: { fontWeight: 600, marginTop: 12 },
  red: { color: 'red' }
} as const;

const separatorStyles = 
{
    root: {
        width: '95%',
        marginLeft:'2.5%'
    },
    content: {
      color: 'lightgrey !important',
      background:'#f5f5f5'
    }

  } as const;


const toPersona = (u: IPeoplePickerUser): IPersonaProps => ({
  id: String(u.id || u.loginName || u.text),
  text: u.text,
  secondaryText: u.email,
  tertiaryText: u.loginName, // <-- stash loginName here
  // key: u.loginName || u.text
});

const fromPersona = (p: IPersonaProps): IPeoplePickerUser => {
  return {
    id: (p.id && !isNaN(Number(p.id))) ? Number(p.id) : 0,
    loginName: (p.tertiaryText || p.text || ''), // fallback to text if tertiaryText missing
    text: p.text || '',
    email: p.secondaryText
  };
};

const pickerSuggestionsProps: IBasePickerSuggestionsProps = {
  suggestionsHeaderText: 'Suggestions',
  noResultsFoundText: 'No results found',
};

const TmsDeviationRequest: React.FC<ITmsDeviationRequestProps> = (props) => {
  const {
    context,
    redirectUrl
    // tmsDocumentIdIsLookup
  } = props;

  const [loading, setLoading] = React.useState<boolean>(true);
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const [requestorName, setRequestorName] = React.useState<string>('');
  const [requestorLogin, setRequestorLogin] = React.useState<string>('');
  const [requestorId, setRequestorId] = React.useState<number | null>(null);
  const [requestorRole, setRequestorRole] = React.useState<string>('');

  const [documents, setDocuments] = React.useState<IDocumentSuggestion[]>([]);
  const [docComboOpts, setDocComboOpts] = React.useState<IComboBoxOption[]>([]);

  const [form, setForm] = React.useState<IDeviationFormData>({
    requestor: null,
    requestorRole: '',
    documentNo: null,
    documentTitle: '',
    devRequestLoc: '',
    relatedToCompetence: '',
    justification: '',
    deviationPeriod: '',
    referenceNumber: '',
    riskAssessed: '',
    riskAssessment: '',
    assessors: [],
    approver: null,
    attachment: null
  });

  const [message, setMessage] = React.useState<{ type: MessageBarType; text: string } | null>(null);

  // Personas for pickers
  const [approverPersona, setApproverPersona] = React.useState<IPersonaProps[]>([]);
  const [assessorPersonas, setAssessorPersonas] = React.useState<IPersonaProps[]>([]);

  const [docText, setDocText] = React.useState<string>('');
  const comboRef = React.useRef<IComboBox>(null);

  // If you're filtering options as user types (optional):
  const filteredDocOptions = React.useMemo(() => {
    if (!docText) return docComboOpts;
    const s = docText.toLowerCase();
    return docComboOpts.filter(o => o.text.toLowerCase().includes(s));
  }, [docText, docComboOpts]);


  /** Init: PnP + current user + documents */
  React.useEffect(() => {
    let cancel = false;

    (async () => {
      try {
        DeviationService.init(context);

        const me = await DeviationService.getCurrentUserProfile();
        if (cancel) return;

        setRequestorName(me.displayName);
        setRequestorLogin(me.loginName);
        setRequestorId(me.id);
        setRequestorRole(me.jobTitle || '');

        const docs = await DeviationService.getTmsDocumentSuggestions(strings.SiteUrl, strings.TMSDocumentLib);
        if (cancel) return;

        setDocuments(docs);
        setDocComboOpts(docs.map(d => ({ key: d.key, text: d.text })));

        // Pre-bind requestor in form (not editable)
        setForm(prev => ({
          ...prev,
          requestor: me.id ? { id: me.id, loginName: me.loginName, text: me.displayName, email: undefined } : null,
          requestorRole: me.jobTitle || ''
        }));

        // Reset pickers on init
        setApproverPersona([]);
        setAssessorPersonas([]);
      } catch (e: any) {
        setMessage({ type: MessageBarType.error, text: `Failed to initialize: ${e?.message || e}` });
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => { cancel = true; };
  }, [context, strings.SiteUrl, strings.TMSDocumentLib]);

  /** Helpers */
  const setField = <K extends keyof IDeviationFormData>(key: K, val: IDeviationFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const validateAttachment = (file: File | null | undefined): string | null => {
    if (!file) return null;
    if (file.size > MAX_FILE_BYTES) return 'Attachment exceeds 50 MB.';
    if (INVALID_NAME.test(file.name)) return 'Attachment name contains invalid characters.';
    if (file.name.length > 128) return 'Attachment name must be ≤ 128 characters.';
    return null;
  };

  const disabledByCompetence = form.relatedToCompetence === '1';

  /** Resolver: get IPeoplePickerUser[] from service */
  const onResolvePeopleSuggestions = async (filter: string): Promise<IPeoplePickerUser[]> => {
    try {
      const results = await DeviationService.searchUsers(filter);
      return results;
    } catch {
      return [];
    }
  };

  /** Persona resolver for NormalPeoplePicker (maps to IPersonaProps[]) */
  const onResolvePersonaSuggestions = async (
    filter: string,
    selectedItems?: IPersonaProps[]
  ): Promise<IPersonaProps[]> => {
    if (!filter || filter.length < 2) return [];
    const users = await onResolvePeopleSuggestions(filter);
    const selectedLogins = new Set(
      (selectedItems || []).map(p => fromPersona(p).loginName)
    );
    return users
      .filter(u => !selectedLogins.has(u.loginName))
      .map(toPersona);
  };

  /** Submit */
  const onSubmit = async (): Promise<void> => {
    setMessage(null);

    const errs: string[] = [];

    // Required fields
    if (!form.documentNo) errs.push('Document No is required.');
    if (!form.documentTitle) errs.push('Document Title is required.');
    if (!form.devRequestLoc) errs.push('Area of document is required.');
    if (!form.justification) errs.push('Justification is required.');
    if (!form.deviationPeriod) errs.push('Deviation Period is required.');
    if (form.relatedToCompetence === '') errs.push('Please select whether the deviation is related to competence.');
    if (form.riskAssessed === '') errs.push('Please select whether the deviation has been risk assessed.');
    if (!form.riskAssessment) errs.push('How it was risk assessed is required.');
    if (!form.approver) errs.push('TMS Deviation Approver is required.');
    if (!form.assessors || form.assessors.length < 3) errs.push('Please enter at least three risk assessors.');

    const atErr = validateAttachment(form.attachment || null);
    if (atErr) errs.push(atErr);

    if (disabledByCompetence) {
      errs.push('For competence-related deviations, please contact the Learning and Development Department.');
    }

    if (errs.length > 0) {
      setMessage({ type: MessageBarType.error, text: errs.join(' ') });
      return;
    }

    try {
      setSubmitting(true);

      const itemId = await DeviationService.createDeviationItem(
        strings.SiteUrl,
        strings.TMSDocumentDeviationRegisterList,
        form,
        form.documentNo?.key,                 // TMS Document item ID          
        true                                  // RiskAssessed is Boolean; set false if your field is Choice (Yes/No)
      );

      if (form.attachment) {
        await DeviationService.uploadAttachment(strings.SiteUrl, strings.TMSDocumentDeviationRegisterList, itemId, form.attachment);
      }

      setMessage({
        type: MessageBarType.success,
        text: 'Thank you. Your deviation request has been submitted successfully and forwarded to the Deviation Approver.'
      });

      const target = redirectUrl || context.pageContext.web.absoluteUrl;
      setTimeout(() => {
        window.location.href = target;
      }, 1200);
    } catch (e: any) {
      setMessage({ type: MessageBarType.error, text: `Form submit failed. ${e?.message || e}` });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Stack horizontalAlign="center" verticalAlign="center" styles={{ root: { minHeight: 200 } }}>
        <Spinner size={SpinnerSize.large} label="Loading..." />
      </Stack>
    );
  }

  return (
    <Stack tokens={{ childrenGap: 12 }} styles={{ root: { maxWidth: 700, background: '#f5f5f5', padding: 16 } }}>
      <Text variant="xLarge" styles={{ root: { textAlign: 'center', background: '#111121', color: '#fff', padding: 8, borderRadius: 4 } }}>
        TMS Document Deviation Request
      </Text>

      {message && (
        <MessageBar
          messageBarType={message.type}
          isMultiline
          onDismiss={() => setMessage(null)}
        >
          {message.text}
        </MessageBar>
      )}
{/* 
      <Separator styles={separatorStyles}>__________________________________________________________________________________________________________</Separator> */}

      {/* Your Details */}
      <Text style={styles.sectionTitle}>Your Details</Text>
      <Stack horizontal tokens={{ childrenGap: 12 }}>
        <Stack.Item grow>
          <TextField
            label="Name"
            value={requestorName}
            readOnly
          />
        </Stack.Item>
        <Stack.Item grow>
          <TextField
            label="Job Title"
            value={requestorRole}
            readOnly
          />
        </Stack.Item>
      </Stack>

      <Separator styles={separatorStyles}>__________________________________________________________________________________________________________</Separator>

      {/* Which document are you requesting deviation from? */}
      <Text style={styles.sectionTitle}>Which document are you requesting deviation from?</Text>

      <ComboBox
        componentRef={comboRef}
        label="Document No (begin typing then select from drop-down)"
        options={filteredDocOptions}
        allowFreeform={true}
        autoComplete="on"
        text={docText}
        //styles={comboboxStyles}

        onPendingValueChanged={(option, index, value) => {
          const v = value ?? '';
          setDocText(v);

          // 🔥 AUTO‑OPEN DROPDOWN WHEN TYPING
          if (comboRef.current) {
            comboRef.current.focus(true);   // this expands the dropdown in Fabric v7
          }
        }}

        onChange={(_, option) => {
          if (option) {
            const sel = documents.find(d => d.key === option.key);
            setField('documentNo', sel || null);
            setField('documentTitle', sel?.title || '');
            setDocText(option.text);
          }
        }}
      />


      <TextField
        label="Document Title"
        value={form.documentTitle}
        readOnly
      />

      <TextField
        label="Area of document (eg section / para)"
        value={form.devRequestLoc}
        onChange={(_, v) => setField('devRequestLoc', v || '')}
        disabled={disabledByCompetence}
      />

      <Separator styles={separatorStyles}>__________________________________________________________________________________________________________</Separator>

      {/* Deviation details */}
      <Text style={styles.sectionTitle}>Deviation details</Text>

      <Dropdown
        label="Is the deviation related to competence?"
        options={relatedOptions}
        selectedKey={form.relatedToCompetence || undefined}
        onChange={(_, opt) => setField('relatedToCompetence', (opt?.key as '0' | '1') || '')}
      />

      {form.relatedToCompetence === '1' && (
        <MessageBar messageBarType={MessageBarType.severeWarning} isMultiline>
          Contact the Learning and Development Department. Other fields are disabled and submission is blocked.
        </MessageBar>
      )}

      <TextField
        label="Justification for deviation"
        multiline
        value={form.justification}
        onChange={(_, v) => setField('justification', v || '')}
        disabled={disabledByCompetence}
      />

      <Dropdown
        label="How long is the deviation required for (Months)?"
        options={monthsOptions}
        selectedKey={form.deviationPeriod || undefined}
        onChange={(_, opt) => setField('deviationPeriod', (opt?.key as any) || '')}
        disabled={disabledByCompetence}
      />

      <TextField
        label="Reference if applicable (eg eMOC / Job No)"
        value={form.referenceNumber}
        onChange={(_, v) => setField('referenceNumber', v || '')}
        disabled={disabledByCompetence}
      />

     <Separator styles={separatorStyles}>__________________________________________________________________________________________________________</Separator>

      {/* Risk assessment */}
      <Text style={styles.sectionTitle}>
        Has the deviation been risk assessed in accordance with the RAM Procedure?
      </Text>

      <Dropdown
        label="Select Yes or No"
        options={yesNoOptions}
        selectedKey={form.riskAssessed || undefined}
        onChange={(_, opt) => setField('riskAssessed', (opt?.key as '0' | '1') || '')}
        disabled={disabledByCompetence}
      />
      {form.riskAssessed === '0' && (
        <Text style={styles.red}>
          A risk assessment must be completed before submitting a deviation request
        </Text>
      )}

      <TextField
        label="How was it risk assessed?"
        multiline
        value={form.riskAssessment}
        onChange={(_, v) => setField('riskAssessment', v || '')}
        disabled={disabledByCompetence}
      />

      {/* Risk assessors */}
      <Text style={styles.sectionTitle}>Who was involved in the risk assessment?</Text>
      <Text variant="small">Enter a minimum of three names in accordance with the RAM Procedure</Text>
      <NormalPeoplePicker
        onResolveSuggestions={onResolvePersonaSuggestions}
        getTextFromItem={(item: IPersonaProps) => item.text || ''}
        onChange={(items?: IPersonaProps[]) => {
          setAssessorPersonas(items || []);
          setField('assessors', (items || []).map(fromPersona));
        }}
        selectedItems={assessorPersonas}
        pickerSuggestionsProps={pickerSuggestionsProps}
        itemLimit={10}
        inputProps={{ placeholder: 'Type a name' }}
        onValidateInput={(input) =>
          (input && input.length >= 2) ? ValidationState.valid : ValidationState.invalid
        }
        disabled={disabledByCompetence}
      />

      {/* Attachment */}
      <Text style={styles.sectionTitle}>Attach risk assessment</Text>
      <input
        type="file"
        onChange={(e) => {
          const f = e.target.files && e.target.files.length ? e.target.files[0] : null;
          setField('attachment', f);
        }}
        disabled={disabledByCompetence}
      />
      <Text variant="small">
        Please ensure the attachment does not contain the following characters ~, #, %, &amp; , *, {'{'} {'}'}, \, :, &lt;, &gt;, ?, /, |, ".
        File ≤ 50 MB; name length ≤ 128 chars.
      </Text>

      <Separator styles={separatorStyles}>__________________________________________________________________________________________________________</Separator>

      {/* Approval */}
      <Text style={styles.sectionTitle}>Approval</Text>
      <Text variant="small">
        Enter the name of the relevant Deviation Approver – this can be found in Paragraph 3 ‘Terminology and Deviations’ in the document.
      </Text>
      <NormalPeoplePicker
        onResolveSuggestions={onResolvePersonaSuggestions}
        getTextFromItem={(item: IPersonaProps) => item.text || ''}
        onChange={(items?: IPersonaProps[]) => {
          setApproverPersona(items || []);
          const first = (items && items[0]) ? fromPersona(items[0]) : null;
          setField('approver', first);
        }}
        selectedItems={approverPersona}
        pickerSuggestionsProps={pickerSuggestionsProps}
        itemLimit={1}
        inputProps={{ placeholder: 'Type approver name' }}
        onValidateInput={(input) =>
          (input && input.length >= 2) ? ValidationState.valid : ValidationState.invalid
        }
        disabled={disabledByCompetence}
      />

      {/* Actions */}
      <Stack horizontal tokens={{ childrenGap: 12 }}>
        <PrimaryButton
          text={submitting ? 'Submitting...' : 'Submit'}
          onClick={onSubmit}
          disabled={submitting || disabledByCompetence}
        />
        <DefaultButton
          text="Reset"
          onClick={() => {
            setForm({
              requestor: requestorId ? { id: requestorId, loginName: requestorLogin, text: requestorName } : null,
              requestorRole: requestorRole || '',
              documentNo: null,
              documentTitle: '',
              devRequestLoc: '',
              relatedToCompetence: '',
              justification: '',
              deviationPeriod: '',
              referenceNumber: '',
              riskAssessed: '',
              riskAssessment: '',
              assessors: [],
              approver: null,
              attachment: null
            });
            setApproverPersona([]);
            setAssessorPersonas([]);
            setMessage(null);
          }}
          disabled={submitting}
        />
      </Stack>
    </Stack>
  );
};

export default TmsDeviationRequest;