/**
 * Profile Edit Page
 * Edit user profile information
 */

function ProfileEditPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg px-6 py-6 mb-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">✏️ Chỉnh sửa hồ sơ</h1>
            <p className="text-lg text-gray-600">Cập nhật thông tin cá nhân của bạn</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Tính năng đang được phát triển
            </h2>
            <p className="text-gray-600">Chức năng chỉnh sửa hồ sơ sẽ sớm được cập nhật</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 text-sm">© 2025 Learinal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default ProfileEditPage;
