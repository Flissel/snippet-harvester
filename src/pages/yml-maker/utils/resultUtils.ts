
import { AnalysisResult } from '../types';

export const getResultDataAsString = (result: AnalysisResult | undefined): string | undefined => {
  if (!result) return undefined;
  
  // If result_data is already a string, return it directly
  if (typeof result.result_data === 'string') {
    return result.result_data;
  }
  
  // If result_data has a raw_response property (from API), use that
  if (result.result_data?.raw_response) {
    return result.result_data.raw_response;
  }
  
  // For other object types, stringify them
  if (typeof result.result_data === 'object') {
    return JSON.stringify(result.result_data, null, 2);
  }
  
  return undefined;
};
