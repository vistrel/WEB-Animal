import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAdBySlugRequest } from "../api/ads.api";
import AdCard from "../components/ads/AdCard";
import {
  adTypeLabels,
  formatAge,
  formatPrice,
  genderLabels,
  getAdImage,
  statusLabels,
} from "../utils/ads";

function AdDetailsPage() {
  const { slug } = useParams();
  const [state, setState] = useState({
    loading: true,
    error: "",
    item: null,
    similarAds: [],
  });

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
    ? ad.images
    : [{ id: "placeholder", url: getAdImage(ad) }];

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
            <img
              className="ad-main-image"
              src={gallery[0].url}
              alt={ad.title}
            />

            {gallery.length > 1 ? (
              <div className="ad-thumbs">
                {gallery.map((image) => (
                  <img
                    key={image.id}
                    className="ad-thumb"
                    src={image.url}
                    alt={ad.title}
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
              <p className="seller-name">
                {ad.author?.fullName || "Користувач"}
              </p>
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
}

export default AdDetailsPage;
