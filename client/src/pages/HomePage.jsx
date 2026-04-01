import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { healthRequest } from "../api/public.api";
import { useAuthStore } from "../store/auth.store";

function HomePage() {
  const user = useAuthStore((state) => state.user);
  const [serverState, setServerState] = useState({
    loading: true,
    ok: false,
    text: "Перевірка підключення...",
  });

  useEffect(() => {
    let isMounted = true;

    async function checkServer() {
      try {
        await healthRequest();

        if (!isMounted) {
          return;
        }

        setServerState({
          loading: false,
          ok: true,
          text: "Сервер підключено",
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setServerState({
          loading: false,
          ok: false,
          text: "Сервер тимчасово недоступний",
        });
      }
    }

    checkServer();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page">
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="hero-kicker">
              Спеціалізований сервіс для домашніх тварин
            </span>

            <h1>
              Знайдіть улюбленця, який стане
              <span className="accent-text"> частиною Вашої родини</span>
            </h1>

            <p className="hero-text">
              Платформа створена для зручного пошуку, перегляду та розміщення
              оголошень про домашніх тварин із чіткою структурою, фільтрами,
              фотографіями та особистим кабінетом.
            </p>

            <div className="hero-actions">
              {user ? (
                <Link to="/profil" className="button">
                  Перейти до профілю
                </Link>
              ) : (
                <>
                  <Link to="/reyestratsiya" className="button">
                    Створити акаунт
                  </Link>
                  <Link to="/vkhid" className="button button-secondary">
                    Увійти
                  </Link>
                </>
              )}
            </div>

            <div className="hero-status-row">
              <span
                className={
                  serverState.ok ? "status-pill success" : "status-pill"
                }
              >
                {serverState.text}
              </span>
              <span className="status-pill">
                Підтримка світлої та темної теми
              </span>
              <span className="status-pill">Адаптивний інтерфейс</span>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-top">
              <span className="hero-card-icon">🐾</span>
              <span className="hero-card-label">Переваги платформи</span>
            </div>

            <div className="feature-list">
              <div className="feature-item">
                <h3>Зручний вибір тварини</h3>
                <p>
                  Структуровані картки з ключовими характеристиками та фото.
                </p>
              </div>

              <div className="feature-item">
                <h3>Зрозуміле розміщення оголошень</h3>
                <p>Особистий кабінет для керування оголошеннями та профілем.</p>
              </div>

              <div className="feature-item">
                <h3>Комунікація між користувачами</h3>
                <p>
                  Внутрішні повідомлення та подальший розвиток real-time чату.
                </p>
              </div>

              <div className="feature-item">
                <h3>Контроль якості контенту</h3>
                <p>Базова перевірка контенту, статуси модерації та скарги.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="container">
          <div className="section-head">
            <h2>Що вже закладено в основу системи</h2>
            <p>
              Поточна версія вже містить фундамент для дипломного веб-проєкту та
              подальшого розширення функціональності.
            </p>
          </div>

          <div className="cards-grid">
            <article className="info-card">
              <span className="card-emoji">🔐</span>
              <h3>Авторизація та ролі</h3>
              <p>
                Реєстрація, вхід, профіль користувача, refresh token та
                розмежування прав доступу.
              </p>
            </article>

            <article className="info-card">
              <span className="card-emoji">🧾</span>
              <h3>Основа для оголошень</h3>
              <p>
                У базі вже підготовлені сутності для видів тварин, порід,
                оголошень, фото, статусів та модерації.
              </p>
            </article>

            <article className="info-card">
              <span className="card-emoji">💬</span>
              <h3>Архітектура для чату</h3>
              <p>
                Передбачені діалоги, учасники, повідомлення та подальше
                підключення Socket.IO.
              </p>
            </article>

            <article className="info-card">
              <span className="card-emoji">⭐</span>
              <h3>Відгуки та рейтинг</h3>
              <p>
                Підготовлено основу для відгуків, оцінок продавця та обчислення
                середнього рейтингу.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
