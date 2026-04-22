import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getAdsRequest,
  getBreedsRequest,
  getPetTypesRequest,
} from "../api/ads.api";
import MarketplaceFilters from "../components/ads/MarketplaceFilters";
import AdCard from "../components/ads/AdCard";
import {
  buildAdsApiParams,
  buildMarketplaceSearchParams,
  defaultMarketplaceFilters,
  getMarketplaceFiltersFromSearchParams,
} from "../utils/marketplace";

function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() =>
    getMarketplaceFiltersFromSearchParams(searchParams),
  );
  const [petTypes, setPetTypes] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [adsState, setAdsState] = useState({
    loading: true,
    error: "",
    items: [],
    total: 0,
  });

  useEffect(() => {
    setFilters(getMarketplaceFiltersFromSearchParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    async function loadPetTypes() {
      try {
        const data = await getPetTypesRequest();

        if (!isMounted) {
          return;
        }

        setPetTypes(data.items || []);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setPetTypes([]);
      }
    }

    loadPetTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadBreeds() {
      try {
        const data = await getBreedsRequest(
          filters.petType ? { petTypeSlug: filters.petType } : {},
        );

        if (!isMounted) {
          return;
        }

        setBreeds(data.items || []);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setBreeds([]);
      }
    }

    loadBreeds();

    return () => {
      isMounted = false;
    };
  }, [filters.petType]);

  useEffect(() => {
    let isMounted = true;

    async function loadAds() {
      setAdsState((prev) => ({
        ...prev,
        loading: true,
        error: "",
      }));

      try {
        const currentFilters =
          getMarketplaceFiltersFromSearchParams(searchParams);
        const data = await getAdsRequest(
          buildAdsApiParams(currentFilters, {
            limit: 6,
            page: 1,
          }),
        );

        if (!isMounted) {
          return;
        }

        setAdsState({
          loading: false,
          error: "",
          items: data.items || [],
          total: data.pagination?.total || 0,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setAdsState({
          loading: false,
          error:
            error?.response?.data?.message ||
            "Не вдалося завантажити оголошення",
          items: [],
          total: 0,
        });
      }
    }

    loadAds();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  function handleFilterChange(name, value) {
    setFilters((prev) => {
      if (name === "petType") {
        return {
          ...prev,
          petType: value,
          breed: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const params = buildMarketplaceSearchParams(
      {
        ...filters,
        page: "1",
      },
      { includePage: false },
    );

    setSearchParams(params);
  }

  function handleReset() {
    setFilters(defaultMarketplaceFilters);
    setSearchParams(new URLSearchParams());
  }

  const catalogHref = useMemo(() => {
    const params = buildMarketplaceSearchParams(
      {
        ...filters,
        page: "1",
      },
      { includePage: false },
    ).toString();

    return params ? `/ads?${params}` : "/ads";
  }, [filters]);

  return (
    <div className="page">
      <div className="container">
        <section className="marketplace-hero">
          <div className="marketplace-hero-copy">
            <span className="hero-kicker">Маркетплейс домашніх тварин</span>
            <h1>
              Знайдіть улюбленця за зручними параметрами вже з головної сторінки
            </h1>
            <p>
              Шукайте оголошення за видом тварини, породою, містом, віком, ціною
              та типом оголошення без зайвих переходів.
            </p>
          </div>

          <MarketplaceFilters
            title="Пошук оголошень"
            subtitle="Оберіть параметри, щоб швидко знайти потрібне оголошення"
            filters={filters}
            petTypes={petTypes}
            breeds={breeds}
            onChange={handleFilterChange}
            onSubmit={handleSubmit}
            onReset={handleReset}
            submitLabel="Знайти"
            catalogHref={catalogHref}
          />
        </section>

        <section className="results-section">
          <div className="results-head">
            <div>
              <h2>Актуальні оголошення</h2>
              <p>
                Показано {adsState.items.length} з {adsState.total} результатів
              </p>
            </div>

            <Link to={catalogHref} className="button button-secondary">
              Перейти до повного каталогу
            </Link>
          </div>

          {adsState.loading ? (
            <div className="catalog-state">Завантаження оголошень...</div>
          ) : adsState.error ? (
            <div className="catalog-state error">{adsState.error}</div>
          ) : adsState.items.length ? (
            <div className="ads-grid">
              {adsState.items.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          ) : (
            <div className="catalog-state">
              За цими параметрами оголошень не знайдено. Спробуйте змінити
              фільтри.
            </div>
          )}
        </section>

        <section className="info-section">
          <div className="section-head">
            <h2>Чому цей формат зручний</h2>
            <p>
              Проєкт одразу працює як спеціалізована інформаційна система для
              вибору домашніх тварин, а не як звичайна випадкова стрічка
              оголошень.
            </p>
          </div>

          <div className="cards-grid">
            <article className="info-card">
              <span className="card-emoji">🔎</span>
              <h3>Швидкий пошук</h3>
              <p>
                Основні фільтри винесені на головну сторінку, щоб користувач міг
                одразу перейти до потрібних оголошень.
              </p>
            </article>

            <article className="info-card">
              <span className="card-emoji">🧾</span>
              <h3>Структурована подача</h3>
              <p>
                Для кожної тварини передбачено окремі характеристики, що спрощує
                вибір та порівняння.
              </p>
            </article>

            <article className="info-card">
              <span className="card-emoji">📍</span>
              <h3>Пошук за містом</h3>
              <p>
                Місцезнаходження вказується без складної геолокації, але цього
                достатньо для практичного використання платформи.
              </p>
            </article>

            <article className="info-card">
              <span className="card-emoji">💬</span>
              <h3>Комунікація та довіра</h3>
              <p>
                Архітектура вже підготовлена під чат, рейтинг продавця, скарги
                та модерацію.
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
