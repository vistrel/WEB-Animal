import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSellerReviewsRequest } from "../api/reviews.api";
import { getPublicUserRequest } from "../api/users.api";
import AdCard from "../components/ads/AdCard";
import { resolveMediaUrl } from "../utils/ads";

function SellerPage() {
  const { id } = useParams();

  const [state, setState] = useState({
    loading: true,
    error: "",
    user: null,
    ads: [],
    reviews: [],
  });

  useEffect(() => {
    let isMounted = true;

    async function loadSeller() {
      setState({
        loading: true,
        error: "",
        user: null,
        ads: [],
        reviews: [],
      });

      try {
        const [userData, reviewsData] = await Promise.all([
          getPublicUserRequest(id),
          getSellerReviewsRequest(id),
        ]);

        if (!isMounted) {
          return;
        }

        setState({
          loading: false,
          error: "",
          user: userData.user,
          ads: userData.ads || [],
          reviews: reviewsData.items || [],
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setState({
          loading: false,
          error:
            error?.response?.data?.message ||
            "Не вдалося завантажити сторінку продавця",
          user: null,
          ads: [],
          reviews: [],
        });
      }
    }

    loadSeller();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (state.loading) {
    return (
      <div className="page">
        <div className="container">
          <div className="catalog-state">Завантаження сторінки продавця...</div>
        </div>
      </div>
    );
  }

  if (state.error || !state.user) {
    return (
      <div className="page">
        <div className="container narrow-container">
          <div className="state-card">
            <div className="state-icon">🐾</div>
            <h1>Продавця не знайдено</h1>
            <p>{state.error}</p>
            <Link to="/ads" className="button">
              До каталогу
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const avatarUrl = state.user.avatarPath
    ? resolveMediaUrl(state.user.avatarPath, state.user.fullName)
    : null;

  return (
    <div className="page">
      <div className="container">
        <section className="seller-public-card">
          <div className="seller-public-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={state.user.fullName} />
            ) : (
              <span>🐾</span>
            )}
          </div>

          <div>
            <span className="hero-kicker">Сторінка продавця</span>
            <h1>{state.user.fullName}</h1>
            <p>{state.user.bio || "Користувач ще не додав опис профілю."}</p>

            <div className="seller-public-stats">
              <span>Місто: {state.user.city || "не вказано"}</span>
              <span>
                Рейтинг: {Number(state.user.averageRating || 0).toFixed(2)}
              </span>
              <span>Відгуків: {state.user.reviewsCount || 0}</span>
            </div>
          </div>
        </section>

        <section className="results-section">
          <div className="results-head">
            <div>
              <h2>Оголошення продавця</h2>
              <p>Активні оголошення цього користувача.</p>
            </div>
          </div>

          {state.ads.length ? (
            <div className="ads-grid">
              {state.ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          ) : (
            <div className="catalog-state">
              У продавця поки немає активних оголошень.
            </div>
          )}
        </section>

        <section className="reviews-section">
          <div className="results-head">
            <div>
              <h2>Відгуки</h2>
              <p>Досвід інших користувачів після взаємодії з продавцем.</p>
            </div>
          </div>

          {state.reviews.length ? (
            <div className="reviews-list">
              {state.reviews.map((review) => (
                <article key={review.id} className="review-card">
                  <div className="review-card-head">
                    <strong>{review.author?.fullName || "Користувач"}</strong>
                    <span>
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                  </div>
                  <p>{review.text}</p>
                  {review.ad ? (
                    <Link to={`/ads/${review.ad.slug}`}>{review.ad.title}</Link>
                  ) : null}
                  <small>
                    {new Date(review.createdAt).toLocaleDateString("uk-UA")}
                  </small>
                </article>
              ))}
            </div>
          ) : (
            <div className="catalog-state">Відгуків поки немає.</div>
          )}
        </section>
      </div>
    </div>
  );
}

export default SellerPage;
