import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Find and delete user by email
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const target = users?.find((u: any) => u.email === "mozyurt2000@gmail.com");

  if (target) {
    await supabase.from("user_roles").delete().eq("user_id", target.id);
    await supabase.from("profiles").delete().eq("id", target.id);
    const { error } = await supabase.auth.admin.deleteUser(target.id);
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    return new Response(JSON.stringify({ success: true, deleted: target.email }));
  }

  return new Response(JSON.stringify({ message: "User not found" }));
});
