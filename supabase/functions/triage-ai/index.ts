import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { symptoms, age, gender, blood_pressure, heart_rate, temperature, spo2, pre_existing_conditions, allergies, paramedic_location, ambulance_id, eta_minutes } = await req.json();

    // 1. Call Python ML Engine for Structured Prediction
    let mlResult = null;
    try {
      const mlResponse = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: parseInt(age) || 30,
          gender: gender || 'unknown',
          symptoms: symptoms,
          systolic_bp: parseInt((blood_pressure || '120/80').split('/')[0]),
          heart_rate: parseInt(heart_rate) || 80,
          temperature: parseFloat(temperature) || 98.6,
          spo2: parseInt(spo2) || 98,
          has_pre_existing: (pre_existing_conditions || []).length > 0 ? 1 : 0
        })
      });
      if (mlResponse.ok) {
        mlResult = await mlResponse.json();
      }
    } catch (e) {
      console.warn("ML Engine unavailable, falling back to pure LLM:", e);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a medical triage AI assistant. Provide a structured clinical explanation based on the provided triage data.
    
${mlResult ? `ML MODEL PREDICTION:
- Risk Level: ${mlResult.risk_level}
- Recommended Department: ${mlResult.recommended_department}
- Confidence: ${mlResult.confidence}
- Key Factors: ${JSON.stringify(mlResult.contributing_factors)}` : ''}

You MUST respond with valid JSON only. Use this exact schema:
{
  "risk_level": "${mlResult?.risk_level || 'low'}",
  "recommended_department": "${mlResult?.recommended_department || 'General Medicine'}",
  "explanation": "2-3 sentence clinical explanation for the patient",
  "confidence": ${mlResult?.confidence || 0.85},
  "assigned_floor": "Floor 1" | "Floor 2" | "Floor 3",
  "estimated_wait_time": number,
  "assigned_doctor": "Doctor Name",
  "contributing_factors": ${JSON.stringify(mlResult?.contributing_factors || [])}
}`;

    const userPrompt = `Generate a patient explanation for: ${symptoms}. Demographic: ${age}yo ${gender}. Vitals: BP ${blood_pressure}, HR ${heart_rate}, Temp ${temperature}, SpO2 ${spo2}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const result = JSON.parse(aiData.choices?.[0]?.message?.content || '{}');

    return new Response(JSON.stringify({ ...mlResult, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("triage-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
