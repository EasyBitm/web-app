import { supabase } from "./supabaseClient";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type ResourceKind = "notes" | "syllabus" | "video" | "question_paper";

export type Resource = {
  id: string;
  subject_id: string;
  kind: ResourceKind;
  title: string;
  url: string;
  year: number | null;
  lesson: number | null;
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
  oneshot_video_url: string | null;
  overall_notes_url: string | null;
};

export type Lesson = {
  id: string;
  subject_id: string;
  title: string;
  hours: number | null;
  sort_order: number;
};

export type SubjectWithResources = Subject & {
  resources: Resource[];
  lessons: Lesson[];
  semester_slug: string;
};

export type Semester = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  is_visible: boolean;
  overall_syllabus_url: string | null;
  subjects: Subject[];
};

export type SiteSettings = { id: string; course_structure_url: string | null };

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", "global").maybeSingle();
  if (error) throw error;
  return data ?? { id: "global", course_structure_url: null };
}

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

  const { data: lessons, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .eq("subject_id", id)
    .order("sort_order", { ascending: true });

  if (lessonError) throw lessonError;

  const { semesters, ...rest } = subject as typeof subject & {
    semesters: { slug: string } | null;
  };

  return {
    ...rest,
    semester_slug: semesters?.slug ?? "",
    resources: resources ?? [],
    lessons: lessons ?? [],
  };
}
