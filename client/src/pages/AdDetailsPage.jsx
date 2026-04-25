import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAdBySlugRequest } from "../api/ads.api";
import { createConversationFromAdRequest } from "../api/chats.api";
import {
  createReviewRequest,
  getSellerReviewsRequest,
} from "../api/reviews.api";
import AdCard from "../components/ads/AdCard";
import { useAuthStore } from "../store/auth.store";
import { useFavoritesStore } from "../store/favorites.store";
import {
  adTypeLabels,
  createPlaceholderImage,
  formatAge,
  formatPrice,
  genderLabels,
  getAdImage,
  resolveMediaUrl,
  statusLabels,
} from "../utils/ads";

import ComplaintForm from "../components/common/ComplaintForm";
import { createAdComplaintRequest } from "../api/complaints.api";

function AdDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [complaintForm, setComplaintForm] = useState({
    reason: "SPAM",
    text: "",
  });
  const [complaintMessage, setComplaintMessage] = useState("");
  const [isComplaintSubmitting, setIsComplaintSubmitting] = useState(false);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const [state, setState] = useState({
    loading: true,
    error: "",
    item: null,
    similarAds: [],
  });
  const [reviewsState, setReviewsState] = useState({
    loading: false,
    error: "",
    items: [],
  });
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    text: "",
  });
  const [reviewMessage, setReviewMessage] = useState("");
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  async function loadReviews(sellerId) {
    if (!sellerId) {
      return;
    }

    setReviewsState((prev) => ({
      ...prev,
      loading: true,
      error: "",
    }));

    try {
      const data = await getSellerReviewsRequest(sellerId);

      setReviewsState({
        loading: false,
        error: "",
        items: data.items || [],
      });
    } catch (error) {
      setReviewsState({
        loading: false,
        error:
          error?.response?.data?.message || "Не вдалося завантажити відгуки",
        items: [],
      });
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadAd() {
      setState({
        loading: true,
        error: "",
        item: null,
        similarAds: [],
      });

      try {
        const data = await getAdBySlugRequest(slug);

        if (!isMounted) {
          return;
        }

        setState({
          loading: false,
          error: "",
          item: data.item,
          similarAds: data.similarAds || [],
        });

        loadReviews(data.item?.author?.id);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState({
          loading: false,
          error:
            error?.response?.data?.message ||
            "Не вдалося завантажити оголошення",
          item: null,
          similarAds: [],
        });
      }
    }

    loadAd();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (state.loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="catalog-state">Завантаження оголошення...</div>
        </div>
      </div>
    );
  }

  if (state.error || !state.item) {
    return (
      <div className="page">
        <div className="container narrow-container">
          <div className="state-card">
            <div className="state-icon">🐾</div>
            <h1>Оголошення не знайдено</h1>
            <p>{state.error || "Спробуйте повернутися до каталогу."}</p>
            <Link to="/ads" className="button">
              До каталогу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const ad = state.item;
  const gallery = ad.images?.length
    ? ad.images.map((image) => ({
        ...image,
        url: resolveMediaUrl(image.url, ad.title),
      }))
    : [{ id: "placeholder", url: getAdImage(ad) }];

  const isFavorite = Boolean(favoriteIds[ad.id]);
  const isOwnAd = user?.id && ad.author?.id === user.id;

  function handleMainImageError(event) {
    event.currentTarget.src = createPlaceholderImage(ad.title);
  }

  async function handleFavoriteClick() {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await toggleFavorite(ad.id, accessToken);
    } catch (error) {
      window.alert(
        error?.response?.data?.message || "Не вдалося оновити обране",
      );
    }
  }

  async function handleStartChat() {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsCreatingChat(true);

    try {
      const data = await createConversationFromAdRequest(ad.id, accessToken);
      navigate(`/messages?conversation=${data.conversationId}`);
    } catch (error) {
      window.alert(
        error?.response?.data?.message || "Не вдалося створити діалог",
      );
    } finally {
      setIsCreatingChat(false);
    }
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    setIsReviewSubmitting(true);
    setReviewMessage("");

    try {
      const data = await createReviewRequest(
        {
          sellerId: ad.author.id,
          adId: ad.id,
          rating: Number(reviewForm.rating),
          text: reviewForm.text,
        },
        accessToken,
      );

      setReviewForm({
        rating: 5,
        text: "",
      });
      setReviewMessage(data.message || "Відгук додано");
      await loadReviews(ad.author.id);
    } catch (error) {
      setReviewMessage(
        error?.response?.data?.message || "Не вдалося додати відгук",
      );
    } finally {
      setIsReviewSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="breadcrumbs">
          <Link to="/">Головна</Link>
          <span>•</span>
          <Link to="/ads">Каталог</Link>
          <span>•</span>
          <span>{ad.title}</span>
        </div>

        <section className="ad-details-layout">
          <div className="ad-gallery">
            <div className="ad-main-image-wrap">
              <img
                className="ad-main-image"
                src={gallery[0].url}
                alt={ad.title}
                onError={handleMainImageError}
              />
            </div>

            {gallery.length > 1 ? (
              <div className="ad-thumbs">
                {gallery.map((image) => (
                  <img
                    key={image.id}
                    className="ad-thumb"
                    src={image.url}
                    alt={ad.title}
                    onError={(event) => {
                      event.currentTarget.src = createPlaceholderImage(
                        ad.title,
                      );
                    }}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="ad-details-card">
            <div className="ad-details-badges">
              <span className="ad-badge primary">
                {adTypeLabels[ad.adType] || ad.adType}
              </span>
              <span className="ad-badge">
                {statusLabels[ad.status] || ad.status}
              </span>
            </div>

            <h1>{ad.title}</h1>

            <div className="ad-price-row">
              <strong>{formatPrice(ad.price)}</strong>
              <span>
                {ad.city}
                {ad.region ? `, ${ad.region}` : ""}
              </span>
            </div>

            <div className="ad-details-actions">
              <button
                type="button"
                className={`button ${isFavorite ? "button-secondary" : ""}`}
                onClick={handleFavoriteClick}
                disabled={isOwnAd}
              >
                {isFavorite ? "♥ В обраному" : "♡ Додати в обране"}
              </button>

              <button
                type="button"
                className="button button-secondary"
                onClick={handleStartChat}
                disabled={isCreatingChat || isOwnAd}
              >
                {isOwnAd
                  ? "Це Ваше оголошення"
                  : isCreatingChat
                    ? "Створення діалогу..."
                    : "Написати продавцю"}
              </button>
            </div>

            <div className="ad-characteristics">
              <div className="detail-row">
                <span>Вид тварини</span>
                <strong>{ad.petType?.name || "Не вказано"}</strong>
              </div>

              <div className="detail-row">
                <span>Порода</span>
                <strong>{ad.breed?.name || "Не вказано"}</strong>
              </div>

              <div className="detail-row">
                <span>Стать</span>
                <strong>{genderLabels[ad.animalGender] || "Невідомо"}</strong>
              </div>

              <div className="detail-row">
                <span>Вік</span>
                <strong>{formatAge(ad.ageMonths)}</strong>
              </div>

              <div className="detail-row">
                <span>Дата публікації</span>
                <strong>
                  {new Date(ad.publishedAt).toLocaleDateString("uk-UA")}
                </strong>
              </div>

              <div className="detail-row">
                <span>Перегляди</span>
                <strong>{ad.viewsCount}</strong>
              </div>
            </div>

            <div className="seller-card">
              <h3>Продавець</h3>
              <Link to={`/users/${ad.author?.id}`} className="seller-name">
                {ad.author?.fullName || "Користувач"}
              </Link>
              <p className="seller-meta">
                {ad.author?.city || "Місто не вказано"} · рейтинг{" "}
                {Number(ad.author?.averageRating || 0).toFixed(2)}
              </p>
              <p className="seller-meta">
                Кількість відгуків: {ad.author?.reviewsCount || 0}
              </p>
            </div>
          </div>
        </section>

        <section className="details-sections">
          <article className="detail-block">
            <h2>Опис</h2>
            <p>{ad.description}</p>
          </article>

          <article className="detail-block">
            <h2>Стан здоров’я</h2>
            <p>{ad.healthInfo}</p>
          </article>

          <article className="detail-block">
            <h2>Щеплення</h2>
            <p>{ad.vaccinationInfo}</p>
          </article>

          <article className="detail-block">
            <h2>Документи / родовід</h2>
            <p>{ad.documentInfo}</p>
          </article>

          <article className="detail-block">
            <h2>Умови утримання</h2>
            <p>{ad.housingInfo}</p>
          </article>
        </section>
        {!isOwnAd ? (
          <section className="complaint-section">
            <ComplaintForm
              title="Поскаржитися на оголошення"
              subtitle="Скарга потрапить до модератора. Оголошення буде додатково перевірене."
              form={complaintForm}
              isSubmitting={isComplaintSubmitting}
              message={complaintMessage}
              onChange={handleComplaintChange}
              onSubmit={handleComplaintSubmit}
            />
          </section>
        ) : null}

        <section className="reviews-section">
          <div className="results-head">
            <div>
              <h2>Відгуки про продавця</h2>
              <p>Рейтинг формується на основі оцінок користувачів.</p>
            </div>

            {ad.author?.id ? (
              <Link
                to={`/users/${ad.author.id}`}
                className="button button-secondary"
              >
                Сторінка продавця
              </Link>
            ) : null}
          </div>

          {!isOwnAd ? (
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <label className="form-field">
                <span>Оцінка</span>
                <select
                  className="input"
                  value={reviewForm.rating}
                  onChange={(event) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      rating: event.target.value,
                    }))
                  }
                >
                  <option value="5">5 — відмінно</option>
                  <option value="4">4 — добре</option>
                  <option value="3">3 — нормально</option>
                  <option value="2">2 — погано</option>
                  <option value="1">1 — дуже погано</option>
                </select>
              </label>

              <label className="form-field">
                <span>Текст відгуку</span>
                <textarea
                  className="input textarea small-textarea"
                  value={reviewForm.text}
                  onChange={(event) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      text: event.target.value,
                    }))
                  }
                  placeholder="Опишіть Ваш досвід спілкування з продавцем"
                />
              </label>

              <button
                type="submit"
                className="button"
                disabled={isReviewSubmitting}
              >
                {isReviewSubmitting ? "Надсилання..." : "Залишити відгук"}
              </button>

              {reviewMessage ? (
                <div className="profile-note">{reviewMessage}</div>
              ) : null}
            </form>
          ) : null}

          {reviewsState.loading ? (
            <div className="catalog-state">Завантаження відгуків...</div>
          ) : reviewsState.error ? (
            <div className="catalog-state error">{reviewsState.error}</div>
          ) : reviewsState.items.length ? (
            <div className="reviews-list">
              {reviewsState.items.map((review) => (
                <article key={review.id} className="review-card">
                  <div className="review-card-head">
                    <strong>{review.author?.fullName || "Користувач"}</strong>
                    <span>
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </div>
                  <p>{review.text}</p>
                  <small>
                    {new Date(review.createdAt).toLocaleDateString("uk-UA")}
                  </small>
                </article>
              ))}
            </div>
          ) : (
            <div className="catalog-state">У продавця поки немає відгуків.</div>
          )}
        </section>

        {state.similarAds.length ? (
          <section className="results-section">
            <div className="results-head">
              <div>
                <h2>Схожі оголошення</h2>
                <p>Інші оголошення цього ж виду тварини</p>
              </div>
            </div>

            <div className="ads-grid">
              {state.similarAds.map((item) => (
                <AdCard key={item.id} ad={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
  function handleComplaintChange(event) {
    const { name, value } = event.target;

    setComplaintForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleComplaintSubmit(event) {
    event.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    setIsComplaintSubmitting(true);
    setComplaintMessage("");

    try {
      const data = await createAdComplaintRequest(
        ad.id,
        complaintForm,
        accessToken,
      );

      setComplaintForm({
        reason: "SPAM",
        text: "",
      });

      setComplaintMessage(data.message || "Скаргу надіслано");
    } catch (error) {
      setComplaintMessage(
        error?.response?.data?.message || "Не вдалося надіслати скаргу",
      );
    } finally {
      setIsComplaintSubmitting(false);
    }
  }
}

export default AdDetailsPage;
