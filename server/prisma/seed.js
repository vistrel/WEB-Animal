const bcrypt = require("bcryptjs");
const {
  PrismaClient,
  Role,
  UserStatus,
  AdType,
  AnimalGender,
  AdStatus,
  ModerationFlag,
} = require("@prisma/client");

const prisma = new PrismaClient();

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-zа-яіїєґ0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

async function upsertUser(data) {
  const passwordHash = await bcrypt.hash(data.password, 10);

  return prisma.user.upsert({
    where: { email: data.email },
    update: {
      fullName: data.fullName,
      role: data.role,
      status: data.status,
      phone: data.phone,
      city: data.city,
      passwordHash,
    },
    create: {
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      role: data.role,
      status: data.status,
      phone: data.phone,
      city: data.city,
    },
  });
}

async function main() {
  const petTypesData = [
    { name: "Собака", slug: "sobaka" },
    { name: "Кішка", slug: "kishka" },
    { name: "Птах", slug: "ptakh" },
    { name: "Гризун", slug: "gryzun" },
    { name: "Кролик", slug: "krolyk" },
  ];

  const breedData = [
    { petTypeSlug: "sobaka", name: "Лабрадор-ретривер" },
    { petTypeSlug: "sobaka", name: "Французький бульдог" },
    { petTypeSlug: "sobaka", name: "Німецька вівчарка" },

    { petTypeSlug: "kishka", name: "Мейн-кун" },
    { petTypeSlug: "kishka", name: "Британська короткошерста" },
    { petTypeSlug: "kishka", name: "Шотландська висловуха" },

    { petTypeSlug: "ptakh", name: "Хвилястий папуга" },
    { petTypeSlug: "ptakh", name: "Корела" },

    { petTypeSlug: "gryzun", name: "Морська свинка" },
    { petTypeSlug: "gryzun", name: "Хом’як сирійський" },

    { petTypeSlug: "krolyk", name: "Карликовий кролик" },
  ];

  const siteTexts = [
    {
      key: "home.hero.title",
      title: "Заголовок головної сторінки",
      content: "Знайдіть улюбленця, який стане частиною Вашої родини",
    },
    {
      key: "home.hero.subtitle",
      title: "Підзаголовок головної сторінки",
      content:
        "Оголошення про продаж, прилаштування, в’язку та пошук домашніх тварин в одному зручному сервісі",
    },
    {
      key: "home.about.short",
      title: "Короткий текст про сервіс",
      content:
        "Платформа створена для зручного вибору домашніх тварин, структурованого перегляду оголошень та безпечної комунікації між користувачами",
    },
  ];

  const users = [
    {
      fullName: "Адміністратор платформи",
      email: "admin@petua.local",
      password: "Admin123!",
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      phone: "+380671110000",
      city: "Київ",
    },
    {
      fullName: "Модератор платформи",
      email: "moderator@petua.local",
      password: "Moderator123!",
      role: Role.MODERATOR,
      status: UserStatus.ACTIVE,
      phone: "+380671110001",
      city: "Львів",
    },
    {
      fullName: "Олена Кравчук",
      email: "olena@petua.local",
      password: "User12345!",
      role: Role.USER,
      status: UserStatus.ACTIVE,
      phone: "+380671110002",
      city: "Київ",
    },
    {
      fullName: "Тарас Мельник",
      email: "taras@petua.local",
      password: "User12345!",
      role: Role.USER,
      status: UserStatus.ACTIVE,
      phone: "+380671110003",
      city: "Львів",
    },
    {
      fullName: "Заблокований користувач",
      email: "blocked@petua.local",
      password: "User12345!",
      role: Role.USER,
      status: UserStatus.BLOCKED,
      phone: "+380671110004",
      city: "Одеса",
    },
  ];

  const petTypesMap = {};

  for (const item of petTypesData) {
    const petType = await prisma.petType.upsert({
      where: { slug: item.slug },
      update: { name: item.name },
      create: item,
    });

    petTypesMap[item.slug] = petType;
  }

  const breedsMap = {};

  for (const item of breedData) {
    const petType = petTypesMap[item.petTypeSlug];
    const slug = `${item.petTypeSlug}-${slugify(item.name)}`;

    const breed = await prisma.breed.upsert({
      where: { slug },
      update: {
        name: item.name,
        petTypeId: petType.id,
      },
      create: {
        name: item.name,
        slug,
        petTypeId: petType.id,
      },
    });

    breedsMap[slug] = breed;
  }

  for (const item of siteTexts) {
    await prisma.siteText.upsert({
      where: { key: item.key },
      update: {
        title: item.title,
        content: item.content,
      },
      create: item,
    });
  }

  const createdUsers = {};

  for (const user of users) {
    const created = await upsertUser(user);
    createdUsers[user.email] = created;
  }

  const ads = [
    {
      slug: "prodazh-tsutseniaty-labradora-kyiv",
      title: "Продаж цуценяти лабрадора",
      description:
        "Активне та дружнє цуценя лабрадора. Добре контактує з людьми, привчене до базового режиму, підходить для сім’ї з дітьми.",
      adType: AdType.SALE,
      animalGender: AnimalGender.MALE,
      ageMonths: 4,
      price: "12000.00",
      city: "Київ",
      region: "Київська область",
      healthInfo: "Клінічно здоровий, проходив огляд у ветеринара",
      vaccinationInfo: "Є базові щеплення за віком",
      documentInfo: "Є ветеринарний паспорт",
      housingInfo: "Утримується в квартирі, звик до людей",
      status: AdStatus.ACTIVE,
      moderationFlag: ModerationFlag.NONE,
      authorEmail: "olena@petua.local",
      petTypeSlug: "sobaka",
      breedSlug: "sobaka-labrador-retryver",
    },
    {
      slug: "viddam-kishku-v-dobri-ruky-lviv",
      title: "Віддам кішку в добрі руки",
      description:
        "Лагідна стерилізована кішка, спокійна та охайна. Шукаємо відповідальну родину, яка готова піклуватися про тварину.",
      adType: AdType.ADOPTION,
      animalGender: AnimalGender.FEMALE,
      ageMonths: 24,
      price: "0.00",
      city: "Львів",
      region: "Львівська область",
      healthInfo: "Здорова, стерилізована",
      vaccinationInfo: "Щеплення зроблені",
      documentInfo: "Є ветеринарний паспорт",
      housingInfo: "Привчена до лотка, живе в квартирі",
      status: AdStatus.ACTIVE,
      moderationFlag: ModerationFlag.NONE,
      authorEmail: "taras@petua.local",
      petTypeSlug: "kishka",
      breedSlug: "kishka-brytanska-korotkoshersta",
    },
    {
      slug: "vyazka-frantsuzkyi-buldoh-odesa",
      title: "В’язка французький бульдог",
      description:
        "Пропонується самець французького бульдога для в’язки. Має спокійний характер, хороший родовід та доглянутий зовнішній вигляд.",
      adType: AdType.BREEDING,
      animalGender: AnimalGender.MALE,
      ageMonths: 36,
      price: "3500.00",
      city: "Одеса",
      region: "Одеська область",
      healthInfo: "Здоровий, регулярно проходить огляди",
      vaccinationInfo: "Усі щеплення актуальні",
      documentInfo: "Є родовід та ветеринарні документи",
      housingInfo: "Утримується в приватному будинку",
      status: AdStatus.ACTIVE,
      moderationFlag: ModerationFlag.NONE,
      authorEmail: "olena@petua.local",
      petTypeSlug: "sobaka",
      breedSlug: "sobaka-frantsuzkyi-buldoh",
    },
    {
      slug: "znaydeno-korelu-dnipro",
      title: "Знайдено корелу",
      description:
        "У районі парку знайдено ручного папугу корелу. Шукаємо власника. Птах спокійний, йде на контакт.",
      adType: AdType.LOST_FOUND,
      animalGender: AnimalGender.UNKNOWN,
      ageMonths: 12,
      price: "0.00",
      city: "Дніпро",
      region: "Дніпропетровська область",
      healthInfo: "Зовнішніх ознак хвороби не виявлено",
      vaccinationInfo: "Немає даних",
      documentInfo: "Документи відсутні",
      housingInfo: "Тимчасово утримується в клітці",
      status: AdStatus.FLAGGED,
      moderationFlag: ModerationFlag.NEEDS_REVIEW,
      authorEmail: "taras@petua.local",
      petTypeSlug: "ptakh",
      breedSlug: "ptakh-korela",
    },
  ];

  for (const item of ads) {
    const author = createdUsers[item.authorEmail];
    const petType = petTypesMap[item.petTypeSlug];
    const breed = breedsMap[item.breedSlug] || null;

    await prisma.ad.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        adType: item.adType,
        animalGender: item.animalGender,
        ageMonths: item.ageMonths,
        price: item.price,
        city: item.city,
        region: item.region,
        healthInfo: item.healthInfo,
        vaccinationInfo: item.vaccinationInfo,
        documentInfo: item.documentInfo,
        housingInfo: item.housingInfo,
        status: item.status,
        moderationFlag: item.moderationFlag,
        authorId: author.id,
        petTypeId: petType.id,
        breedId: breed ? breed.id : null,
      },
      create: {
        slug: item.slug,
        title: item.title,
        description: item.description,
        adType: item.adType,
        animalGender: item.animalGender,
        ageMonths: item.ageMonths,
        price: item.price,
        city: item.city,
        region: item.region,
        healthInfo: item.healthInfo,
        vaccinationInfo: item.vaccinationInfo,
        documentInfo: item.documentInfo,
        housingInfo: item.housingInfo,
        status: item.status,
        moderationFlag: item.moderationFlag,
        authorId: author.id,
        petTypeId: petType.id,
        breedId: breed ? breed.id : null,
      },
    });
  }

  console.log("Seed завершено успішно");
  console.log("Тестові акаунти:");
  console.log("admin@petua.local / Admin123!");
  console.log("moderator@petua.local / Moderator123!");
  console.log("olena@petua.local / User12345!");
  console.log("taras@petua.local / User12345!");
  console.log("blocked@petua.local / User12345!");
}

main()
  .catch((error) => {
    console.error("Помилка seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
