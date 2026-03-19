import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const email = "mozyurt2000@gmail.com";
  const password = "123456";

  // Create user via admin API
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userError && !userError.message.includes("already been registered")) {
    return new Response(JSON.stringify({ error: userError.message }), { status: 400 });
  }

  // Get user id
  let userId = userData?.user?.id;
  if (!userId) {
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existing = users?.find((u: any) => u.email === email);
    userId = existing?.id;
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "Could not find user" }), { status: 400 });
  }

  // Assign admin role
  const { error: roleError } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

  if (roleError) {
    return new Response(JSON.stringify({ error: roleError.message }), { status: 400 });
  }

  return new Response(JSON.stringify({ success: true, userId }), {
    headers: { "Content-Type": "application/json" },
  });
});
