'use client';
/**
 * BiasLens AI — Pipeline State Manager
 *
 * Provides React context to persist dataset_id and analysis_id between
 * route navigations without prop-drilling or a heavy state library.
 * State is also serialized to sessionStorage so it survives hot-reloads.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { ApiColumnInfo } from './api';
import type { RiskLevel } from './types';

// ─── State shape ──────────────────────────────────────────────────────────────

interface PipelineState {
  dataset_id: string | null;
  analysis_id: string | null;
  filename: string | null;
  row_count: number | null;
  columns: ApiColumnInfo[];
  target_column: string | null;
  sensitive_columns: string[];
  fairness_score: number | null;
  risk_score: number | null;
  risk_level: RiskLevel | null;
  group_metrics: any[];
}

interface PipelineContext extends PipelineState {
  setDatasetResult: (
    dataset_id: string,
    filename: string,
    row_count: number,
    columns: ApiColumnInfo[]
  ) => void;
  setAnalysisConfig: (target_column: string, sensitive_columns: string[]) => void;
  setAnalysisResult: (
    analysis_id: string,
    fairness_score: number,
    risk_score: number,
    risk_level: RiskLevel,
    group_metrics: any[]
  ) => void;
  clearPipeline: () => void;
  hasPipeline: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PipelineCtx = createContext<PipelineContext | null>(null);

const STORAGE_KEY = 'biaslens_pipeline';

const DEFAULT_STATE: PipelineState = {
  dataset_id: null,
  analysis_id: null,
  filename: null,
  row_count: null,
  columns: [],
  target_column: null,
  sensitive_columns: [],
  fairness_score: null,
  risk_score: null,
  risk_level: null,
  group_metrics: [],
};

function loadFromStorage(): PipelineState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULT_STATE;
}

function saveToStorage(state: PipelineState) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PipelineProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PipelineState>(DEFAULT_STATE);

  // Hydrate from sessionStorage after first render
  useEffect(() => {
    setState(loadFromStorage());
  }, []);

  const update = useCallback((patch: Partial<PipelineState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      saveToStorage(next);
      return next;
    });
  }, []);

  const setDatasetResult = useCallback(
    (dataset_id: string, filename: string, row_count: number, columns: ApiColumnInfo[]) => {
      update({
        dataset_id,
        filename,
        row_count,
        columns,
        // Reset downstream state when a new dataset is uploaded
        analysis_id: null,
        target_column: null,
        sensitive_columns: [],
        fairness_score: null,
        risk_score: null,
        risk_level: null,
      });
    },
    [update]
  );

  const setAnalysisConfig = useCallback(
    (target_column: string, sensitive_columns: string[]) => {
      update({ target_column, sensitive_columns });
    },
    [update]
  );

  const setAnalysisResult = useCallback(
    (analysis_id: string, fairness_score: number, risk_score: number, risk_level: RiskLevel, group_metrics: any[]) => {
      update({ analysis_id, fairness_score, risk_score, risk_level, group_metrics });
    },
    [update]
  );

  const clearPipeline = useCallback(() => {
    setState(DEFAULT_STATE);
    if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: PipelineContext = {
    ...state,
    setDatasetResult,
    setAnalysisConfig,
    setAnalysisResult,
    clearPipeline,
    hasPipeline: Boolean(state.dataset_id),
  };

  return <PipelineCtx.Provider value={value}>{children}</PipelineCtx.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePipeline(): PipelineContext {
  const ctx = useContext(PipelineCtx);
  if (!ctx) throw new Error('usePipeline must be used inside <PipelineProvider>');
  return ctx;
}
