/**
 * BiasLens AI — Centralized API Client
 * All fetch calls to the FastAPI backend go through this module.
 */

import { auth } from './firebase';

const API_BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:8000/api';

/** Helper to get Firebase ID token and format Auth header */
async function getAuthHeader(): Promise<Record<string, string>> {
  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return {
    'Authorization': `Bearer ${token}`
  };
}

// ─── Shared Error Handling ────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  detail: string;
  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      detail = body?.detail ?? detail;
    } catch {
      // ignore JSON parse error
    }
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiColumnInfo {
  name: string;
  dtype: string;
  is_sensitive: boolean;
  is_target: boolean;
  unique_values: number;
  null_count: number;
}

export interface ApiDatasetUploadResponse {
  dataset_id: string;
  filename: string;
  row_count: number;
  column_count: number;
  columns: ApiColumnInfo[];
  preview: Record<string, string | number>[];
}

export interface ApiAnalysisRequest {
  dataset_id: string;
  target_column: string;
  sensitive_columns: string[];
  positive_label?: number | string;
}

export interface ApiGroupMetric {
  group: string;
  selection_rate: number;
  count: number;
}

export interface ApiFairnessMetrics {
  demographic_parity: number;
  equal_opportunity: number;
  disparate_impact: number;
  average_odds: number;
  fairness_score: number;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  group_metrics: ApiGroupMetric[];
}

export interface ApiAnalysisResponse {
  analysis_id: string;
  dataset_id: string;
  metrics: ApiFairnessMetrics;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  model_accuracy: number;
}

export interface ApiBiasExplanation {
  text: string;
  severity: 'critical' | 'warning' | 'info';
  feature: string;
  magnitude: number;
  direction: 'positive' | 'negative';
}

export interface ApiFeatureImportanceItem {
  feature: string;
  importance: number;
  shap_value: number;
  direction: 'increases_bias' | 'decreases_bias' | 'neutral';
}

export interface ApiExplanationResponse {
  analysis_id: string;
  explanations: ApiBiasExplanation[];
  feature_importance: ApiFeatureImportanceItem[];
}

export interface ApiAffectedGroup {
  group: string;
  affected: number;
  percentage: number;
}

export interface ApiSimulationResponse {
  total_applicants: number;
  unfair_rejections: number;
  cost_of_bias: number;
  affected_groups: { group: string; affected: number; percentage: number }[];
  plain_language_impact: string;
}

export interface ApiFixResponse {
  strategy: string;
  before_score: number;
  after_score: number;
  before_risk_score: number;
  after_risk_score: number;
  improvement: number;
  before_metrics: Record<string, number>;
  after_metrics: Record<string, number>;
  description: string;
}

export interface ApiReportResponse {
  report_id: string;
  title: string;
  download_url: string;
}

export interface ApiChatResponse {
  response: string;
  model: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** Upload a CSV dataset. */
export async function uploadDataset(file: File): Promise<ApiDatasetUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers, // Don't set Content-Type, browser handles it for FormData
    body: formData,
  });
  return handleResponse<ApiDatasetUploadResponse>(res);
}

/** Import a CSV dataset from a public URL. */
export async function uploadDatasetFromUrl(url: string): Promise<ApiDatasetUploadResponse> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE}/upload/url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify({ url }),
  });
  return handleResponse<ApiDatasetUploadResponse>(res);
}

/** Run fairness analysis on an uploaded dataset. */
export async function analyzeDataset(req: ApiAnalysisRequest): Promise<ApiAnalysisResponse> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify(req),
  });
  return handleResponse<ApiAnalysisResponse>(res);
}

/** Fetch a previously computed analysis result. */
export async function getAnalysis(analysisId: string): Promise<{ analysis_id: string; metrics: ApiFairnessMetrics }> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE}/analysis/${analysisId}`, {
    headers: authHeaders
  });
  return handleResponse(res);
}

export interface ApiSampleScrutinyResponse {
  analysis_id: string;
  row_data: Record<string, string>;
  decision_score: number;
  top_contributors: { feature: string; value: string; impact: number; influence: 'positive' | 'negative' }[];
  recommendation: string;
}

/** Generate permutation-importance + bias explanations for an analysis. */
export async function explainBias(analysisId: string): Promise<ApiExplanationResponse> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE}/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify({ analysis_id: analysisId }),
  });
  return handleResponse<ApiExplanationResponse>(res);
}

/** Fetch a real row and model explanation for individual scrutiny. */
export async function getSampleScrutiny(analysisId: string): Promise<ApiSampleScrutinyResponse> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE}/explain/sample/${analysisId}`, {
    headers: authHeaders
  });
  return handleResponse<ApiSampleScrutinyResponse>(res);
}

/** Run a Monte Carlo bias-impact simulation. */
export async function simulateImpact(
  analysisId: string,
  numApplicants = 10000
): Promise<ApiSimulationResponse> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify({ analysis_id: analysisId, num_applicants: numApplicants }),
  });
  return handleResponse<ApiSimulationResponse>(res);
}

/** Apply a mitigation strategy and get before/after comparison. */
export async function applyFix(
  analysisId: string,
  strategy: 'reweight' | 'remove_sensitive' | 'fairness_constraint' | 'threshold_adjust'
): Promise<ApiFixResponse> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE}/fix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify({ analysis_id: analysisId, strategy }),
  });
  return handleResponse<ApiFixResponse>(res);
}

export interface ApiReportItem {
  id: string;
  dataset_name: string;
  fairness_score: number;
  risk_level: 'Low' | 'Medium' | 'High';
  created_at: string;
}

/** Generate a PDF audit report and get a download URL. */
export async function generateReport(
  analysisId: string,
  title = 'Fairness Audit Report'
): Promise<ApiReportResponse> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE}/report/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify({ analysis_id: analysisId, title }),
  });
  return handleResponse<ApiReportResponse>(res);
}

/** Fetch all previous audit reports from the database. */
export async function getReports(): Promise<ApiReportItem[]> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE}/reports`, {
    headers: authHeaders
  });
  return handleResponse<ApiReportItem[]>(res);
}

/** Build the absolute download URL for a report. */
export function getReportDownloadUrl(downloadPath: string): string {
  const base = API_BASE.replace('/api', '');
  return downloadPath.startsWith('http') ? downloadPath : `${base}${downloadPath}`;
}

/** Send a message to the AI Chat Assistant. */
export async function sendChatMessage(message: string, analysisId?: string): Promise<ApiChatResponse> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify({ message, analysis_id: analysisId }),
  });
  return handleResponse<ApiChatResponse>(res);
}

export interface InsightObservation {
  num: string;
  title: string;
  desc: string;
}

export interface ApiInsightsResponse {
  analysis_id: string;
  observations: InsightObservation[];
  executive_summary?: string;
}

/** Generate dynamic insights for a specific analysis using Gemini. */
export async function generateInsights(analysisId: string): Promise<ApiInsightsResponse> {
  const authHeaders = await getAuthHeader();
  const res = await fetch(`${API_BASE}/insights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders },
    body: JSON.stringify({ analysis_id: analysisId }),
  });
  return handleResponse<ApiInsightsResponse>(res);
}

/** Ping the backend health endpoint. */
export async function healthCheck(): Promise<{ status: string; service: string; version: string }> {
  const res = await fetch(API_BASE.replace('/api', '/health'));
  return handleResponse(res);
}
