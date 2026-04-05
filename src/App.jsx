import React, { useState, useEffect, useCallback } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

// ─── Constants ───────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  'IT',
  'Finance',
  'Operations',
  'HR',
  'Sales & Marketing',
  'Legal & Compliance',
  'Strategy',
  'Supply Chain',
];

const STRATEGIC_PILLARS = [
  'Digital Transformation',
  'Operational Excellence',
  'Revenue Growth',
  'Risk & Compliance',
  'Customer Experience',
  'Innovation & R&D',
  'Cost Optimization',
];

const BUDGET_RANGES = ['<$50K', '$50K–$200K', '$200K–$500K', '$500K–$1M', '>$1M'];

const EFFORT_ESTIMATES = [
  'XS <1mo',
  'S 1–3mo',
  'M 3–6mo',
  'L 6–12mo',
  'XL >12mo',
];

const STORAGE_KEYS = {
  apiKey: 'bca_api_key',
  formData: 'bca_form_data',
  assessment: 'bca_assessment',
};

const SYSTEM_PROMPT = `You are a senior business analyst and enterprise architect. Evaluate the business case and return ONLY a valid JSON object with this exact structure — no markdown, no explanation:

{
  "scores": {
    "strategicFit": <1-10>,
    "roiPotential": <1-10>,
    "riskLevel": <1-10 where 10 = lowest risk>,
    "feasibility": <1-10>,
    "urgency": <1-10>
  },
  "composite": <weighted average, 2 decimal places>,
  "status": <"Highly Recommended"|"Recommended"|"Needs Review"|"Not Recommended">,
  "executiveSummary": "<3-4 sentence paragraph>",
  "strengths": ["<point>", "<point>", "<point>"],
  "risks": ["<point>", "<point>", "<point>"],
  "recommendation": "<2-3 sentences>",
  "buildVsBuy": {
    "verdict": <"Build"|"Buy"|"Hybrid">,
    "rationale": "<2-3 sentences>",
    "buildPros": ["<point>", "<point>"],
    "buildCons": ["<point>", "<point>"],
    "buyPros": ["<point>", "<point>"],
    "buyCons": ["<point>", "<point>"],
    "suggestedVendors": ["<vendor or category>", "<vendor or category>", "<vendor or category>"],
    "estimatedBuildCost": "<range>",
    "estimatedBuyCost": "<range>",
    "timeToValue": { "build": "<range>", "buy": "<range>" }
  },
  "nextSteps": ["<action>", "<action>", "<action>"]
}`;

const INITIAL_FORM = {
  projectName: '',
  projectSponsor: '',
  department: '',
  strategicPillar: '',
  problemStatement: '',
  expectedOutcomes: '',
  existingSolutions: '',
  budgetRange: '',
  effortEstimate: '',
  desiredTimeline: '',
  knownConstraints: '',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadFromStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

function getScoreColor(score) {
  const pct = score / 10;
  if (pct >= 0.7) return '#22c55e';
  if (pct >= 0.45) return '#f59e0b';
  return '#ef4444';
}

function getStatusStyle(status) {
  switch (status) {
    case 'Highly Recommended':
      return { bg: 'rgba(34,197,94,0.15)', border: '#22c55e', text: '#22c55e' };
    case 'Recommended':
      return { bg: 'rgba(14,165,233,0.15)', border: '#0ea5e9', text: '#0ea5e9' };
    case 'Needs Review':
      return { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', text: '#f59e0b' };
    case 'Not Recommended':
      return { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', text: '#ef4444' };
    default:
      return { bg: 'rgba(148,163,184,0.15)', border: '#94a3b8', text: '#94a3b8' };
  }
}

function buildUserMessage(fd) {
  return `Please evaluate the following business case:

**Project Name:** ${fd.projectName}
**Project Sponsor:** ${fd.projectSponsor || 'Not specified'}
**Department:** ${fd.department || 'Not specified'}
**Strategic Pillar:** ${fd.strategicPillar || 'Not specified'}

**Problem Statement:**
${fd.problemStatement}

**Expected Outcomes:**
${fd.expectedOutcomes}

**Existing Solutions Considered:**
${fd.existingSolutions || 'None specified'}

**Budget Range:** ${fd.budgetRange || 'Not specified'}
**Effort Estimate:** ${fd.effortEstimate || 'Not specified'}
**Desired Timeline:** ${fd.desiredTimeline || 'Not specified'}

**Known Constraints or Dependencies:**
${fd.knownConstraints || 'None specified'}`;
}

// ─── API Key Input ───────────────────────────────────────────────────────────

function ApiKeyInput({ apiKey, onApiKeyChange }) {
  const [editing, setEditing] = useState(!apiKey);
  const [value, setValue] = useState(apiKey);

  function save() {
    const trimmed = value.trim();
    onApiKeyChange(trimmed);
    if (trimmed) setEditing(false);
  }

  if (!editing && apiKey) {
    return (
      <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-bg-card border border-border">
        <svg className="w-5 h-5 text-score-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        <span className="text-text-secondary text-sm flex-1">
          API Key: <span className="font-mono">{'•'.repeat(8)}...{apiKey.slice(-4)}</span>
        </span>
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-accent-cyan hover:text-accent-indigo transition-colors cursor-pointer"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 rounded-lg bg-bg-card border border-border">
      <label className="block text-sm font-medium text-text-secondary mb-2">
        Claude API Key
      </label>
      <div className="flex gap-2">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          placeholder="sk-ant-..."
          className="flex-1 px-3 py-2 rounded-md bg-bg-primary border border-border text-text-primary text-sm font-mono placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-cyan transition-colors"
        />
        <button
          onClick={save}
          className="px-4 py-2 rounded-md bg-accent-cyan text-white text-sm font-medium hover:bg-accent-cyan/80 transition-colors cursor-pointer"
        >
          Save
        </button>
      </div>
    </div>
  );
}

// ─── Form Components ─────────────────────────────────────────────────────────

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">
        {label}
        {required && <span className="text-score-red ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, required }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 rounded-md bg-bg-primary border border-border text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-cyan transition-colors"
    />
  );
}

function TextArea({ value, onChange, placeholder, required, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className="w-full px-3 py-2 rounded-md bg-bg-primary border border-border text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-cyan transition-colors resize-y"
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-md bg-bg-primary border border-border text-text-primary text-sm focus:outline-none focus:border-accent-cyan transition-colors appearance-none cursor-pointer"
    >
      <option value="">{placeholder || 'Select...'}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

// ─── Intake Form ─────────────────────────────────────────────────────────────

function IntakeForm({ formData, onFormChange, onSubmit, loading, error, apiKey }) {
  const update = (field) => (val) => onFormChange({ ...formData, [field]: val });

  const canSubmit =
    apiKey &&
    formData.projectName.trim() &&
    formData.problemStatement.trim() &&
    formData.expectedOutcomes.trim() &&
    !loading;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">
          <span className="bg-gradient-to-r from-accent-cyan to-accent-indigo bg-clip-text text-transparent">
            Business Case Assessor
          </span>
        </h1>
        <p className="text-text-secondary text-sm">
          AI-powered business case evaluation and strategic assessment
        </p>
      </div>

      <ApiKeyInput apiKey={apiKey} onApiKeyChange={(k) => onFormChange({ ...formData, _apiKey: k })} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit();
        }}
        className="space-y-8"
      >
        {/* Project Identity */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-accent-cyan to-accent-indigo inline-block" />
            Project Identity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Project / Initiative Name" required>
              <TextInput
                value={formData.projectName}
                onChange={update('projectName')}
                placeholder="e.g., Customer Portal Modernization"
                required
              />
            </FormField>
            <FormField label="Project Sponsor">
              <TextInput
                value={formData.projectSponsor}
                onChange={update('projectSponsor')}
                placeholder="Name & Title"
              />
            </FormField>
            <FormField label="Department">
              <Select
                value={formData.department}
                onChange={update('department')}
                options={DEPARTMENTS}
                placeholder="Select department..."
              />
            </FormField>
            <FormField label="Strategic Pillar">
              <Select
                value={formData.strategicPillar}
                onChange={update('strategicPillar')}
                options={STRATEGIC_PILLARS}
                placeholder="Select strategic pillar..."
              />
            </FormField>
          </div>
        </section>

        {/* Business Context */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-accent-cyan to-accent-indigo inline-block" />
            Business Context
          </h2>
          <div className="space-y-4">
            <FormField label="Problem Statement" required>
              <TextArea
                value={formData.problemStatement}
                onChange={update('problemStatement')}
                placeholder="Describe the business problem or opportunity..."
                required
                rows={4}
              />
            </FormField>
            <FormField label="Expected Outcomes" required>
              <TextArea
                value={formData.expectedOutcomes}
                onChange={update('expectedOutcomes')}
                placeholder="What measurable results do you expect?"
                required
                rows={3}
              />
            </FormField>
            <FormField label="Existing Solutions Considered">
              <TextArea
                value={formData.existingSolutions}
                onChange={update('existingSolutions')}
                placeholder="What alternatives have been evaluated?"
                rows={2}
              />
            </FormField>
          </div>
        </section>

        {/* Scope & Constraints */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-accent-cyan to-accent-indigo inline-block" />
            Scope & Constraints
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Budget Range">
              <Select
                value={formData.budgetRange}
                onChange={update('budgetRange')}
                options={BUDGET_RANGES}
                placeholder="Select budget range..."
              />
            </FormField>
            <FormField label="Effort Estimate">
              <Select
                value={formData.effortEstimate}
                onChange={update('effortEstimate')}
                options={EFFORT_ESTIMATES}
                placeholder="Select effort estimate..."
              />
            </FormField>
            <FormField label="Desired Timeline">
              <TextInput
                value={formData.desiredTimeline}
                onChange={update('desiredTimeline')}
                placeholder="e.g., Q3 2026 launch"
              />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Known Constraints or Dependencies">
                <TextArea
                  value={formData.knownConstraints}
                  onChange={update('knownConstraints')}
                  placeholder="Regulatory, technical, or resource constraints..."
                  rows={2}
                />
              </FormField>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-lg bg-score-red/10 border border-score-red/30 text-score-red text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-accent-cyan to-accent-indigo hover:shadow-lg hover:shadow-accent-cyan/20"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing Business Case...
            </span>
          ) : (
            'Run Assessment'
          )}
        </button>
      </form>
    </div>
  );
}

// ─── Score Bar ───────────────────────────────────────────────────────────────

function ScoreBar({ label, score }) {
  const color = getScoreColor(score);
  const pct = (score / 10) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-text-secondary">{label}</span>
        <span className="text-sm font-mono font-bold" style={{ color }}>
          {score}/10
        </span>
      </div>
      <div className="h-2 rounded-full bg-bg-primary overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Scores Tab ──────────────────────────────────────────────────────────────

function ScoresTab({ scores }) {
  const dimensions = [
    { key: 'strategicFit', label: 'Strategic Fit' },
    { key: 'roiPotential', label: 'ROI Potential' },
    { key: 'riskLevel', label: 'Risk Level (inverted)' },
    { key: 'feasibility', label: 'Feasibility' },
    { key: 'urgency', label: 'Urgency' },
  ];

  const radarData = dimensions.map((d) => ({
    dimension: d.label.replace(' (inverted)', ''),
    score: scores[d.key] || 0,
    fullMark: 10,
  }));

  return (
    <div className="space-y-8">
      {/* Score Bars */}
      <div className="space-y-4">
        {dimensions.map((d) => (
          <ScoreBar key={d.key} label={d.label} score={scores[d.key] || 0} />
        ))}
      </div>

      {/* Radar Chart */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wider">
          Dimension Overview
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={false}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#0ea5e9"
              fill="#0ea5e9"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a1628',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: '#f1f5f9',
                fontSize: '13px',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Analysis Tab ────────────────────────────────────────────────────────────

function AnalysisTab({ strengths, risks, recommendation }) {
  return (
    <div className="space-y-6">
      {/* Strengths */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-score-green mb-4 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-score-green inline-block" />
          Strengths
        </h3>
        <ul className="space-y-3">
          {(strengths || []).map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-text-primary">
              <svg className="w-4 h-4 mt-0.5 text-score-green shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Risks */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-score-amber mb-4 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-score-amber inline-block" />
          Risks & Concerns
        </h3>
        <ul className="space-y-3">
          {(risks || []).map((r, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-text-primary">
              <svg className="w-4 h-4 mt-0.5 text-score-amber shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendation */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-accent-cyan mb-4 uppercase tracking-wider">
          Recommendation
        </h3>
        <p className="text-sm text-text-primary leading-relaxed">{recommendation}</p>
      </div>
    </div>
  );
}

// ─── Build vs Buy Tab ────────────────────────────────────────────────────────

function BuildVsBuyTab({ data }) {
  if (!data) return null;

  const verdictColors = {
    Build: { bg: 'rgba(14,165,233,0.15)', border: '#0ea5e9', text: '#0ea5e9' },
    Buy: { bg: 'rgba(99,102,241,0.15)', border: '#6366f1', text: '#6366f1' },
    Hybrid: { bg: 'rgba(245,158,11,0.15)', border: '#f59e0b', text: '#f59e0b' },
  };

  const vc = verdictColors[data.verdict] || verdictColors.Hybrid;

  return (
    <div className="space-y-6">
      {/* Verdict Banner */}
      <div
        className="rounded-xl p-6 text-center border"
        style={{ backgroundColor: vc.bg, borderColor: vc.border }}
      >
        <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: vc.text }}>
          AI Verdict
        </div>
        <div className="text-3xl font-bold font-mono" style={{ color: vc.text }}>
          {data.verdict}
        </div>
      </div>

      {/* Rationale */}
      <div className="bg-bg-card rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
          Rationale
        </h3>
        <p className="text-sm text-text-primary leading-relaxed">{data.rationale}</p>
      </div>

      {/* Pros / Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Build */}
        <div className="bg-bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-accent-cyan mb-4 uppercase tracking-wider">
            Build
          </h3>
          <div className="mb-4">
            <div className="text-xs text-score-green font-semibold mb-2">Pros</div>
            <ul className="space-y-1.5">
              {(data.buildPros || []).map((p, i) => (
                <li key={i} className="text-sm text-text-primary flex items-start gap-2">
                  <span className="text-score-green mt-0.5">+</span> {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs text-score-red font-semibold mb-2">Cons</div>
            <ul className="space-y-1.5">
              {(data.buildCons || []).map((c, i) => (
                <li key={i} className="text-sm text-text-primary flex items-start gap-2">
                  <span className="text-score-red mt-0.5">−</span> {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-text-secondary mb-1">Estimated Cost</div>
            <div className="text-sm font-mono text-text-primary">{data.estimatedBuildCost}</div>
            <div className="text-xs text-text-secondary mt-2 mb-1">Time to Value</div>
            <div className="text-sm font-mono text-text-primary">{data.timeToValue?.build}</div>
          </div>
        </div>

        {/* Buy */}
        <div className="bg-bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-accent-indigo mb-4 uppercase tracking-wider">
            Buy
          </h3>
          <div className="mb-4">
            <div className="text-xs text-score-green font-semibold mb-2">Pros</div>
            <ul className="space-y-1.5">
              {(data.buyPros || []).map((p, i) => (
                <li key={i} className="text-sm text-text-primary flex items-start gap-2">
                  <span className="text-score-green mt-0.5">+</span> {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs text-score-red font-semibold mb-2">Cons</div>
            <ul className="space-y-1.5">
              {(data.buyCons || []).map((c, i) => (
                <li key={i} className="text-sm text-text-primary flex items-start gap-2">
                  <span className="text-score-red mt-0.5">−</span> {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-text-secondary mb-1">Estimated Cost</div>
            <div className="text-sm font-mono text-text-primary">{data.estimatedBuyCost}</div>
            <div className="text-xs text-text-secondary mt-2 mb-1">Time to Value</div>
            <div className="text-sm font-mono text-text-primary">{data.timeToValue?.buy}</div>
          </div>
        </div>
      </div>

      {/* Suggested Vendors */}
      {data.suggestedVendors?.length > 0 && (
        <div className="bg-bg-card rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
            Suggested Vendors / Solution Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.suggestedVendors.map((v, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent-indigo/15 text-accent-indigo border border-accent-indigo/30"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Next Steps Tab ──────────────────────────────────────────────────────────

function NextStepsTab({ steps }) {
  return (
    <div className="bg-bg-card rounded-xl border border-border p-6">
      <h3 className="text-sm font-semibold text-text-secondary mb-6 uppercase tracking-wider">
        Recommended Next Steps
      </h3>
      <ol className="space-y-4">
        {(steps || []).map((step, i) => (
          <li key={i} className="flex items-start gap-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-indigo text-white text-sm font-bold font-mono shrink-0">
              {i + 1}
            </span>
            <p className="text-sm text-text-primary leading-relaxed pt-1.5">{step}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─── Report Header ───────────────────────────────────────────────────────────

function ReportHeader({ assessment, formData }) {
  const statusStyle = getStatusStyle(assessment.status);

  return (
    <div className="bg-bg-card rounded-xl border border-border p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-2 truncate">
            {formData.projectName}
          </h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.department && (
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-bg-primary text-text-secondary border border-border">
                {formData.department}
              </span>
            )}
            {formData.strategicPillar && (
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
                {formData.strategicPillar}
              </span>
            )}
          </div>
          <div
            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border"
            style={{
              backgroundColor: statusStyle.bg,
              borderColor: statusStyle.border,
              color: statusStyle.text,
            }}
          >
            {assessment.status}
          </div>
        </div>

        <div className="flex flex-col items-center shrink-0">
          <div className="text-xs text-text-secondary uppercase tracking-wider mb-1">
            Composite Score
          </div>
          <div
            className="text-5xl font-bold font-mono"
            style={{ color: getScoreColor(assessment.composite) }}
          >
            {assessment.composite}
          </div>
          <div className="text-xs text-text-secondary mt-1">/ 10</div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Executive Summary
        </h2>
        <p className="text-sm text-text-primary leading-relaxed">
          {assessment.executiveSummary}
        </p>
      </div>
    </div>
  );
}

// ─── Assessment Report ───────────────────────────────────────────────────────

const TABS = [
  { key: 'scores', label: 'Scores' },
  { key: 'analysis', label: 'Analysis' },
  { key: 'buildVsBuy', label: 'Build vs Buy' },
  { key: 'nextSteps', label: 'Next Steps' },
];

function AssessmentReport({ assessment, formData, onReset }) {
  const [activeTab, setActiveTab] = useState('scores');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={onReset}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-cyan transition-colors mb-6 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        New Assessment
      </button>

      {/* Header */}
      <ReportHeader assessment={assessment} formData={formData} />

      {/* Tabs */}
      <div className="mt-8 mb-6 flex gap-1 bg-bg-card rounded-lg p-1 border border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-md text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-accent-cyan to-accent-indigo text-white shadow-md'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-card-hover'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'scores' && <ScoresTab scores={assessment.scores} />}
        {activeTab === 'analysis' && (
          <AnalysisTab
            strengths={assessment.strengths}
            risks={assessment.risks}
            recommendation={assessment.recommendation}
          />
        )}
        {activeTab === 'buildVsBuy' && <BuildVsBuyTab data={assessment.buildVsBuy} />}
        {activeTab === 'nextSteps' && <NextStepsTab steps={assessment.nextSteps} />}
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('form');
  const [apiKey, setApiKey] = useState(() => loadFromStorage(STORAGE_KEYS.apiKey, ''));
  const [formData, setFormData] = useState(() => loadFromStorage(STORAGE_KEYS.formData, { ...INITIAL_FORM }));
  const [assessment, setAssessment] = useState(() => loadFromStorage(STORAGE_KEYS.assessment, null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Restore report screen if we have an assessment
  useEffect(() => {
    if (assessment) setScreen('report');
  }, []);

  // Persist form data
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.formData, formData);
  }, [formData]);

  // Handle API key from form (passed via special _apiKey field)
  const handleFormChange = useCallback(
    (newFormData) => {
      if (newFormData._apiKey !== undefined) {
        const key = newFormData._apiKey;
        setApiKey(key);
        saveToStorage(STORAGE_KEYS.apiKey, key);
        const { _apiKey, ...rest } = newFormData;
        setFormData(rest);
      } else {
        setFormData(newFormData);
      }
    },
    []
  );

  const runAssessment = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: buildUserMessage(formData),
            },
          ],
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(
          errBody?.error?.message || `API request failed (${response.status})`
        );
      }

      const data = await response.json();
      const text = data.content?.[0]?.text;

      if (!text) throw new Error('No response content from API');

      // Parse — handle potential markdown code fences
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(cleaned);

      setAssessment(result);
      saveToStorage(STORAGE_KEYS.assessment, result);
      setScreen('report');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiKey, formData]);

  const handleReset = useCallback(() => {
    setAssessment(null);
    setScreen('form');
    setFormData({ ...INITIAL_FORM });
    localStorage.removeItem(STORAGE_KEYS.assessment);
    saveToStorage(STORAGE_KEYS.formData, { ...INITIAL_FORM });
  }, []);

  if (screen === 'report' && assessment) {
    return (
      <AssessmentReport
        assessment={assessment}
        formData={formData}
        onReset={handleReset}
      />
    );
  }

  return (
    <IntakeForm
      formData={formData}
      onFormChange={handleFormChange}
      onSubmit={runAssessment}
      loading={loading}
      error={error}
      apiKey={apiKey}
    />
  );
}
