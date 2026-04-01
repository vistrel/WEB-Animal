import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="page">
      <div className="container narrow-container">
        <div className="state-card">
          <div className="state-icon">🐾</div>
          <h1>Сторінку не знайдено</h1>
          <p>Можливо, посилання застаріло або сторінку було переміщено.</p>
          <Link to="/" className="button">
            На головну
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
