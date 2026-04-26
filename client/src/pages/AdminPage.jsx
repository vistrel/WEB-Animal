import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  createAdminBreedRequest,
  createAdminPetTypeRequest,
  createAdminSiteTextRequest,
  deleteAdminBreedRequest,
  deleteAdminPetTypeRequest,
  deleteAdminSiteTextRequest,
  getAdminAdsRequest,
  getAdminBreedsRequest,
  getAdminPetTypesRequest,
  getAdminSiteTextsRequest,
  getAdminStatsRequest,
  getAdminUsersRequest,
  updateAdminAdRequest,
  updateAdminBreedRequest,
  updateAdminPetTypeRequest,
  updateAdminSiteTextRequest,
  updateAdminUserRequest,
} from "../api/admin.api";
import { useAuthStore } from "../store/auth.store";

const tabs = [
  { key: "overview", label: "Огляд" },
  { key: "users", label: "Користувачі" },
  { key: "ads", label: "Оголошення" },
  { key: "catalogs", label: "Види та породи" },
  { key: "texts", label: "Тексти сайту" },
];

const roleLabels = {
  USER: "Користувач",
  MODERATOR: "Модератор",
  ADMIN: "Адміністратор",
};

const userStatusLabels = {
  ACTIVE: "Активний",
  BLOCKED: "Заблокований",
};

const adStatusLabels = {
  ACTIVE: "Активне",
  RESERVED: "Резерв",
  SOLD: "Продано",
  FLAGGED: "Позначене",
  HIDDEN: "Приховане",
  DELETED: "Видалене",
};

const moderationFlagLabels = {
  NONE: "Без зауважень",
  NEEDS_REVIEW: "Потребує перевірки",
  SUSPICIOUS: "Підозріле",
};

function cleanAdminFilters(filters) {
  return Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== "") {
      acc[key] = value;
    }

    return acc;
  }, {});
}

function AdminPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [activeTab, setActiveTab] = useState("overview");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [petTypes, setPetTypes] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [siteTexts, setSiteTexts] = useState([]);

  const [userFilters, setUserFilters] = useState({
    q: "",
    role: "",
    status: "",
  });

  const [adFilters, setAdFilters] = useState({
    q: "",
    status: "",
    moderationFlag: "",
  });

  const [petTypeForm, setPetTypeForm] = useState({
    name: "",
    slug: "",
  });

  const [breedForm, setBreedForm] = useState({
    name: "",
    slug: "",
    petTypeId: "",
  });

  const [siteTextForm, setSiteTextForm] = useState({
    key: "",
    title: "",
    content: "",
  });

  async function loadAll() {
    setLoading(true);
    setMessage("");

    try {
      const [
        statsData,
        usersData,
        adsData,
        petTypesData,
        breedsData,
        siteTextsData,
      ] = await Promise.all([
        getAdminStatsRequest(accessToken),
        getAdminUsersRequest(cleanAdminFilters(userFilters), accessToken),
        getAdminAdsRequest(cleanAdminFilters(adFilters), accessToken),
        getAdminPetTypesRequest(accessToken),
        getAdminBreedsRequest(accessToken),
        getAdminSiteTextsRequest(accessToken),
      ]);

      setStats(statsData.stats);
      setUsers(usersData.items || []);
      setAds(adsData.items || []);
      setPetTypes(petTypesData.items || []);
      setBreeds(breedsData.items || []);
      setSiteTexts(siteTextsData.items || []);
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Не вдалося завантажити адмін-панель",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers(nextFilters = userFilters) {
    const data = await getAdminUsersRequest(
      cleanAdminFilters(nextFilters),
      accessToken,
    );

    setUsers(data.items || []);
  }

  async function loadAds(nextFilters = adFilters) {
    const data = await getAdminAdsRequest(
      cleanAdminFilters(nextFilters),
      accessToken,
    );

    setAds(data.items || []);
  }

  async function reloadCatalogs() {
    const [petTypesData, breedsData] = await Promise.all([
      getAdminPetTypesRequest(accessToken),
      getAdminBreedsRequest(accessToken),
    ]);

    setPetTypes(petTypesData.items || []);
    setBreeds(breedsData.items || []);
  }

  async function reloadSiteTexts() {
    const data = await getAdminSiteTextsRequest(accessToken);
    setSiteTexts(data.items || []);
  }

  useEffect(() => {
    if (accessToken) {
      loadAll();
    }
  }, [accessToken]);

  function handleUserFilterChange(event) {
    const { name, value } = event.target;
    const nextFilters = {
      ...userFilters,
      [name]: value,
    };

    setUserFilters(nextFilters);
    loadUsers(nextFilters);
  }

  function handleAdFilterChange(event) {
    const { name, value } = event.target;
    const nextFilters = {
      ...adFilters,
      [name]: value,
    };

    setAdFilters(nextFilters);
    loadAds(nextFilters);
  }

  async function handleUserUpdate(id, payload) {
    try {
      const data = await updateAdminUserRequest(id, payload, accessToken);
      setMessage(data.message || "Користувача оновлено");
      await loadUsers();
      await loadAll();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Не вдалося оновити користувача",
      );
    }
  }

  async function handleAdUpdate(id, payload) {
    try {
      const data = await updateAdminAdRequest(id, payload, accessToken);
      setMessage(data.message || "Оголошення оновлено");
      await loadAds();
      await loadAll();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Не вдалося оновити оголошення",
      );
    }
  }

  function handlePetTypeChange(event) {
    const { name, value } = event.target;

    setPetTypeForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handlePetTypeSubmit(event) {
    event.preventDefault();

    try {
      const data = await createAdminPetTypeRequest(petTypeForm, accessToken);
      setMessage(data.message || "Вид тварини створено");
      setPetTypeForm({ name: "", slug: "" });
      await reloadCatalogs();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Не вдалося створити вид тварини",
      );
    }
  }

  async function handlePetTypeDelete(id) {
    if (!window.confirm("Видалити цей вид тварини?")) {
      return;
    }

    try {
      const data = await deleteAdminPetTypeRequest(id, accessToken);
      setMessage(data.message || "Вид тварини видалено");
      await reloadCatalogs();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Не вдалося видалити вид тварини",
      );
    }
  }

  async function handlePetTypeInlineUpdate(item) {
    const name = window.prompt("Нова назва виду тварини:", item.name);
    if (!name) return;

    const slug = window.prompt("Новий slug:", item.slug);
    if (!slug) return;

    try {
      const data = await updateAdminPetTypeRequest(
        item.id,
        { name, slug },
        accessToken,
      );
      setMessage(data.message || "Вид тварини оновлено");
      await reloadCatalogs();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Не вдалося оновити вид тварини",
      );
    }
  }

  function handleBreedChange(event) {
    const { name, value } = event.target;

    setBreedForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleBreedSubmit(event) {
    event.preventDefault();

    try {
      const data = await createAdminBreedRequest(breedForm, accessToken);
      setMessage(data.message || "Породу створено");
      setBreedForm({ name: "", slug: "", petTypeId: "" });
      await reloadCatalogs();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Не вдалося створити породу",
      );
    }
  }

  async function handleBreedDelete(id) {
    if (!window.confirm("Видалити цю породу?")) {
      return;
    }

    try {
      const data = await deleteAdminBreedRequest(id, accessToken);
      setMessage(data.message || "Породу видалено");
      await reloadCatalogs();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Не вдалося видалити породу",
      );
    }
  }

  async function handleBreedInlineUpdate(item) {
    const name = window.prompt("Нова назва породи:", item.name);
    if (!name) return;

    const slug = window.prompt("Новий slug:", item.slug);
    if (!slug) return;

    try {
      const data = await updateAdminBreedRequest(
        item.id,
        { name, slug, petTypeId: item.petTypeId },
        accessToken,
      );
      setMessage(data.message || "Породу оновлено");
      await reloadCatalogs();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Не вдалося оновити породу");
    }
  }

  function handleSiteTextChange(event) {
    const { name, value } = event.target;

    setSiteTextForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSiteTextSubmit(event) {
    event.preventDefault();

    try {
      const data = await createAdminSiteTextRequest(siteTextForm, accessToken);
      setMessage(data.message || "Текстовий блок створено");
      setSiteTextForm({ key: "", title: "", content: "" });
      await reloadSiteTexts();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Не вдалося створити текстовий блок",
      );
    }
  }

  async function handleSiteTextDelete(id) {
    if (!window.confirm("Видалити текстовий блок?")) {
      return;
    }

    try {
      const data = await deleteAdminSiteTextRequest(id, accessToken);
      setMessage(data.message || "Текстовий блок видалено");
      await reloadSiteTexts();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Не вдалося видалити текстовий блок",
      );
    }
  }

  async function handleSiteTextInlineUpdate(item) {
    const title = window.prompt("Новий заголовок:", item.title);
    if (!title) return;

    const content = window.prompt("Новий текст:", item.content);
    if (!content) return;

    try {
      const data = await updateAdminSiteTextRequest(
        item.id,
        { title, content },
        accessToken,
      );
      setMessage(data.message || "Текстовий блок оновлено");
      await reloadSiteTexts();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Не вдалося оновити текстовий блок",
      );
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-toolbar">
          <div>
            <span className="hero-kicker">Адміністратор</span>
            <h1>Адмін-панель</h1>
            <p>
              Керування користувачами, оголошеннями, каталогами тварин, породами
              та текстовими блоками сайту.
            </p>
          </div>

          <button
            type="button"
            className="button button-secondary"
            onClick={loadAll}
          >
            Оновити
          </button>
        </div>

        {message ? (
          <div className="profile-note page-message">{message}</div>
        ) : null}

        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={activeTab === tab.key ? "active" : ""}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="catalog-state">Завантаження адмін-панелі...</div>
        ) : null}

        {!loading && activeTab === "overview" ? (
          <section className="admin-section">
            <div className="admin-stats-grid">
              <article>
                <strong>{stats?.usersTotal || 0}</strong>
                <span>Користувачі</span>
              </article>

              <article>
                <strong>{stats?.usersBlocked || 0}</strong>
                <span>Заблоковані</span>
              </article>

              <article>
                <strong>{stats?.adsTotal || 0}</strong>
                <span>Оголошення</span>
              </article>

              <article>
                <strong>{stats?.adsActive || 0}</strong>
                <span>Активні</span>
              </article>

              <article>
                <strong>{stats?.adsHidden || 0}</strong>
                <span>Приховані</span>
              </article>

              <article>
                <strong>{stats?.complaintsNew || 0}</strong>
                <span>Нові скарги</span>
              </article>

              <article>
                <strong>{stats?.messagesTotal || 0}</strong>
                <span>Повідомлення</span>
              </article>

              <article>
                <strong>{stats?.reviewsTotal || 0}</strong>
                <span>Відгуки</span>
              </article>

              <article>
                <strong>{stats?.petTypesTotal || 0}</strong>
                <span>Види тварин</span>
              </article>

              <article>
                <strong>{stats?.breedsTotal || 0}</strong>
                <span>Породи</span>
              </article>
            </div>
          </section>
        ) : null}

        {!loading && activeTab === "users" ? (
          <section className="admin-section">
            <div className="filters-grid moderation-filters">
              <label className="form-field">
                <span>Пошук</span>
                <input
                  className="input"
                  name="q"
                  value={userFilters.q}
                  onChange={handleUserFilterChange}
                  placeholder="Ім’я, email або місто"
                />
              </label>

              <label className="form-field">
                <span>Роль</span>
                <select
                  className="input"
                  name="role"
                  value={userFilters.role}
                  onChange={handleUserFilterChange}
                >
                  <option value="">Усі ролі</option>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Статус</span>
                <select
                  className="input"
                  name="status"
                  value={userFilters.status}
                  onChange={handleUserFilterChange}
                >
                  <option value="">Усі статуси</option>
                  {Object.entries(userStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Користувач</th>
                    <th>Роль</th>
                    <th>Статус</th>
                    <th>Оголошення</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.fullName}</strong>
                        <small>{item.email}</small>
                      </td>
                      <td>{roleLabels[item.role]}</td>
                      <td>{userStatusLabels[item.status]}</td>
                      <td>{item.adsCount}</td>
                      <td>
                        <div className="admin-actions">
                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={() =>
                              handleUserUpdate(item.id, {
                                status:
                                  item.status === "ACTIVE"
                                    ? "BLOCKED"
                                    : "ACTIVE",
                              })
                            }
                          >
                            {item.status === "ACTIVE"
                              ? "Заблокувати"
                              : "Розблокувати"}
                          </button>

                          <button
                            type="button"
                            className="button button-ghost"
                            onClick={() =>
                              handleUserUpdate(item.id, {
                                role:
                                  item.role === "USER" ? "MODERATOR" : "USER",
                              })
                            }
                            disabled={item.role === "ADMIN"}
                          >
                            {item.role === "USER"
                              ? "Зробити модератором"
                              : "Зробити користувачем"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {!loading && activeTab === "ads" ? (
          <section className="admin-section">
            <div className="filters-grid moderation-filters">
              <label className="form-field">
                <span>Пошук</span>
                <input
                  className="input"
                  name="q"
                  value={adFilters.q}
                  onChange={handleAdFilterChange}
                  placeholder="Назва, місто або автор"
                />
              </label>

              <label className="form-field">
                <span>Статус</span>
                <select
                  className="input"
                  name="status"
                  value={adFilters.status}
                  onChange={handleAdFilterChange}
                >
                  <option value="">Усі статуси</option>
                  {Object.entries(adStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Модерація</span>
                <select
                  className="input"
                  name="moderationFlag"
                  value={adFilters.moderationFlag}
                  onChange={handleAdFilterChange}
                >
                  <option value="">Усі</option>
                  {Object.entries(moderationFlagLabels).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>

            <div className="admin-cards-list">
              {ads.map((ad) => (
                <article key={ad.id} className="admin-card">
                  <div>
                    <h3>{ad.title}</h3>
                    <p>
                      {ad.city} · {ad.author?.fullName || "Автор"} ·{" "}
                      {ad.authorEmail}
                    </p>
                    <p>
                      Статус: <strong>{adStatusLabels[ad.status]}</strong> ·
                      Модерація:{" "}
                      <strong>{moderationFlagLabels[ad.moderationFlag]}</strong>
                    </p>
                    {ad.moderationReason ? <p>{ad.moderationReason}</p> : null}
                  </div>

                  <div className="admin-actions">
                    <Link
                      to={`/ads/${ad.slug}`}
                      className="button button-secondary"
                    >
                      Переглянути
                    </Link>

                    <button
                      type="button"
                      className="button button-ghost"
                      onClick={() =>
                        handleAdUpdate(ad.id, {
                          status: ad.status === "HIDDEN" ? "ACTIVE" : "HIDDEN",
                          moderationFlag:
                            ad.status === "HIDDEN" ? "NONE" : "NEEDS_REVIEW",
                          moderationReason:
                            ad.status === "HIDDEN"
                              ? ""
                              : "Оголошення приховано адміністратором",
                        })
                      }
                    >
                      {ad.status === "HIDDEN" ? "Відновити" : "Приховати"}
                    </button>

                    <button
                      type="button"
                      className="button button-ghost"
                      onClick={() =>
                        handleAdUpdate(ad.id, {
                          status: "DELETED",
                          moderationFlag: "NEEDS_REVIEW",
                          moderationReason:
                            "Оголошення видалено адміністратором",
                        })
                      }
                    >
                      Видалити
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {!loading && activeTab === "catalogs" ? (
          <section className="admin-section admin-two-columns">
            <div className="admin-panel-card">
              <h2>Види тварин</h2>

              <form
                className="admin-inline-form"
                onSubmit={handlePetTypeSubmit}
              >
                <input
                  className="input"
                  name="name"
                  value={petTypeForm.name}
                  onChange={handlePetTypeChange}
                  placeholder="Назва"
                  required
                />

                <input
                  className="input"
                  name="slug"
                  value={petTypeForm.slug}
                  onChange={handlePetTypeChange}
                  placeholder="slug"
                  required
                />

                <button type="submit" className="button">
                  Додати
                </button>
              </form>

              <div className="admin-simple-list">
                {petTypes.map((item) => (
                  <article key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {item.slug} · порід: {item.breedsCount}
                      </small>
                    </div>

                    <div className="admin-actions">
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => handlePetTypeInlineUpdate(item)}
                      >
                        Редагувати
                      </button>

                      <button
                        type="button"
                        className="button button-ghost"
                        onClick={() => handlePetTypeDelete(item.id)}
                      >
                        Видалити
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="admin-panel-card">
              <h2>Породи</h2>

              <form className="admin-inline-form" onSubmit={handleBreedSubmit}>
                <input
                  className="input"
                  name="name"
                  value={breedForm.name}
                  onChange={handleBreedChange}
                  placeholder="Назва"
                  required
                />

                <input
                  className="input"
                  name="slug"
                  value={breedForm.slug}
                  onChange={handleBreedChange}
                  placeholder="slug"
                  required
                />

                <select
                  className="input"
                  name="petTypeId"
                  value={breedForm.petTypeId}
                  onChange={handleBreedChange}
                  required
                >
                  <option value="">Вид тварини</option>
                  {petTypes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <button type="submit" className="button">
                  Додати
                </button>
              </form>

              <div className="admin-simple-list">
                {breeds.map((item) => (
                  <article key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {item.petType?.name} · {item.slug}
                      </small>
                    </div>

                    <div className="admin-actions">
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => handleBreedInlineUpdate(item)}
                      >
                        Редагувати
                      </button>

                      <button
                        type="button"
                        className="button button-ghost"
                        onClick={() => handleBreedDelete(item.id)}
                      >
                        Видалити
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {!loading && activeTab === "texts" ? (
          <section className="admin-section">
            <div className="admin-panel-card">
              <h2>Текстові блоки сайту</h2>

              <form className="admin-text-form" onSubmit={handleSiteTextSubmit}>
                <input
                  className="input"
                  name="key"
                  value={siteTextForm.key}
                  onChange={handleSiteTextChange}
                  placeholder="Ключ, наприклад home.hero"
                  required
                />

                <input
                  className="input"
                  name="title"
                  value={siteTextForm.title}
                  onChange={handleSiteTextChange}
                  placeholder="Заголовок"
                  required
                />

                <textarea
                  className="input textarea small-textarea"
                  name="content"
                  value={siteTextForm.content}
                  onChange={handleSiteTextChange}
                  placeholder="Текст блоку"
                  required
                />

                <button type="submit" className="button">
                  Додати текстовий блок
                </button>
              </form>

              <div className="admin-cards-list">
                {siteTexts.map((item) => (
                  <article key={item.id} className="admin-card">
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.key}</p>
                      <p>{item.content}</p>
                    </div>

                    <div className="admin-actions">
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => handleSiteTextInlineUpdate(item)}
                      >
                        Редагувати
                      </button>

                      <button
                        type="button"
                        className="button button-ghost"
                        onClick={() => handleSiteTextDelete(item.id)}
                      >
                        Видалити
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

export default AdminPage;
