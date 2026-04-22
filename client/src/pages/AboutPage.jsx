import { useEffect, useState } from "react";
import { healthRequest } from "../api/public.api";

function AboutPage() {
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
              Платформа створена для
              <span className="accent-text">
                {" "}
                зручного вибору та розміщення оголошень
              </span>
            </h1>

            <p className="hero-text">
              Сервіс орієнтований на структуровану подачу інформації про тварин,
              фільтрацію за ключовими параметрами, зрозумілий інтерфейс та
              подальшу комунікацію між продавцем і покупцем.
            </p>

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
              <span className="status-pill">
                Підготовка до чату та модерації
              </span>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-top">
              <span className="hero-card-icon">🐾</span>
              <span className="hero-card-label">Ключові ідеї проєкту</span>
            </div>

            <div className="feature-list">
              <div className="feature-item">
                <h3>Зручний вибір тварини</h3>
                <p>
                  Пошук, фільтри, сортування та структурована сторінка
                  оголошення.
                </p>
              </div>

              <div className="feature-item">
                <h3>Зручне розміщення оголошень</h3>
                <p>
                  Особистий кабінет користувача та підготовлена основа для
                  редагування записів.
                </p>
              </div>

              <div className="feature-item">
                <h3>Комунікація між користувачами</h3>
                <p>
                  Архітектура вже готова під внутрішній чат та повідомлення.
                </p>
              </div>

              <div className="feature-item">
                <h3>Контроль якості контенту</h3>
                <p>
                  Передбачені скарги, модерація, ролі та адміністративні
                  можливості.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="container">
          <div className="section-head">
            <h2>Що закладено в основу системи</h2>
            <p>
              Поточна архітектура одразу орієнтована на дипломний формат:
              каталог, профілі, чат, рейтинг, скарги, модерацію та базову
              адмін-панель.
            </p>
          </div>

          <div className="cards-grid">
            <article className="info-card">
              <span className="card-emoji">🔐</span>
              <h3>Авторизація та ролі</h3>
              <p>
                Підтримуються користувач, модератор та адміністратор із
                розмежуванням доступу.
              </p>
            </article>

            <article className="info-card">
              <span className="card-emoji">📚</span>
              <h3>Каталог оголошень</h3>
              <p>
                Маркетплейс уже працює на головній сторінці та має окремий
                каталог із фільтрами.
              </p>
            </article>

            <article className="info-card">
              <span className="card-emoji">💬</span>
              <h3>Підготовка до реального спілкування</h3>
              <p>
                Схема бази вже містить сутності для діалогів, повідомлень та
                подальшого Socket.IO.
              </p>
            </article>

            <article className="info-card">
              <span className="card-emoji">🛡️</span>
              <h3>Модерація та довіра</h3>
              <p>
                Проєкт одразу розвивається як контрольована система з рейтингом
                та скаргами.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
