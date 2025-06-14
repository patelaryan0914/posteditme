// Official Indian languages as per the 8th Schedule of the Indian Constitution
export const INDIAN_LANGUAGES = [
  "Assamese",
  "Bengali",
  "Bodo",
  "Dogri",
  "Gujarati",
  "Hindi",
  "Kannada",
  "Kashmiri",
  "Konkani",
  "Maithili",
  "Malayalam",
  "Manipuri",
  "Marathi",
  "Nepali",
  "Odia",
  "Punjabi",
  "Sanskrit",
  "Santali",
  "Sindhi",
  "Tamil",
  "Telugu",
  "Urdu",
] as const;

// International languages
export const INTERNATIONAL_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Dutch",
  "Polish",
] as const;

// Combined languages list
export const LANGUAGES = [
  ...INDIAN_LANGUAGES,
  ...INTERNATIONAL_LANGUAGES,
] as const;

// Language pairs for translation projects
export const LANGUAGE_PAIRS = LANGUAGES.reduce((pairs, source) => {
  LANGUAGES.forEach((target) => {
    if (source !== target) {
      pairs.push({ source, target });
    }
  });
  return pairs;
}, [] as { source: string; target: string }[]);

export const DEFAULT_ADMIN_EMAIL = "admin@admin.com";

export const TASK_TYPES = [
  "Human Translation",
  "Translation PostEditing",
  "Literary Translation",
  "Text Classification",
  "Label Classification",
  "Translation Error Marking",
];

export const TASK_DOMAINS = [
  "General",
  "Healthcare & Medical",
  "Legal & Compliance",
  "Technology & Software",
  "Business & Finance",
  "Education & Research",
  "Media & Entertainment",
  "Manufacturing & Engineering",
  "Travel & Tourism",
  "Government & Public Sector",
  "E-commerce & Retail",
];

export const TIMEZONES = [
  "UTC-12:00",
  "UTC-11:00",
  "UTC-10:00",
  "UTC-09:00",
  "UTC-08:00",
  "UTC-07:00",
  "UTC-06:00",
  "UTC-05:00",
  "UTC-04:00",
  "UTC-03:00",
  "UTC-02:00",
  "UTC-01:00",
  "UTC+00:00",
  "UTC+01:00",
  "UTC+02:00",
  "UTC+03:00",
  "UTC+04:00",
  "UTC+05:00",
  "UTC+06:00",
  "UTC+07:00",
  "UTC+08:00",
  "UTC+09:00",
  "UTC+10:00",
  "UTC+11:00",
  "UTC+12:00",
];

export const ERROR_CATEGORIES = [
  "Grammar",
  "Spelling",
  "Punctuation",
  "Terminology",
  "Style",
  "Consistency",
  "Cultural Context",
  "Formatting",
  "Omission",
  "Addition",
  "Mistranslation",
  "Untranslated Text",
];

export const ERROR_SEVERITIES = [
  {
    value: "minor",
    label: "Minor",
    description: "Small issues that don't significantly impact meaning",
  },
  {
    value: "major",
    label: "Major",
    description: "Significant issues that affect clarity or accuracy",
  },
  {
    value: "critical",
    label: "Critical",
    description: "Severe issues that completely change or misrepresent meaning",
  },
];
