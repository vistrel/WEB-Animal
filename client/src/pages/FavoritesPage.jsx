import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFavoritesRequest } from "../api/favorites.api";
import AdCard from "../components/ads/AdCard";
import { useAuthStore } from "../store/auth.store";
import { useFavoritesStore } from "../store/favorites.store";

function FavoritesPage() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const loadFavoriteIds = useFavoritesStore((state) => state.loadFavoriteIds);

  const [state, setState] = useState({
    loading: true,
    error: "",
    items: [],
  });

  async function loadFavorites() {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: "",
    }));

    try {
      const data = await getFavoritesRequest(accessToken);
      await loadFavoriteIds(accessToken);

      setState({
        loading: false,
        error: "",
        items: data.items || [],
      });
    } catch (error) {
      setState({
        loading: false,
        error:
          error?.response?.data?.message || "Не вдалося завантажити обране",
        items: [],
      });
    }
  }

  useEffect(() => {
    if (accessToken) {
      loadFavorites();
    }
  }, [accessToken]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-toolbar">
          <div>
            <span className="hero-kicker">Особистий кабінет</span>
            <h1>Обране</h1>
            <p>
              Тут зібрані оголошення, які Ви зберегли для подальшого перегляду.
            </p>
          </div>

          <Link to="/ads" className="button button-secondary">
            До каталогу
          </Link>
        </div>

        {state.loading ? (
          <div className="catalog-state">Завантаження обраного...</div>
        ) : state.error ? (
          <div className="catalog-state error">{state.error}</div>
        ) : state.items.length ? (
          <div className="ads-grid">
            {state.items.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <div className="catalog-state">
            В обраному поки немає оголошень. Перейдіть до каталогу та натисніть
            сердечко на цікавому оголошенні.
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;
