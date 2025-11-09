const PublicSetsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-medium p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Danh sách bộ đề public</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder items; hook to API later */}
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="font-bold text-lg text-gray-900 mb-2">Bộ đề mẫu {i}</div>
                <div className="text-sm text-gray-600 mb-4">
                  Tạo bởi: user{i} • {10 + i} câu • {i} lượt đánh giá
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                    Xem
                  </button>
                  <button className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    Làm thử
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicSetsPage;
