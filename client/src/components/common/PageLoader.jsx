function PageLoader({ text = "Завантаження..." }) {
  return (
    <div className="page-loader">
      <div className="loader-paw">🐾</div>
      <p>{text}</p>
    </div>
  );
}

export default PageLoader;
