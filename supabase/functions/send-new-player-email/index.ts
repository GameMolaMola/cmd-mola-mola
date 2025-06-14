
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { nickname, email, score, code, language } = await req.json();
    const html = `
      <h2>🎮 Новый игрок зарегистрировался!</h2>
      <ul>
        <li><strong>Имя:</strong> ${nickname}</li>
        <li><strong>E-mail:</strong> ${email}</li>
        <li><strong>Язык:</strong> ${language}</li>
        <li><strong>Очки:</strong> ${score}</li>
        <li><strong>Код:</strong> ${code}</li>
      </ul>
      <p>Проверьте почтовый ящик для связи и статистики.</p>
    `;
    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "commandermolamola@gmail.com",
      subject: "Mola Mola: Новый игрок зарегистрирован",
      html,
    });
    console.log("Email отправлен:", result);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Ошибка отправки email о новом игроке:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
