import { useEffect, useState } from "react";
import {
  getAdsRequest,
  getBreedsRequest,
  getPetTypesRequest,
} from "../api/ads.api";
import MarketplaceFilters from "../components/ads/MarketplaceFilters";
import AdCard from "../components/ads/AdCard";
import Pagination from "../components/ads/Pagination";
import {
  buildAdsApiParams,
  buildMarketplaceSearchParams,
  defaultMarketplaceFilters,
  getMarketplaceFiltersFromSearchParams,
} from "../utils/marketplace";
import { useSearchParams } from "react-router-dom";
import Seo from "../components/common/Seo";
function AdsCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() =>
    getMarketplaceFiltersFromSearchParams(searchParams),
  );
  const [petTypes, setPetTypes] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [catalogState, setCatalogState] = useState({
    loading: true,
    error: "",
    items: [],
    pagination: {
      page: 1,
      totalPages: 1,
      total: 0,
    },
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
      setCatalogState((prev) => ({
        ...prev,
        loading: true,
        error: "",
      }));

      try {
        const currentFilters =
          getMarketplaceFiltersFromSearchParams(searchParams);
        const data = await getAdsRequest(
          buildAdsApiParams(currentFilters, {
            limit: 9,
            page: Number(currentFilters.page || 1),
          }),
        );

        if (!isMounted) {
          return;
        }

        setCatalogState({
          loading: false,
          error: "",
          items: data.items || [],
          pagination: data.pagination || {
            page: 1,
            totalPages: 1,
            total: 0,
          },
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setCatalogState({
          loading: false,
          error:
            error?.response?.data?.message || "Не вдалося завантажити каталог",
          items: [],
          pagination: {
            page: 1,
            totalPages: 1,
            total: 0,
          },
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
      { includePage: true },
    );

    setSearchParams(params);
  }

  function handleReset() {
    setFilters(defaultMarketplaceFilters);
    setSearchParams(new URLSearchParams());
  }

  function handlePageChange(nextPage) {
    const params = buildMarketplaceSearchParams(
      {
        ...filters,
        page: String(nextPage),
      },
      { includePage: true },
    );

    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="page">
      <Seo
        title="Каталог оголошень"
        description="Каталог оголошень PetUA з пошуком, фільтрами за видом тварини, породою, ціною, містом, статтю, віком та типом оголошення."
        path="/ads"
      />
      <div className="container">
        <MarketplaceFilters
          title="Каталог оголошень"
          subtitle="Використовуйте пошук, фільтри та сортування для зручного вибору тварини"
          filters={filters}
          petTypes={petTypes}
          breeds={breeds}
          onChange={handleFilterChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
          submitLabel="Показати результати"
          compact
        />

        <section className="results-section">
          <div className="results-head">
            <div>
              <h2>Результати пошуку</h2>
              <p>Знайдено {catalogState.pagination.total} оголошень</p>
            </div>
          </div>

          {catalogState.loading ? (
            <div className="catalog-state">Завантаження каталогу...</div>
          ) : catalogState.error ? (
            <div className="catalog-state error">{catalogState.error}</div>
          ) : catalogState.items.length ? (
            <>
              <div className="ads-grid">
                {catalogState.items.map((ad) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>

              <Pagination
                page={catalogState.pagination.page}
                totalPages={catalogState.pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="catalog-state">
              Нічого не знайдено. Спробуйте змінити параметри пошуку.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdsCatalogPage;
