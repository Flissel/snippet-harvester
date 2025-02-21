
import { WorkflowQueue } from './WorkflowQueue';
import { AnalysisResponseCard } from './AnalysisResponseCard';
import { AnalysisResults } from './analysis-results';
import { YMLPreview } from './YMLPreview';
import { SidebarProps } from '../types';
import { getResultDataAsString } from '../utils/resultUtils';

export function Sidebar({
  selectedItems,
  onRemoveItem,
  onTestItem,
  analysisResponse,
  isLoadingResponse,
  currentStep,
  workflowResults,
  results,
  isSingleExecution,
  sections,
}: SidebarProps) {
  return (
    <div className="space-y-6">
      <WorkflowQueue
        items={selectedItems}
        onRemoveItem={onRemoveItem}
        onTestItem={onTestItem}
      />

      <AnalysisResponseCard
        response={analysisResponse}
        isLoading={isLoadingResponse}
      />

      <AnalysisResults
        currentStep={currentStep}
        results={isSingleExecution ? workflowResults : results}
        isSingleExecution={isSingleExecution}
      />

      <YMLPreview 
        sections={sections}
        resultData={getResultDataAsString(workflowResults[0])}
      />
    </div>
  );
}
