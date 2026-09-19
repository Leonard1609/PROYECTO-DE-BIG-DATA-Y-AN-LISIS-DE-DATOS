import { supabase } from './supabaseClient';

export async function generateAIInsight(input: { company: string; competitor: string; metric: string; companyValue: number; competitorValue: number; companyRows: Record<string,string>[]; competitorRows: Record<string,string>[]; }) {
  const { data, error } = await supabase.functions.invoke('generate-insight', { body: input });
  if (error) throw error;
  return String(data?.insight ?? 'No se recibió un insight de IA.');
}
