import { useState } from "react";
import { useAuthStore } from "../store/auth.store";

const roleLabels = {
  USER: "Користувач",
  MODERATOR: "Модератор",
  ADMIN: "Адміністратор",
};

const statusLabels = {
  ACTIVE: "Активний",
  BLOCKED: "Заблокований",
};

function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const [statusText, setStatusText] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function handleRefreshProfile() {
    setIsRefreshing(true);
    setStatusText("");

    try {
      await fetchMe();
      setStatusText("Дані профілю оновлено");
    } catch (error) {
      setStatusText(
        error?.response?.data?.message || "Не вдалося оновити дані",
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="section-head left">
          <h1>Мій профіль</h1>
          <p>
            На цьому етапі вже працює основа особистого кабінету. Далі сюди
            додамо редагування профілю, аватар, оголошення, обране та
            повідомлення.
          </p>
        </div>

        <div className="profile-grid">
          <section className="profile-main-card">
            <div className="profile-top">
              <div className="profile-avatar">
                {user?.fullName?.trim()?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div>
                <h2>{user?.fullName}</h2>
                <p className="profile-email">{user?.email}</p>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-row">
                <span>Роль</span>
                <strong>{roleLabels[user?.role] || user?.role}</strong>
              </div>

              <div className="detail-row">
                <span>Статус</span>
                <strong>{statusLabels[user?.status] || user?.status}</strong>
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

            <div className="profile-actions">
              <button
                type="button"
                className="button"
                onClick={handleRefreshProfile}
                disabled={isRefreshing}
              >
                {isRefreshing ? "Оновлення..." : "Оновити дані"}
              </button>
            </div>

            {statusText ? (
              <div className="profile-note">{statusText}</div>
            ) : null}
          </section>

          <aside className="profile-side">
            <article className="side-card">
              <h3>Що буде далі</h3>
              <ul className="side-list">
                <li>Мої оголошення</li>
                <li>Створення та редагування оголошень</li>
                <li>Обране</li>
                <li>Повідомлення</li>
                <li>Аватар та контактні дані</li>
              </ul>
            </article>

            <article className="side-card">
              <h3>Поточний стан етапу</h3>
              <p>
                Backend авторизації вже підключений. Frontend отримує дані
                користувача, зберігає access token у пам’яті та відновлює сесію
                через refresh token.
              </p>
            </article>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
