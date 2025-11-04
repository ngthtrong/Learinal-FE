import React from "react";
import "./PublicSetsPage.css";

const PublicSetsPage = () => {
  return (
    <div className="public-root">
      <main className="public-main">
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Danh sách bộ đề public</h3>
          <div className="sets-grid">
            {/* Placeholder items; hook to API later */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="set-card card">
                <div style={{ fontWeight: 700 }}>Bộ đề mẫu {i}</div>
                <div className="muted">
                  Tạo bởi: user{i} • {10 + i} câu • {i} lượt đánh giá
                </div>
                <div className="set-actions">
                  <button className="btn ghost">Xem</button>
                  <button className="btn primary">Làm thử</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicSetsPage;
