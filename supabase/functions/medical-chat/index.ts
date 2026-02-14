import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context, image } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a medical AI assistant integrated into a hospital triage system. You help healthcare professionals by:
1. Analyzing symptoms and suggesting possible conditions
2. Explaining medical terminology in simple terms
3. Providing evidence-based medical information
4. Analyzing uploaded medical images to identify potential conditions
5. Supporting multilingual symptom input (translate and interpret symptoms from any language)

You support multilingual input - if symptoms are described in any language, translate them and provide analysis.

Important: You provide decision support only. All diagnoses must be confirmed by qualified medical professionals.
${context || ''}`;

    const aiMessages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history
    for (const msg of (messages || [])) {
      if (image && msg === messages[messages.length - 1]) {
        aiMessages.push({
          role: "user",
          content: [
            { type: "text", text: msg.content },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
          ],
        });
      } else {
        aiMessages.push({ role: msg.role, content: msg.content });
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: image ? "google/gemini-2.5-flash" : "google/gemini-3-flash-preview",
        messages: aiMessages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited", reply: "I'm currently rate-limited. Please try again in a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted", reply: "AI credits have been exhausted. Please add funds." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No response generated.';

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("medical-chat error:", e);
    return new Response(JSON.stringify({ reply: "Sorry, I encountered an error. Please try again.", error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
