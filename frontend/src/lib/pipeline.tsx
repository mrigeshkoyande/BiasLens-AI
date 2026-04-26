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

// ─── State shape ──────────────────────────────────────────────────────────────

interface PipelineState {
  datasetId: string | null;
  analysisId: string | null;
  filename: string | null;
  rowCount: number | null;
  columns: ApiColumnInfo[];
  targetColumn: string | null;
  sensitiveColumns: string[];
  fairnessScore: number | null;
  riskLevel: 'low' | 'medium' | 'high' | null;
}

interface PipelineContext extends PipelineState {
  setDatasetResult: (
    datasetId: string,
    filename: string,
    rowCount: number,
    columns: ApiColumnInfo[]
  ) => void;
  setAnalysisConfig: (targetColumn: string, sensitiveColumns: string[]) => void;
  setAnalysisResult: (
    analysisId: string,
    fairnessScore: number,
    riskLevel: 'low' | 'medium' | 'high'
  ) => void;
  clearPipeline: () => void;
  hasPipeline: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PipelineCtx = createContext<PipelineContext | null>(null);

const STORAGE_KEY = 'biaslens_pipeline';

const DEFAULT_STATE: PipelineState = {
  datasetId: null,
  analysisId: null,
  filename: null,
  rowCount: null,
  columns: [],
  targetColumn: null,
  sensitiveColumns: [],
  fairnessScore: null,
  riskLevel: null,
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
    (datasetId: string, filename: string, rowCount: number, columns: ApiColumnInfo[]) => {
      update({
        datasetId,
        filename,
        rowCount,
        columns,
        // Reset downstream state when a new dataset is uploaded
        analysisId: null,
        targetColumn: null,
        sensitiveColumns: [],
        fairnessScore: null,
        riskLevel: null,
      });
    },
    [update]
  );

  const setAnalysisConfig = useCallback(
    (targetColumn: string, sensitiveColumns: string[]) => {
      update({ targetColumn, sensitiveColumns });
    },
    [update]
  );

  const setAnalysisResult = useCallback(
    (analysisId: string, fairnessScore: number, riskLevel: 'low' | 'medium' | 'high') => {
      update({ analysisId, fairnessScore, riskLevel });
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
    hasPipeline: Boolean(state.datasetId),
  };

  return <PipelineCtx.Provider value={value}>{children}</PipelineCtx.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePipeline(): PipelineContext {
  const ctx = useContext(PipelineCtx);
  if (!ctx) throw new Error('usePipeline must be used inside <PipelineProvider>');
  return ctx;
}
