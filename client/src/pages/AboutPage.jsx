import { Link } from "react-router-dom";
import Seo from "../components/common/Seo";

function AboutPage() {
  return (
    <div className="page">
      <Seo
        title="Про сервіс"
        description="PetUA — спеціалізована платформа для пошуку, вибору, розміщення оголошень, спілкування та модерації у сфері домашніх тварин."
        path="/about"
      />

      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="hero-kicker">
              Спеціалізований сервіс для домашніх тварин
            </span>

            <h1>
              PetUA допомагає
              <span className="accent-text">
                {" "}
                знайти тварину та безпечно зв’язатися з продавцем
              </span>
            </h1>

            <p className="hero-text">
              PetUA — це платформа для оголошень про домашніх тварин, де
              інформація подається структуровано, пошук працює за важливими
              параметрами, а користувачі можуть спілкуватися, зберігати обране,
              залишати відгуки та подавати скарги.
            </p>

            <div className="hero-actions">
              <Link to="/ads" className="button">
                Перейти до каталогу
              </Link>

              <Link to="/rules" className="button button-secondary">
                Правила сервісу
              </Link>
            </div>

            <div className="hero-status-row">
              <span className="status-pill">
                Пошук за видом, породою та містом
              </span>
              <span className="status-pill">Внутрішній чат</span>
              <span className="status-pill">Відгуки та рейтинг</span>
            </div>
          </div>

          <div className="hero-card about-hero-card">
            <div className="hero-card-top">
              <span className="hero-card-icon">🐾</span>
              <span className="hero-card-label">Що робить PetUA зручним</span>
            </div>

            <div className="feature-list">
              <div className="feature-item">
                <h3>Структуровані оголошення</h3>
                <p>
                  Кожне оголошення містить вид тварини, породу, стать, вік,
                  ціну, місто, стан здоров’я, щеплення, документи та фото.
                </p>
              </div>

              <div className="feature-item">
                <h3>Швидкий вибір</h3>
                <p>
                  Користувач може фільтрувати оголошення за типом, видом,
                  породою, ціною, містом, статтю та віком.
                </p>
              </div>

              <div className="feature-item">
                <h3>Довіра до продавців</h3>
                <p>
                  Рейтинг, відгуки, сторінка продавця та скарги допомагають
                  краще оцінити пропозицію перед спілкуванням.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="container">
          <div className="section-head">
            <h2>Для кого створено PetUA</h2>
            <p>
              Сервіс підходить людям, які шукають домашню тварину, власникам,
              заводчикам, волонтерам і користувачам, які хочуть розмістити
              оголошення у зрозумілому форматі.
            </p>
          </div>

          <div className="cards-grid">
            <article className="info-card">
              <span className="card-emoji">🐶</span>
              <h3>Для покупців</h3>
              <p>
                Каталог допомагає швидко порівняти оголошення, переглянути фото,
                характеристики тварини, рейтинг продавця та відгуки.
              </p>
            </article>

            <article className="info-card">
              <span className="card-emoji">🏡</span>
              <h3>Для власників тварин</h3>
              <p>
                Користувач може створити оголошення, додати фото, описати умови
                утримання, документи, щеплення та контактні дані.
              </p>
            </article>

            <article className="info-card">
              <span className="card-emoji">💬</span>
              <h3>Для спілкування</h3>
              <p>
                Внутрішні повідомлення дозволяють покупцю і продавцю уточнити
                деталі без переходу в сторонні месенджери.
              </p>
            </article>

            <article className="info-card">
              <span className="card-emoji">🛡️</span>
              <h3>Для безпеки</h3>
              <p>
                Скарги, модерація, ролі користувачів і приховування проблемних
                оголошень допомагають підтримувати порядок на платформі.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-process-section">
        <div className="container">
          <div className="section-head">
            <h2>Як працює сервіс</h2>
            <p>
              PetUA побудовано так, щоб користувач міг пройти шлях від пошуку
              тварини до спілкування з продавцем без зайвих кроків.
            </p>
          </div>

          <div className="process-grid">
            <article>
              <span>1</span>
              <h3>Пошук оголошення</h3>
              <p>
                Користувач відкриває каталог, вводить запит або використовує
                фільтри за видом тварини, породою, ціною, містом, статтю та
                віком.
              </p>
            </article>

            <article>
              <span>2</span>
              <h3>Перегляд деталей</h3>
              <p>
                На сторінці оголошення видно фото, опис, характеристики, стан
                здоров’я, щеплення, документи та умови утримання.
              </p>
            </article>

            <article>
              <span>3</span>
              <h3>Перевірка продавця</h3>
              <p>
                Перед зверненням можна переглянути сторінку продавця, рейтинг,
                кількість відгуків та інші активні оголошення.
              </p>
            </article>

            <article>
              <span>4</span>
              <h3>Комунікація</h3>
              <p>
                Покупець може написати продавцю через внутрішній чат і уточнити
                всі важливі деталі.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-values-section">
        <div className="container about-values-grid">
          <div>
            <span className="hero-kicker">Принципи PetUA</span>
            <h2>
              Ми робимо акцент на зрозумілості, безпеці та відповідальному
              виборі
            </h2>
            <p>
              Платформа не замінює особисту перевірку продавця або ветеринарну
              консультацію, але допомагає краще структурувати інформацію та
              зменшити хаос у процесі пошуку домашньої тварини.
            </p>
          </div>

          <div className="values-list">
            <article>
              <strong>Прозорість</strong>
              <span>Кожне оголошення має зрозумілі поля та статус.</span>
            </article>

            <article>
              <strong>Контроль</strong>
              <span>
                Користувачі можуть подавати скарги, а модератори — реагувати.
              </span>
            </article>

            <article>
              <strong>Зручність</strong>
              <span>
                Каталог, обране, чат і профіль зібрані в одній системі.
              </span>
            </article>

            <article>
              <strong>Адаптивність</strong>
              <span>Інтерфейс працює на комп’ютері, планшеті та телефоні.</span>
            </article>
          </div>
        </div>
      </section>

      <section className="about-cta-section">
        <div className="container">
          <div className="about-cta-card">
            <div>
              <h2>Готові знайти домашнього улюбленця?</h2>
              <p>
                Перейдіть до каталогу, скористайтеся фільтрами та збережіть
                цікаві оголошення в обране.
              </p>
            </div>

            <Link to="/ads" className="button">
              Відкрити каталог
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
