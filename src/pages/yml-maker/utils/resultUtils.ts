
import { AnalysisResult } from '../types';

export const getResultDataAsString = (result: AnalysisResult | undefined): string | undefined => {
  if (!result) return undefined;
  
  // If result_data is already a string (most common case from edge function)
  if (typeof result.result_data === 'string') {
    return result.result_data;
  }
  
  // Fallback for object types - stringify them
  if (typeof result.result_data === 'object' && result.result_data !== null) {
    try {
      return JSON.stringify(result.result_data, null, 2);
    } catch {
      return undefined;
    }
  }
  
  return undefined;
};

