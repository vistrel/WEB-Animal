function countMatches(value, pattern) {
  const matches = value.match(pattern);
  return matches ? matches.length : 0;
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
  const repeatedCharsCount = countMatches(text, /(.)\1{5,}/gi);

  if (linkCount > 1) {
    reasons.push("Забагато посилань у тексті");
  }

  if (contactSpamCount > 2) {
    reasons.push("Текст схожий на рекламне або спам-повідомлення");
  }

  if (suspiciousWordsCount > 0) {
    reasons.push("Виявлено підозрілі формулювання");
  }

  if (repeatedCharsCount > 0) {
    reasons.push("Виявлено неприродні повтори символів");
  }

  const lettersOnly = text.replace(/[^a-zа-яіїєґ]/gi, "");
  const upperOnly = [payload.title, payload.description]
    .filter(Boolean)
    .join(" ")
    .replace(/[^A-ZА-ЯІЇЄҐ]/g, "");

  if (lettersOnly.length > 40 && upperOnly.length / lettersOnly.length > 0.45) {
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
