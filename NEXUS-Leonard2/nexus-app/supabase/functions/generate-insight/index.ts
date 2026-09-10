import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const body = await req.json();
    const key = Deno.env.get('OPENAI_API_KEY');
    if (!key) throw new Error('OPENAI_API_KEY no configurada');
    const prompt = `Actúa como analista de inteligencia de negocios. Compara dos datasets reales. Empresa: ${body.company}. Competencia: ${body.competitor}. Métrica: ${body.metric}. Valor empresa: ${body.companyValue}. Valor competencia: ${body.competitorValue}. Columnas empresa: ${Object.keys(body.companyRows?.[0] ?? {}).join(', ')}. Columnas competencia: ${Object.keys(body.competitorRows?.[0] ?? {}).join(', ')}. Devuelve un insight ejecutivo breve, una oportunidad y una recomendación accionable. No inventes cifras.`;
    const r = await fetch('https://api.openai.com/v1/responses', { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${key}`}, body:JSON.stringify({model:'gpt-5-mini', input:prompt}) });
    if (!r.ok) throw new Error(`OpenAI: ${r.status}`);
    const json = await r.json();
    const insight = json.output_text ?? json.output?.flatMap((x:any)=>x.content ?? []).map((x:any)=>x.text ?? '').join('') ?? '';
    return new Response(JSON.stringify({ insight }), { headers:{...cors,'Content-Type':'application/json'} });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Error generando insight' }), { status:500, headers:{...cors,'Content-Type':'application/json'} });
  }
});
