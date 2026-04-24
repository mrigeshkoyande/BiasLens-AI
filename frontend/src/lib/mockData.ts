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
  demographicParity: 0.31,
  equalOpportunity: 0.24,
  disparateImpact: 0.68,
  averageOdds: 0.28,
  fairnessScore: 42,
  riskLevel: 'high',
};

export const mockGroupMetrics: GroupMetric[] = [
  { group: 'Male', selectionRate: 0.72, accuracy: 0.84, count: 4821, color: '#00d4ff' },
  { group: 'Female', selectionRate: 0.41, accuracy: 0.81, count: 3976, color: '#7c3aed' },
  { group: 'Age 18–30', selectionRate: 0.63, accuracy: 0.79, count: 2340, color: '#10b981' },
  { group: 'Age 31–45', selectionRate: 0.69, accuracy: 0.83, count: 3102, color: '#f59e0b' },
  { group: 'Age 46+', selectionRate: 0.38, accuracy: 0.76, count: 1355, color: '#ef4444' },
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
  { feature: 'Gender', importance: 0.89, shapValue: 0.34, direction: 'increases_bias' },
  { feature: 'Age', importance: 0.76, shapValue: 0.28, direction: 'increases_bias' },
  { feature: 'Income', importance: 0.65, shapValue: 0.21, direction: 'increases_bias' },
  { feature: 'ZIP Code', importance: 0.52, shapValue: 0.15, direction: 'increases_bias' },
  { feature: 'Education', importance: 0.44, shapValue: 0.09, direction: 'neutral' },
  { feature: 'Experience', importance: 0.38, shapValue: -0.07, direction: 'decreases_bias' },
  { feature: 'Skills Score', importance: 0.31, shapValue: -0.12, direction: 'decreases_bias' },
  { feature: 'References', importance: 0.22, shapValue: -0.04, direction: 'decreases_bias' },
];

export const mockSimulation: SimulationResult = {
  totalApplicants: 10000,
  unfairRejections: 2840,
  affectedGroups: [
    { group: 'Women', affected: 1890, percentage: 66.5 },
    { group: 'Age 46+', affected: 720, percentage: 25.4 },
    { group: 'Low Income', affected: 450, percentage: 15.8 },
  ],
  costOfBias: 284000,
};

export const mockFixStrategies: FixStrategy[] = [
  {
    id: 'reweight',
    name: 'Data Reweighting',
    description: 'Adjust sample weights to ensure equal representation of all demographic groups during model training.',
    expectedImprovement: 28,
    difficulty: 'easy',
    type: 'reweight',
    beforeScore: 42,
    afterScore: 70,
    beforeMetrics: { demographicParity: 0.31, equalOpportunity: 0.24 },
    afterMetrics: { demographicParity: 0.08, equalOpportunity: 0.06 },
  },
  {
    id: 'remove_sensitive',
    name: 'Remove Sensitive Attributes',
    description: 'Drop protected columns (gender, age) and correlated proxies (ZIP code) from the feature set.',
    expectedImprovement: 19,
    difficulty: 'easy',
    type: 'remove_sensitive',
    beforeScore: 42,
    afterScore: 61,
    beforeMetrics: { demographicParity: 0.31, disparateImpact: 0.68 },
    afterMetrics: { demographicParity: 0.14, disparateImpact: 0.84 },
  },
  {
    id: 'fairness_constraint',
    name: 'Equalized Odds Constraint',
    description: 'Apply post-processing fairness constraints to ensure equal true/false positive rates across groups.',
    expectedImprovement: 35,
    difficulty: 'medium',
    type: 'fairness_constraint',
    beforeScore: 42,
    afterScore: 77,
    beforeMetrics: { equalOpportunity: 0.24, averageOdds: 0.28 },
    afterMetrics: { equalOpportunity: 0.04, averageOdds: 0.05 },
  },
  {
    id: 'threshold_adjust',
    name: 'Per-Group Threshold Tuning',
    description: 'Set different decision thresholds per demographic group to equalize selection rates.',
    expectedImprovement: 22,
    difficulty: 'medium',
    type: 'threshold_adjust',
    beforeScore: 42,
    afterScore: 64,
    beforeMetrics: { demographicParity: 0.31 },
    afterMetrics: { demographicParity: 0.09 },
  },
];

export const mockDataset: DatasetInfo = {
  id: 'demo-dataset-1',
  filename: 'hiring_dataset_2024.csv',
  rowCount: 8797,
  columnCount: 12,
  columns: [
    { name: 'gender', type: 'categorical', isSensitive: true, isTarget: false, uniqueValues: 2, nullCount: 0 },
    { name: 'age', type: 'numeric', isSensitive: true, isTarget: false, uniqueValues: 48, nullCount: 12 },
    { name: 'income', type: 'numeric', isSensitive: false, isTarget: false, uniqueValues: 4210, nullCount: 0 },
    { name: 'education', type: 'categorical', isSensitive: false, isTarget: false, uniqueValues: 5, nullCount: 0 },
    { name: 'experience_years', type: 'numeric', isSensitive: false, isTarget: false, uniqueValues: 35, nullCount: 3 },
    { name: 'skills_score', type: 'numeric', isSensitive: false, isTarget: false, uniqueValues: 100, nullCount: 0 },
    { name: 'zipcode', type: 'categorical', isSensitive: true, isTarget: false, uniqueValues: 340, nullCount: 0 },
    { name: 'references', type: 'numeric', isSensitive: false, isTarget: false, uniqueValues: 6, nullCount: 0 },
    { name: 'interview_score', type: 'numeric', isSensitive: false, isTarget: false, uniqueValues: 100, nullCount: 45 },
    { name: 'previous_employer', type: 'categorical', isSensitive: false, isTarget: false, uniqueValues: 1200, nullCount: 0 },
    { name: 'location', type: 'categorical', isSensitive: false, isTarget: false, uniqueValues: 52, nullCount: 0 },
    { name: 'selected', type: 'binary', isSensitive: false, isTarget: true, uniqueValues: 2, nullCount: 0 },
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
  { id: 'r1', title: 'Hiring Dataset Audit — Q1 2025', createdAt: '2025-04-10T09:30:00Z', riskLevel: 'high', fairnessScore: 42, datasetName: 'hiring_dataset_2024.csv', status: 'ready' },
  { id: 'r2', title: 'Loan Approval Fairness Review', createdAt: '2025-04-05T14:20:00Z', riskLevel: 'medium', fairnessScore: 61, datasetName: 'loan_applications.csv', status: 'ready' },
  { id: 'r3', title: 'Promotion Algorithm Analysis', createdAt: '2025-03-28T11:00:00Z', riskLevel: 'low', fairnessScore: 78, datasetName: 'promotions_q4.csv', status: 'ready' },
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
