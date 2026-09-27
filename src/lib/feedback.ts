// Shared by the feedback form and the /api/feedback route.
export const FEEDBACK_TYPES = [
  "Bug",
  "Idea",
  "Missing content",
  "Better video",
  "Other",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const MAX_FEEDBACK_LENGTH = 5000;
