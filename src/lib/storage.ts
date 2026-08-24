import { supabase } from "./supabaseClient";

export async function uploadResourceFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("resources")
    .upload(path, file);

  if (error) throw error;

  const { data } = supabase.storage.from("resources").getPublicUrl(path);
  return data.publicUrl;
}
