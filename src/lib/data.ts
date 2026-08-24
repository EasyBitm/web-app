import { supabase } from "./supabaseClient";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type ResourceKind = "notes" | "syllabus" | "video" | "other";

export type Resource = {
  id: string;
  subject_id: string;
  kind: ResourceKind;
  title: string;
  url: string;
  sort_order: number;
};

export type Subject = {
  id: string;
  semester_id: string;
  name: string;
  code: string;
  chapters: number;
  difficulty: Difficulty;
  sort_order: number;
};

export type SubjectWithResources = Subject & {
  resources: Resource[];
  semester_slug: string;
};

export type Semester = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  is_visible: boolean;
  subjects: Subject[];
};

export async function getSemesters(
  options: { includeHidden?: boolean } = {},
): Promise<Semester[]> {
  let query = supabase.from("semesters").select("*");
  if (!options.includeHidden) {
    query = query.eq("is_visible", true);
  }
  const { data: semesters, error: semError } = await query.order(
    "sort_order",
    { ascending: true },
  );

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
  input: Partial<{
    slug: string;
    name: string;
    sort_order: number;
    is_visible: boolean;
  }>,
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

export async function getSubject(
  id: string,
): Promise<SubjectWithResources | null> {
  const { data: subject, error: subError } = await supabase
    .from("subjects")
    .select("*, semesters(slug)")
    .eq("id", id)
    .maybeSingle();

  if (subError) throw subError;
  if (!subject) return null;

  const { data: resources, error: resError } = await supabase
    .from("resources")
    .select("*")
    .eq("subject_id", id)
    .order("sort_order", { ascending: true });

  if (resError) throw resError;

  const { semesters, ...rest } = subject as typeof subject & {
    semesters: { slug: string } | null;
  };

  return {
    ...rest,
    semester_slug: semesters?.slug ?? "",
    resources: resources ?? [],
  };
}

export async function createResource(input: {
  subject_id: string;
  kind: ResourceKind;
  title: string;
  url: string;
  sort_order: number;
}) {
  const { error } = await supabase.from("resources").insert(input);
  if (error) throw error;
}

export async function updateResource(
  id: string,
  input: Partial<{
    kind: ResourceKind;
    title: string;
    url: string;
    sort_order: number;
  }>,
) {
  const { error } = await supabase
    .from("resources")
    .update(input)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteResource(id: string) {
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) throw error;
}
