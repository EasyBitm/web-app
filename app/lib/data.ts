import { supabase } from "./supabaseClient";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type Subject = {
  id: string;
  semester_id: string;
  name: string;
  code: string;
  chapters: number;
  difficulty: Difficulty;
  sort_order: number;
};

export type Semester = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  subjects: Subject[];
};

export async function getSemesters(): Promise<Semester[]> {
  const { data: semesters, error: semError } = await supabase
    .from("semesters")
    .select("*")
    .order("sort_order", { ascending: true });

  if (semError) throw semError;

  const { data: subjects, error: subError } = await supabase
    .from("subjects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (subError) throw subError;

  return (semesters ?? []).map((s) => ({
    ...s,
    subjects: (subjects ?? []).filter((sub) => sub.semester_id === s.id),
  }));
}

export async function getSemester(slug: string): Promise<Semester | null> {
  const { data: semester, error: semError } = await supabase
    .from("semesters")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (semError) throw semError;
  if (!semester) return null;

  const { data: subjects, error: subError } = await supabase
    .from("subjects")
    .select("*")
    .eq("semester_id", semester.id)
    .order("sort_order", { ascending: true });

  if (subError) throw subError;

  return { ...semester, subjects: subjects ?? [] };
}

export async function createSemester(input: {
  slug: string;
  name: string;
  sort_order: number;
}) {
  const { error } = await supabase.from("semesters").insert(input);
  if (error) throw error;
}

export async function updateSemester(
  id: string,
  input: Partial<{ slug: string; name: string; sort_order: number }>,
) {
  const { error } = await supabase
    .from("semesters")
    .update(input)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteSemester(id: string) {
  const { error } = await supabase.from("semesters").delete().eq("id", id);
  if (error) throw error;
}

export async function createSubject(input: {
  semester_id: string;
  name: string;
  code: string;
  chapters: number;
  difficulty: Difficulty;
  sort_order: number;
}) {
  const { error } = await supabase.from("subjects").insert(input);
  if (error) throw error;
}

export async function updateSubject(
  id: string,
  input: Partial<{
    name: string;
    code: string;
    chapters: number;
    difficulty: Difficulty;
    sort_order: number;
  }>,
) {
  const { error } = await supabase.from("subjects").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteSubject(id: string) {
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) throw error;
}
