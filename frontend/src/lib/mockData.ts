import type {
  FairnessMetrics,
  GroupMetric,
  BiasExplanation,
  FeatureImportance,
  SimulationResult,
  FixStrategy,
  DatasetInfo,
  Report,
} from './types';

export const mockMetrics: FairnessMetrics = {
  demographic_parity: 0.31,
  equal_opportunity: 0.24,
  disparate_impact: 0.68,
  average_odds: 0.28,
  fairness_score: 42,
  risk_score: 58,
  risk_level: 'High',
};

export const mockGroupMetrics: GroupMetric[] = [
  { group: 'Male', selection_rate: 0.72, accuracy: 0.84, count: 4821, color: '#00d4ff' },
  { group: 'Female', selection_rate: 0.41, accuracy: 0.81, count: 3976, color: '#7c3aed' },
  { group: 'Age 18–30', selection_rate: 0.63, accuracy: 0.79, count: 2340, color: '#10b981' },
  { group: 'Age 31–45', selection_rate: 0.69, accuracy: 0.83, count: 3102, color: '#f59e0b' },
  { group: 'Age 46+', selection_rate: 0.38, accuracy: 0.76, count: 1355, color: '#ef4444' },
];

export const mockExplanations: BiasExplanation[] = [
  {
    id: '1',
    text: 'Female candidates are 31% less likely to be selected despite similar qualifications and experience levels.',
    severity: 'critical',
    feature: 'gender',
    magnitude: 0.31,
    direction: 'negative',
  },
  {
    id: '2',
    text: 'Candidates aged 46+ face a 34% lower selection rate compared to younger applicants with equivalent skills.',
    severity: 'critical',
    feature: 'age',
    magnitude: 0.34,
    direction: 'negative',
  },
  {
    id: '3',
    text: 'Income level is being used as a proxy for creditworthiness, indirectly disadvantaging lower-income groups.',
    severity: 'warning',
    feature: 'income',
    magnitude: 0.18,
    direction: 'negative',
  },
  {
    id: '4',
    text: 'ZIP code correlates with race in 67% of cases, creating indirect discrimination through geographic filtering.',
    severity: 'warning',
    feature: 'zipcode',
    magnitude: 0.12,
    direction: 'negative',
  },
  {
    id: '5',
    text: 'Years of experience shows a slight positive fairness effect, normalizing outcomes across demographic groups.',
    severity: 'info',
    feature: 'experience',
    magnitude: 0.08,
    direction: 'positive',
  },
];

export const mockFeatureImportance: FeatureImportance[] = [
  { feature: 'Gender', importance: 0.89, shap_value: 0.34, direction: 'increases_bias' },
  { feature: 'Age', importance: 0.76, shap_value: 0.28, direction: 'increases_bias' },
  { feature: 'Income', importance: 0.65, shap_value: 0.21, direction: 'increases_bias' },
  { feature: 'ZIP Code', importance: 0.52, shap_value: 0.15, direction: 'increases_bias' },
  { feature: 'Education', importance: 0.44, shap_value: 0.09, direction: 'neutral' },
  { feature: 'Experience', importance: 0.38, shap_value: -0.07, direction: 'decreases_bias' },
  { feature: 'Skills Score', importance: 0.31, shap_value: -0.12, direction: 'decreases_bias' },
  { feature: 'References', importance: 0.22, shap_value: -0.04, direction: 'decreases_bias' },
];

export const mockSimulation: SimulationResult = {
  total_applicants: 10000,
  unfair_rejections: 2840,
  affected_groups: [
    { group: 'Women', affected: 1890, percentage: 66.5 },
    { group: 'Age 46+', affected: 720, percentage: 25.4 },
    { group: 'Low Income', affected: 450, percentage: 15.8 },
  ],
  cost_of_bias: 284000,
  plain_language_impact: 'The current model configuration disproportionately affects minority groups, resulting in 2,840 potentially unfair rejections and a high business risk profile.',
};

export const mockFixStrategies: FixStrategy[] = [
  {
    id: 'reweight',
    name: 'Data Reweighting',
    description: 'Adjust sample weights to ensure equal representation of all demographic groups during model training.',
    expected_improvement: 28,
    difficulty: 'easy',
    type: 'reweight',
    before_score: 42,
    after_score: 70,
    before_metrics: { demographic_parity: 0.31, equal_opportunity: 0.24 },
    after_metrics: { demographic_parity: 0.08, equal_opportunity: 0.06 },
  },
  {
    id: 'remove_sensitive',
    name: 'Remove Sensitive Attributes',
    description: 'Drop protected columns (gender, age) and correlated proxies (ZIP code) from the feature set.',
    expected_improvement: 19,
    difficulty: 'easy',
    type: 'remove_sensitive',
    before_score: 42,
    after_score: 61,
    before_metrics: { demographic_parity: 0.31, disparate_impact: 0.68 },
    after_metrics: { demographic_parity: 0.14, disparate_impact: 0.84 },
  },
  {
    id: 'fairness_constraint',
    name: 'Equalized Odds Constraint',
    description: 'Apply post-processing fairness constraints to ensure equal true/false positive rates across groups.',
    expected_improvement: 35,
    difficulty: 'medium',
    type: 'fairness_constraint',
    before_score: 42,
    after_score: 77,
    before_metrics: { equal_opportunity: 0.24, average_odds: 0.28 },
    after_metrics: { equal_opportunity: 0.04, average_odds: 0.05 },
  },
  {
    id: 'threshold_adjust',
    name: 'Per-Group Threshold Tuning',
    description: 'Set different decision thresholds per demographic group to equalize selection rates.',
    expected_improvement: 22,
    difficulty: 'medium',
    type: 'threshold_adjust',
    before_score: 42,
    after_score: 64,
    before_metrics: { demographic_parity: 0.31 },
    after_metrics: { demographic_parity: 0.09 },
  },
];

export const mockDataset: DatasetInfo = {
  id: 'demo-dataset-1',
  filename: 'hiring_dataset_2024.csv',
  row_count: 8797,
  column_count: 12,
  columns: [
    { name: 'gender', type: 'categorical', is_sensitive: true, is_target: false, unique_values: 2, null_count: 0 },
    { name: 'age', type: 'numeric', is_sensitive: true, is_target: false, unique_values: 48, null_count: 12 },
    { name: 'income', type: 'numeric', is_sensitive: false, is_target: false, unique_values: 4210, null_count: 0 },
    { name: 'education', type: 'categorical', is_sensitive: false, is_target: false, unique_values: 5, null_count: 0 },
    { name: 'experience_years', type: 'numeric', is_sensitive: false, is_target: false, unique_values: 35, null_count: 3 },
    { name: 'skills_score', type: 'numeric', is_sensitive: false, is_target: false, unique_values: 100, null_count: 0 },
    { name: 'zipcode', type: 'categorical', is_sensitive: true, is_target: false, unique_values: 340, null_count: 0 },
    { name: 'references', type: 'numeric', is_sensitive: false, is_target: false, unique_values: 6, null_count: 0 },
    { name: 'interview_score', type: 'numeric', is_sensitive: false, is_target: false, unique_values: 100, null_count: 45 },
    { name: 'previous_employer', type: 'categorical', is_sensitive: false, is_target: false, unique_values: 1200, null_count: 0 },
    { name: 'location', type: 'categorical', is_sensitive: false, is_target: false, unique_values: 52, null_count: 0 },
    { name: 'selected', type: 'binary', is_sensitive: false, is_target: true, unique_values: 2, null_count: 0 },
  ],
  preview: [
    { gender: 'Male', age: 34, income: 72000, education: 'Bachelor', experience_years: 8, skills_score: 82, selected: 1 },
    { gender: 'Female', age: 29, income: 68000, education: 'Master', experience_years: 6, skills_score: 88, selected: 0 },
    { gender: 'Male', age: 45, income: 91000, education: 'Bachelor', experience_years: 18, skills_score: 79, selected: 1 },
    { gender: 'Female', age: 52, income: 84000, education: 'PhD', experience_years: 24, skills_score: 91, selected: 0 },
    { gender: 'Male', age: 28, income: 54000, education: 'Bachelor', experience_years: 4, skills_score: 74, selected: 1 },
    { gender: 'Female', age: 38, income: 76000, education: 'Master', experience_years: 12, skills_score: 86, selected: 1 },
    { gender: 'Male', age: 61, income: 98000, education: 'Master', experience_years: 32, skills_score: 77, selected: 0 },
    { gender: 'Female', age: 26, income: 49000, education: 'Bachelor', experience_years: 3, skills_score: 81, selected: 0 },
  ],
};

export const mockReports: Report[] = [
  { id: 'r1', title: 'Hiring Dataset Audit — Q1 2025', created_at: '2025-04-10T09:30:00Z', risk_level: 'High', fairness_score: 42, dataset_name: 'hiring_dataset_2024.csv', status: 'ready' },
  { id: 'r2', title: 'Loan Approval Fairness Review', created_at: '2025-04-05T14:20:00Z', risk_level: 'Medium', fairness_score: 61, dataset_name: 'loan_applications.csv', status: 'ready' },
  { id: 'r3', title: 'Promotion Algorithm Analysis', created_at: '2025-03-28T11:00:00Z', risk_level: 'Low', fairness_score: 78, dataset_name: 'promotions_q4.csv', status: 'ready' },
];

export const fairnessTrendData = [
  { month: 'Nov', score: 28, parity: 0.45 },
  { month: 'Dec', score: 34, parity: 0.39 },
  { month: 'Jan', score: 38, parity: 0.35 },
  { month: 'Feb', score: 42, parity: 0.31 },
  { month: 'Mar', score: 55, parity: 0.22 },
  { month: 'Apr', score: 42, parity: 0.31 },
];

export const radarData = [
  { metric: 'Dem. Parity', value: 30, fullMark: 100 },
  { metric: 'Equal Opp', value: 42, fullMark: 100 },
  { metric: 'Disp. Impact', value: 68, fullMark: 100 },
  { metric: 'Avg Odds', value: 38, fullMark: 100 },
  { metric: 'Calibration', value: 55, fullMark: 100 },
];
