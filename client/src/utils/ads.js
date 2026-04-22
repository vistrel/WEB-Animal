export const adTypeLabels = {
  SALE: "Продаж",
  ADOPTION: "Віддам у добрі руки",
  BREEDING: "В’язка",
  LOST_FOUND: "Знайдено / загублено",
  RESERVED_SOLD: "Резерв / продано",
};

export const genderLabels = {
  MALE: "Самець",
  FEMALE: "Самка",
  UNKNOWN: "Невідомо",
};

export const statusLabels = {
  ACTIVE: "Активне",
  RESERVED: "Резерв",
  SOLD: "Продано",
};

export const ageGroupLabels = {
  baby: "До 6 місяців",
  young: "7–24 місяці",
  adult: "2–7 років",
  senior: "Старше 7 років",
};

export const sortOptions = [
  { value: "newest", label: "Спочатку новіші" },
  { value: "price_asc", label: "Ціна: від меншої" },
  { value: "price_desc", label: "Ціна: від більшої" },
  { value: "age_asc", label: "Вік: від меншого" },
  { value: "age_desc", label: "Вік: від більшого" },
  { value: "popular", label: "Популярні" },
];

export function formatPrice(value) {
  const number = Number(value || 0);

  if (!number) {
    return "Безкоштовно";
  }

  return `${new Intl.NumberFormat("uk-UA").format(number)} грн`;
}

export function formatAge(months) {
  const totalMonths = Number(months || 0);

  if (totalMonths < 12) {
    return `${totalMonths} міс.`;
  }

  const years = Math.floor(totalMonths / 12);
  const restMonths = totalMonths % 12;

  if (!restMonths) {
    return `${years} р.`;
  }

  return `${years} р. ${restMonths} міс.`;
}

export function createPlaceholderImage(title = "Оголошення") {
  const safeTitle = encodeURIComponent(title.slice(0, 28));
  const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560">
            <defs>
                <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stop-color="#ffe4cf" />
                    <stop offset="100%" stop-color="#f3b28a" />
                </linearGradient>
            </defs>
            <rect width="800" height="560" fill="url(#g)" />
            <circle cx="170" cy="155" r="58" fill="rgba(255,255,255,0.45)" />
            <circle cx="630" cy="120" r="42" fill="rgba(255,255,255,0.35)" />
            <text x="50%" y="44%" text-anchor="middle" font-size="82">🐾</text>
            <text x="50%" y="58%" text-anchor="middle" font-size="28" font-family="Arial, sans-serif" fill="#5a3f31">${safeTitle}</text>
        </svg>
    `;

  return `data:image/svg+xml;charset=UTF-8,${svg}`;
}

export function getAdImage(ad) {
  return (
    ad?.imageUrl || ad?.images?.[0]?.url || createPlaceholderImage(ad?.title)
  );
}
