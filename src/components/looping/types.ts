import { LucideIcon } from 'lucide-react';
import { ForticsWorkflow, ForticsFlowNode } from '../../types/fortics';

export type LoopArchitectureType = 'simple_shift' | 'double_pagination';
export type PaginationStrategyType = 'auto_detect' | 'total_pages' | 'array_length' | 'single_batch';
export type PipelineOrientationType = 'vertical' | 'horizontal';

export interface NodeDefinition {
  key: string;
  title: string;
  subtitle: string;
  badgeTag: string;
  isOptional: boolean;
  type?: 'auth' | 'search' | 'filter' | 'label' | 'consumer' | 'condition' | 'secondary' | 'action' | 'db' | 'goto' | 'return';
  icon: LucideIcon;
  color: string;
  isLoopStart?: boolean;
  isLoopBack?: boolean;
  isCustomized?: boolean;
  aiInstruction?: string;
  isDarkStandby?: boolean;
}

export interface LoopDiagnosticResult {
  arrayKeyFound: boolean;
  arrayPath: string;
  itemCount: number;
  keys: string[];
  hasTotalPagesField: boolean;
  totalPagesKeyFound: string;
  totalPagesFoundValue: number | null;
  totalRecordsKeyFound: string;
  totalRecordsFoundValue: number | null;
  urlHasPageParam: boolean;
  recommendedStrategy: PaginationStrategyType;
  diagnosisSummary: string;
}

export interface AiOrderValidationResult {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
  summary: string;
}

export interface GenerateLoopOptions {
  architecture: LoopArchitectureType;
  paginationStrategy: PaginationStrategyType;
  pageSizeValue: number;
  workflowName: string;
  timeoutSeconds: number;
  loopTargetLabel: string;
  hasAuthStep: boolean;
  authName: string;
  authMethod: 'GET' | 'POST';
  authUri: string;
  authBody: string;
  api1Name: string;
  api1Method: 'GET' | 'POST';
  api1Uri: string;
  api1AuthHeader: string;
  statusFilterValue: string;
  sanitizePhoneBR: boolean;
  hasSecondaryApi: boolean;
  api3Name: string;
  api3Method: 'GET' | 'POST';
  api3Uri: string;
  api2Name: string;
  api2Method: 'POST' | 'PUT' | 'PATCH' | 'GET';
  api2Uri: string;
  api2AuthHeader: string;
  api2Body: string;
  hasDatabaseStep: boolean;
  dbNodeName: string;
  dbNodeMethod: 'POST' | 'PUT' | 'PATCH';
  dbNodeUri: string;
  dbNodeAuthHeader: string;
  dbNodeBody: string;
  aiInstructions: Record<string, string>;
  masterAiPrompt: string;
}

