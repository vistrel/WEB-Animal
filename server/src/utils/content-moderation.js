function countMatches(value, pattern) {
  const matches = value.match(pattern);
  return matches ? matches.length : 0;
}

function hasSuspiciousRepeatedWords(text) {
  const words = text.match(/[a-zа-яіїєґ0-9]+/giu) || [];

  if (words.length < 12) {
    return false;
  }

  const counts = words.reduce((acc, word) => {
    if (word.length < 3) {
      return acc;
    }

    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});

  return Object.values(counts).some((count) => count >= 7);
}

function hasSuspiciousRepeatedPhrases(text) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length < 80) {
    return false;
  }

  const chunks = [];

  for (let index = 0; index < normalized.length - 18; index += 6) {
    chunks.push(normalized.slice(index, index + 18));
  }

  const counts = chunks.reduce((acc, chunk) => {
    acc[chunk] = (acc[chunk] || 0) + 1;
    return acc;
  }, {});

  return Object.values(counts).some((count) => count >= 4);
}

function analyzeAdContent(payload) {
  const text = [
    payload.title,
    payload.description,
    payload.city,
    payload.region,
    payload.healthInfo,
    payload.vaccinationInfo,
    payload.documentInfo,
    payload.housingInfo,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const reasons = [];

  const linkCount = countMatches(
    text,
    /(https?:\/\/|www\.|\.com|\.net|\.org|\.top|\.xyz|\.info)/gi,
  );

  const contactSpamCount = countMatches(
    text,
    /(telegram|viber|whatsapp|вайбер|телеграм|ватсап|пишіть в лс)/gi,
  );

  const suspiciousWordsCount = countMatches(
    text,
    /(казино|ставки|кредит|інвестиції|заробіток|розіграш|безкоштовні гроші|наркотики|зброя|жорстоке поводження)/gi,
  );

  const repeatedCharsCount = countMatches(text, /(.)\1{8,}/giu);

  if (linkCount > 1) {
    reasons.push("Забагато посилань у тексті");
  }

  if (contactSpamCount > 2) {
    reasons.push("Текст схожий на рекламне або спам-повідомлення");
  }

  if (suspiciousWordsCount > 0) {
    reasons.push("Виявлено підозрілі формулювання");
  }

  if (
    repeatedCharsCount > 0 ||
    hasSuspiciousRepeatedWords(text) ||
    hasSuspiciousRepeatedPhrases(text)
  ) {
    reasons.push("Виявлено неприродні повтори в тексті");
  }

  const lettersOnly = text.replace(/[^a-zа-яіїєґ]/gi, "");
  const upperOnly = [payload.title, payload.description]
    .filter(Boolean)
    .join(" ")
    .replace(/[^A-ZА-ЯІЇЄҐ]/g, "");

  if (lettersOnly.length > 60 && upperOnly.length / lettersOnly.length > 0.55) {
    reasons.push("Забагато тексту великими літерами");
  }

  if (!reasons.length) {
    return {
      flag: "NONE",
      reason: null,
    };
  }

  return {
    flag: reasons.length >= 2 ? "SUSPICIOUS" : "NEEDS_REVIEW",
    reason: reasons.join("; "),
  };
}

module.exports = {
  analyzeAdContent,
};
