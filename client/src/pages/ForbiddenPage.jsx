import { Link } from "react-router-dom";

function ForbiddenPage() {
  return (
    <div className="page">
      <div className="container narrow-container">
        <div className="state-card">
          <div className="state-icon">⛔</div>
          <h1>Доступ заборонено</h1>
          <p>У Вас немає прав для перегляду цієї сторінки.</p>
          <Link to="/" className="button">
            Повернутися на головну
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForbiddenPage;
