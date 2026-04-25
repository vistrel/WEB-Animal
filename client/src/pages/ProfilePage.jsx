import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFavoritesRequest } from "../api/favorites.api";
import { deleteMyAdRequest, getMyAdsRequest } from "../api/my-ads.api";
import { updateProfileRequest, uploadAvatarRequest } from "../api/profile.api";
import { useAuthStore } from "../store/auth.store";
import { useFavoritesStore } from "../store/favorites.store";
import {
  adTypeLabels,
  formatAge,
  formatPrice,
  getAdImage,
  resolveMediaUrl,
  statusLabels,
} from "../utils/ads";

const roleLabels = {
  USER: "Користувач",
  MODERATOR: "Модератор",
  ADMIN: "Адміністратор",
};

const statusUserLabels = {
  ACTIVE: "Активний",
  BLOCKED: "Заблокований",
};

const moderationLabels = {
  NONE: "Без зауважень",
  NEEDS_REVIEW: "Потребує перевірки",
  SUSPICIOUS: "Підозрілий контент",
};

function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const logout = useAuthStore((state) => state.logout);
  const setSession = useAuthStore((state) => state.setSession);
  const loadFavoriteIds = useFavoritesStore((state) => state.loadFavoriteIds);

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    city: user?.city || "",
    bio: user?.bio || "",
  });

  const [adsState, setAdsState] = useState({
    loading: true,
    error: "",
    items: [],
  });

  const [favoritesState, setFavoritesState] = useState({
    loading: true,
    error: "",
    items: [],
  });

  const [statusText, setStatusText] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);

  useEffect(() => {
    setProfileForm({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      city: user?.city || "",
      bio: user?.bio || "",
    });
  }, [user]);

  async function loadMyAds() {
    setAdsState((prev) => ({
      ...prev,
      loading: true,
      error: "",
    }));

    try {
      const data = await getMyAdsRequest(accessToken);

      setAdsState({
        loading: false,
        error: "",
        items: data.items || [],
      });
    } catch (error) {
      setAdsState({
        loading: false,
        error:
          error?.response?.data?.message || "Не вдалося завантажити оголошення",
        items: [],
      });
    }
  }

  async function loadFavoritesPreview() {
    setFavoritesState((prev) => ({
      ...prev,
      loading: true,
      error: "",
    }));

    try {
      const data = await getFavoritesRequest(accessToken);
      await loadFavoriteIds(accessToken);

      setFavoritesState({
        loading: false,
        error: "",
        items: (data.items || []).slice(0, 3),
      });
    } catch (error) {
      setFavoritesState({
        loading: false,
        error:
          error?.response?.data?.message || "Не вдалося завантажити обране",
        items: [],
      });
    }
  }

  useEffect(() => {
    if (accessToken) {
      loadMyAds();
      loadFavoritesPreview();
    }
  }, [accessToken]);

  function handleProfileChange(event) {
    const { name, value } = event.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setStatusText("");
    setIsProfileSaving(true);

    try {
      const data = await updateProfileRequest(profileForm, accessToken);

      setSession({
        user: data.user,
        accessToken,
      });

      setStatusText(data.message || "Профіль оновлено");
    } catch (error) {
      setStatusText(
        error?.response?.data?.message || "Не вдалося оновити профіль",
      );
    } finally {
      setIsProfileSaving(false);
    }
  }

  async function handleAvatarChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setStatusText("");
    setIsAvatarSaving(true);

    try {
      const data = await uploadAvatarRequest(file, accessToken);

      setSession({
        user: data.user,
        accessToken,
      });

      setStatusText(data.message || "Аватар оновлено");
    } catch (error) {
      setStatusText(
        error?.response?.data?.message || "Не вдалося оновити аватар",
      );
    } finally {
      setIsAvatarSaving(false);
      event.target.value = "";
    }
  }

  async function handleRefreshProfile() {
    setIsRefreshing(true);
    setStatusText("");

    try {
      await fetchMe();
      await loadMyAds();
      await loadFavoritesPreview();
      setStatusText("Дані профілю оновлено");
    } catch (error) {
      setStatusText(
        error?.response?.data?.message || "Не вдалося оновити дані",
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  async function handleDeleteAd(adId) {
    const isConfirmed = window.confirm("Видалити це оголошення?");

    if (!isConfirmed) {
      return;
    }

    setStatusText("");

    try {
      await deleteMyAdRequest(adId, accessToken);
      await loadMyAds();
      setStatusText("Оголошення видалено");
    } catch (error) {
      setStatusText(
        error?.response?.data?.message || "Не вдалося видалити оголошення",
      );
    }
  }

  const avatarUrl = user?.avatarPath
    ? resolveMediaUrl(user.avatarPath, user.fullName)
    : null;

  return (
    <div className="page">
      <div className="container">
        <div className="section-head left profile-heading">
          <div>
            <h1>Мій профіль</h1>
            <p>
              Особистий кабінет для керування профілем, оголошеннями, обраним та
              подальшими функціями платформи.
            </p>
          </div>

          <Link to="/create-ad" className="button">
            Створити оголошення
          </Link>
        </div>

        <div className="profile-grid">
          <section className="profile-main-card">
            <div className="profile-top">
              <label className="profile-avatar editable-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user?.fullName || "Аватар"} />
                ) : (
                  <span>
                    {user?.fullName?.trim()?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  disabled={isAvatarSaving}
                />
              </label>

              <div>
                <h2>{user?.fullName}</h2>
                <p className="profile-email">{user?.email}</p>
                <p className="avatar-note">
                  {isAvatarSaving
                    ? "Оновлення аватара..."
                    : "Натисніть на аватар, щоб змінити фото"}
                </p>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-row">
                <span>Роль</span>
                <strong>{roleLabels[user?.role] || user?.role}</strong>
              </div>

              <div className="detail-row">
                <span>Статус</span>
                <strong>
                  {statusUserLabels[user?.status] || user?.status}
                </strong>
              </div>

              <div className="detail-row">
                <span>Телефон</span>
                <strong>{user?.phone || "Не вказано"}</strong>
              </div>

              <div className="detail-row">
                <span>Місто</span>
                <strong>{user?.city || "Не вказано"}</strong>
              </div>

              <div className="detail-row">
                <span>Середній рейтинг</span>
                <strong>{Number(user?.averageRating || 0).toFixed(2)}</strong>
              </div>

              <div className="detail-row">
                <span>Кількість відгуків</span>
                <strong>{user?.reviewsCount || 0}</strong>
              </div>
            </div>

            <div className="profile-actions profile-actions-wrap">
              <button
                type="button"
                className="button"
                onClick={handleRefreshProfile}
                disabled={isRefreshing}
              >
                {isRefreshing ? "Оновлення..." : "Оновити дані"}
              </button>

              <Link to="/ads" className="button button-secondary">
                Перейти до каталогу
              </Link>

              <button
                type="button"
                className="button button-ghost"
                onClick={handleLogout}
              >
                Вийти з акаунта
              </button>
            </div>

            {statusText ? (
              <div className="profile-note">{statusText}</div>
            ) : null}
          </section>

          <aside className="profile-side">
            <article className="side-card">
              <h3>Редагування профілю</h3>

              <form
                className="profile-edit-form"
                onSubmit={handleProfileSubmit}
              >
                <label className="form-field">
                  <span>Ім’я та прізвище</span>
                  <input
                    className="input"
                    name="fullName"
                    value={profileForm.fullName}
                    onChange={handleProfileChange}
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Телефон</span>
                  <input
                    className="input"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    placeholder="+380..."
                  />
                </label>

                <label className="form-field">
                  <span>Місто</span>
                  <input
                    className="input"
                    name="city"
                    value={profileForm.city}
                    onChange={handleProfileChange}
                    placeholder="Вкажіть місто"
                  />
                </label>

                <label className="form-field">
                  <span>Про себе</span>
                  <textarea
                    className="input textarea small-textarea"
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    placeholder="Коротко опишіть себе як продавця або власника тварин"
                  />
                </label>

                <button
                  type="submit"
                  className="button full-width"
                  disabled={isProfileSaving}
                >
                  {isProfileSaving ? "Збереження..." : "Зберегти профіль"}
                </button>
              </form>
            </article>

            <article className="side-card">
              <h3>Обране</h3>

              {favoritesState.loading ? (
                <p>Завантаження обраного...</p>
              ) : favoritesState.error ? (
                <p>{favoritesState.error}</p>
              ) : favoritesState.items.length ? (
                <div className="favorites-preview-list">
                  {favoritesState.items.map((ad) => (
                    <Link
                      key={ad.id}
                      to={`/ads/${ad.slug}`}
                      className="favorite-preview-item"
                    >
                      <img src={getAdImage(ad)} alt={ad.title} />
                      <span>{ad.title}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p>Поки немає збережених оголошень.</p>
              )}

              <Link
                to="/favorites"
                className="button button-secondary full-width"
              >
                Перейти в обране
              </Link>
            </article>
          </aside>
        </div>

        <section className="my-ads-section">
          <div className="results-head">
            <div>
              <h2>Мої оголошення</h2>
              <p>
                Керуйте власними оголошеннями та переглядайте статус модерації.
              </p>
            </div>

            <Link to="/create-ad" className="button">
              Додати оголошення
            </Link>
          </div>

          {adsState.loading ? (
            <div className="catalog-state">Завантаження Ваших оголошень...</div>
          ) : adsState.error ? (
            <div className="catalog-state error">{adsState.error}</div>
          ) : adsState.items.length ? (
            <div className="my-ads-list">
              {adsState.items.map((ad) => (
                <article className="my-ad-card" key={ad.id}>
                  <img
                    className="my-ad-image"
                    src={getAdImage(ad)}
                    alt={ad.title}
                  />

                  <div className="my-ad-body">
                    <div className="my-ad-top">
                      <div>
                        <h3>{ad.title}</h3>
                        <p>
                          {adTypeLabels[ad.adType] || ad.adType} · {ad.city} ·{" "}
                          {formatAge(ad.ageMonths)}
                        </p>
                      </div>

                      <strong>{formatPrice(ad.price)}</strong>
                    </div>

                    <div className="my-ad-tags">
                      <span>{statusLabels[ad.status] || ad.status}</span>
                      <span>
                        {moderationLabels[ad.moderationFlag] ||
                          ad.moderationFlag}
                      </span>
                      <span>{ad.petType?.name || "Тварина"}</span>
                    </div>

                    {ad.moderationReason ? (
                      <p className="my-ad-warning">{ad.moderationReason}</p>
                    ) : null}

                    <div className="my-ad-actions">
                      <Link
                        to={`/ads/${ad.slug}`}
                        className="button button-secondary"
                      >
                        Переглянути
                      </Link>

                      <Link to={`/edit-ad/${ad.id}`} className="button">
                        Редагувати
                      </Link>

                      <button
                        type="button"
                        className="button button-ghost"
                        onClick={() => handleDeleteAd(ad.id)}
                      >
                        Видалити
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="catalog-state">
              У Вас ще немає оголошень. Створіть перше оголошення, щоб воно
              з’явилося у каталозі.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
