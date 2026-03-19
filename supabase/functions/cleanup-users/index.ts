import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Clean up test and stuck users
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const deleted: string[] = [];
  
  for (const u of users || []) {
    if (u.email === "cleanup@test.com" || u.email === "mozyurt2000@gmail.com") {
      await supabase.from("user_roles").delete().eq("user_id", u.id);
      await supabase.from("profiles").delete().eq("id", u.id);
      await supabase.auth.admin.deleteUser(u.id);
      deleted.push(u.email!);
    }
  }

  return new Response(JSON.stringify({ deleted }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
