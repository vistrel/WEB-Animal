import { useEffect, useState } from "react";
import {
  getModerationComplaintsRequest,
  getModerationStatsRequest,
  hideAdRequest,
  restoreAdRequest,
  updateComplaintStatusRequest,
} from "../api/moderation.api";
import { useAuthStore } from "../store/auth.store";
import { Link } from "react-router-dom";

const statusLabels = {
  NEW: "Нова",
  IN_PROGRESS: "В роботі",
  RESOLVED: "Вирішена",
  REJECTED: "Відхилена",
};

const targetTypeLabels = {
  AD: "Оголошення",
  USER: "Користувач",
  MESSAGE: "Повідомлення",
};

const reasonLabels = {
  SPAM: "Спам або реклама",
  FRAUD: "Шахрайство",
  INAPPROPRIATE: "Неприпустимий контент",
  DANGEROUS: "Небезпечна інформація",
  WRONG_INFO: "Неправдива інформація",
  OTHER: "Інша причина",
};

function ModerationPage() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    targetType: "",
  });
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadData(nextFilters = filters) {
    setLoading(true);
    setMessage("");

    try {
      const [statsData, complaintsData] = await Promise.all([
        getModerationStatsRequest(accessToken),
        getModerationComplaintsRequest(
          {
            status: nextFilters.status || undefined,
            targetType: nextFilters.targetType || undefined,
          },
          accessToken,
        ),
      ]);

      setStats(statsData.stats);
      setComplaints(complaintsData.items || []);
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Не вдалося завантажити модерацію",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken) {
      loadData();
    }
  }, [accessToken]);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    const nextFilters = {
      ...filters,
      [name]: value,
    };

    setFilters(nextFilters);
    loadData(nextFilters);
  }

  async function handleStatusChange(id, status) {
    try {
      const data = await updateComplaintStatusRequest(
        id,
        {
          status,
          moderatorNote: "",
        },
        accessToken,
      );

      setMessage(data.message || "Статус оновлено");
      await loadData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Не вдалося оновити статус");
    }
  }

  async function handleHideAd(adId) {
    const reason = window.prompt(
      "Вкажіть причину приховування оголошення:",
      "Порушення правил платформи",
    );

    if (!reason) {
      return;
    }

    try {
      const data = await hideAdRequest(
        adId,
        {
          reason,
        },
        accessToken,
      );

      setMessage(data.message || "Оголошення приховано");
      await loadData();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Не вдалося приховати оголошення",
      );
    }
  }

  async function handleRestoreAd(adId) {
    try {
      const data = await restoreAdRequest(adId, accessToken);

      setMessage(data.message || "Оголошення відновлено");
      await loadData();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Не вдалося відновити оголошення",
      );
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-toolbar">
          <div>
            <span className="hero-kicker">Модерація</span>
            <h1>Скарги та контроль оголошень</h1>
            <p>
              Розділ для модератора та адміністратора. Тут можна переглядати
              скарги, змінювати їх статус і приховувати проблемні оголошення.
            </p>
          </div>
        </div>

        {message ? (
          <div className="profile-note page-message">{message}</div>
        ) : null}

        {stats ? (
          <div className="moderation-stats-grid">
            <article>
              <strong>{stats.totalComplaints}</strong>
              <span>Усього скарг</span>
            </article>

            <article>
              <strong>{stats.newComplaints}</strong>
              <span>Нові</span>
            </article>

            <article>
              <strong>{stats.inProgressComplaints}</strong>
              <span>В роботі</span>
            </article>

            <article>
              <strong>{stats.resolvedComplaints}</strong>
              <span>Вирішені</span>
            </article>

            <article>
              <strong>{stats.hiddenAds}</strong>
              <span>Приховані оголошення</span>
            </article>

            <article>
              <strong>{stats.needsReviewAds + stats.suspiciousAds}</strong>
              <span>Потребують уваги</span>
            </article>
          </div>
        ) : null}

        <section className="moderation-panel">
          <div className="filters-grid moderation-filters">
            <label className="form-field">
              <span>Статус</span>
              <select
                className="input"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">Усі статуси</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Тип скарги</span>
              <select
                className="input"
                name="targetType"
                value={filters.targetType}
                onChange={handleFilterChange}
              >
                <option value="">Усі типи</option>
                {Object.entries(targetTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading ? (
            <div className="catalog-state">Завантаження скарг...</div>
          ) : complaints.length ? (
            <div className="complaints-list">
              {complaints.map((complaint) => (
                <article key={complaint.id} className="complaint-card">
                  <div className="complaint-card-head">
                    <div>
                      <h3>
                        {targetTypeLabels[complaint.targetType]} ·{" "}
                        {reasonLabels[complaint.reason]}
                      </h3>
                      <p>
                        Статус:{" "}
                        <strong>{statusLabels[complaint.status]}</strong>
                      </p>
                    </div>

                    <span>
                      {new Date(complaint.createdAt).toLocaleString("uk-UA")}
                    </span>
                  </div>

                  {complaint.text ? (
                    <p className="complaint-text">{complaint.text}</p>
                  ) : null}

                  <div className="complaint-meta">
                    <span>
                      Автор скарги:{" "}
                      {complaint.reporter?.fullName || "Користувач"}
                    </span>

                    {complaint.ad ? (
                      <span>
                        Оголошення:{" "}
                        <Link to={`/ads/${complaint.ad.slug}`}>
                          {complaint.ad.title}
                        </Link>
                      </span>
                    ) : null}

                    {complaint.targetUser ? (
                      <span>
                        Користувач:{" "}
                        <Link to={`/users/${complaint.targetUser.id}`}>
                          {complaint.targetUser.fullName}
                        </Link>
                      </span>
                    ) : null}

                    {complaint.message ? (
                      <span>Повідомлення: {complaint.message.text}</span>
                    ) : null}
                  </div>

                  <div className="complaint-actions">
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() =>
                        handleStatusChange(complaint.id, "IN_PROGRESS")
                      }
                    >
                      Взяти в роботу
                    </button>

                    <button
                      type="button"
                      className="button"
                      onClick={() =>
                        handleStatusChange(complaint.id, "RESOLVED")
                      }
                    >
                      Позначити вирішеною
                    </button>

                    <button
                      type="button"
                      className="button button-ghost"
                      onClick={() =>
                        handleStatusChange(complaint.id, "REJECTED")
                      }
                    >
                      Відхилити
                    </button>

                    {complaint.ad && complaint.ad.status !== "HIDDEN" ? (
                      <button
                        type="button"
                        className="button button-ghost"
                        onClick={() => handleHideAd(complaint.ad.id)}
                      >
                        Приховати оголошення
                      </button>
                    ) : null}

                    {complaint.ad && complaint.ad.status === "HIDDEN" ? (
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => handleRestoreAd(complaint.ad.id)}
                      >
                        Відновити оголошення
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="catalog-state">
              Скарг за цими параметрами немає.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ModerationPage;
