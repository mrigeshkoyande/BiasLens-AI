export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface FairnessMetrics {
  demographic_parity: number;
  equal_opportunity: number;
  disparate_impact: number;
  average_odds: number;
  fairness_score: number;
  risk_score: number;
  risk_level: RiskLevel;
}

export interface GroupMetric {
  group: string;
  selection_rate: number;
  accuracy: number;
  count: number;
  color?: string;
}

export interface BiasExplanation {
  id: string;
  text: string;
  severity: 'critical' | 'warning' | 'info';
  feature: string;
  magnitude: number;
  direction: 'positive' | 'negative';
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  shap_value: number;
  direction: 'increases_bias' | 'decreases_bias' | 'neutral';
}

export interface SimulationResult {
  total_applicants: number;
  unfair_rejections: number;
  affected_groups: {
    group: string;
    affected: number;
    percentage: number;
  }[];
  cost_of_bias: number;
  plain_language_impact: string;
}

export interface FixStrategy {
  id: string;
  name: string;
  description: string;
  expected_improvement: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'reweight' | 'remove_sensitive' | 'fairness_constraint' | 'threshold_adjust';
  before_score: number;
  after_score: number;
  before_metrics: Partial<FairnessMetrics>;
  after_metrics: Partial<FairnessMetrics>;
}

export interface DatasetColumn {
  name: string;
  type: 'numeric' | 'categorical' | 'binary';
  is_sensitive: boolean;
  is_target: boolean;
  unique_values: number;
  null_count: number;
}

export interface DatasetInfo {
  id: string;
  filename: string;
  row_count: number;
  column_count: number;
  columns: DatasetColumn[];
  preview: Record<string, string | number>[];
}

export interface Report {
  id: string;
  title: string;
  created_at: string;
  risk_level: RiskLevel;
  fairness_score: number;
  dataset_name: string;
  status: 'ready' | 'generating';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AnalysisState {
  dataset: DatasetInfo | null;
  metrics: FairnessMetrics | null;
  group_metrics: GroupMetric[];
  explanations: BiasExplanation[];
  feature_importance: FeatureImportance[];
  simulation: SimulationResult | null;
  fix_strategies: FixStrategy[];
  is_analyzing: boolean;
  has_results: boolean;
}
