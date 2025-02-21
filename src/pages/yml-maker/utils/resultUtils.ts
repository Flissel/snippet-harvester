
import { AnalysisResult } from '../types';

export const getResultDataAsString = (result: AnalysisResult | undefined): string | undefined => {
  if (!result) return undefined;
  if (typeof result.result_data === 'string') return result.result_data;
  if (typeof result.result_data === 'object') {
    try {
      return JSON.stringify(result.result_data, null, 2);
    } catch {
      return undefined;
    }
  }
  return undefined;
};
