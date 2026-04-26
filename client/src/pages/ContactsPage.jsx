import Seo from "../components/common/Seo";

function ContactsPage() {
  return (
    <div className="page">
      <Seo
        title="Контакти"
        description="Контактна сторінка платформи PetUA для користувачів, продавців та модераторів."
        path="/contacts"
      />

      <div className="container narrow-container">
        <section className="static-page-card">
          <span className="hero-kicker">Зв’язок</span>
          <h1>Контакти</h1>
          <p>
            Ця сторінка демонструє контактний розділ дипломного веб-додатку. У
            реальному запуску тут можуть бути офіційні контакти служби
            підтримки.
          </p>

          <div className="contact-grid">
            <article>
              <strong>Email підтримки</strong>
              <span>support@petua.local</span>
            </article>

            <article>
              <strong>Питання щодо модерації</strong>
              <span>moderation@petua.local</span>
            </article>

            <article>
              <strong>Графік обробки звернень</strong>
              <span>Пн–Пт, 09:00–18:00</span>
            </article>

            <article>
              <strong>Місцезнаходження</strong>
              <span>Україна</span>
            </article>
          </div>

          <div className="static-content">
            <h2>Як звернутися</h2>
            <p>
              Для питань щодо оголошень, скарг або роботи акаунта користувач
              може скористатися внутрішніми інструментами платформи: профілем,
              повідомленнями, скаргами або модерацією.
            </p>

            <h2>Безпека</h2>
            <p>
              PetUA не вимагає точної геолокації та не зберігає платіжні дані.
              Місцезнаходження тварини вказується у вигляді міста та області.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ContactsPage;
