export type RiskLevel = 'low' | 'medium' | 'high';

export interface FairnessMetrics {
  demographicParity: number;
  equalOpportunity: number;
  disparateImpact: number;
  averageOdds: number;
  fairnessScore: number;
  riskLevel: RiskLevel;
}

export interface GroupMetric {
  group: string;
  selectionRate: number;
  accuracy: number;
  count: number;
  color: string;
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
  shapValue: number;
  direction: 'increases_bias' | 'decreases_bias' | 'neutral';
}

export interface SimulationResult {
  totalApplicants: number;
  unfairRejections: number;
  affectedGroups: {
    group: string;
    affected: number;
    percentage: number;
  }[];
  costOfBias: number;
}

export interface FixStrategy {
  id: string;
  name: string;
  description: string;
  expectedImprovement: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'reweight' | 'remove_sensitive' | 'fairness_constraint' | 'threshold_adjust';
  beforeScore: number;
  afterScore: number;
  beforeMetrics: Partial<FairnessMetrics>;
  afterMetrics: Partial<FairnessMetrics>;
}

export interface DatasetColumn {
  name: string;
  type: 'numeric' | 'categorical' | 'binary';
  isSensitive: boolean;
  isTarget: boolean;
  uniqueValues: number;
  nullCount: number;
}

export interface DatasetInfo {
  id: string;
  filename: string;
  rowCount: number;
  columnCount: number;
  columns: DatasetColumn[];
  preview: Record<string, string | number>[];
}

export interface Report {
  id: string;
  title: string;
  createdAt: string;
  riskLevel: RiskLevel;
  fairnessScore: number;
  datasetName: string;
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
  groupMetrics: GroupMetric[];
  explanations: BiasExplanation[];
  featureImportance: FeatureImportance[];
  simulation: SimulationResult | null;
  fixStrategies: FixStrategy[];
  isAnalyzing: boolean;
  hasResults: boolean;
}
