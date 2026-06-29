const BLOCKED_TERMS = [
  "ass",
  "bitch",
  "bollocks",
  "boner",
  "cock",
  "cunt",
  "dick",
  "fuck",
  "fucker",
  "fucking",
  "gaysex",
  "hentai",
  "jerkoff",
  "jizz",
  "nude",
  "nudity",
  "porn",
  "porno",
  "sex",
  "shit",
  "slut",
  "whore",
  "xxx",
  "viagra",
  "casino",
  "crypto",
  "free money",
  "make money fast",
  "loan",
  "whatsapp",
];

const ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g;

function escapeRegex(term: string) {
  return term.replace(ESCAPE_REGEX, "\\$&");
}

export function containsBlockedContent(input: string | null | undefined) {
  if (!input) return false;

  const text = input.toLowerCase();

  return BLOCKED_TERMS.some((term) => {
    const pattern = term
      .split(/\s+/)
      .map((part) => `\\b${escapeRegex(part)}\\b`)
      .join("\\s+");
    return new RegExp(pattern, "i").test(text);
  });
}

