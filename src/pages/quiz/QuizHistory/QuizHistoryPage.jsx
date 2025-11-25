/**
 * Quiz History Page
 * Display user's quiz attempt history
 */

function QuizHistoryPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg px-6 py-6 mb-6">
          <h1 className="text-4xl font-bold text-gray-900">📊 Lịch sử làm bài</h1>
          <p className="text-lg text-gray-600 mt-2">Xem lại các bài thi đã hoàn thành</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <p className="text-gray-500 text-lg">Chức năng đang được phát triển...</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-sm">© 2025 Learinal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default QuizHistoryPage;
