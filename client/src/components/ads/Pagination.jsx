function getPageItems(currentPage, totalPages) {
  const items = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let page = start; page <= end; page += 1) {
    items.push(page);
  }

  return items;
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPageItems(page, totalPages);

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination-button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Назад
      </button>

      {pages.map((item) => (
        <button
          key={item}
          type="button"
          className={`pagination-button ${item === page ? "active" : ""}`}
          onClick={() => onPageChange(item)}
        >
          {item}
        </button>
      ))}

      <button
        type="button"
        className="pagination-button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Далі
      </button>
    </div>
  );
}

export default Pagination;
