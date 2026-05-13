export default function ConfirmationDialog({ 
  isOpen, 
  title, 
  message, 
  confirmText = '✓ Xác Nhận',
  cancelText = '✕ Hủy',
  isDangerous = false,
  loading = false,
  onConfirm, 
  onCancel 
}) {
  if (!isOpen) return null;

  const bgColor = isDangerous ? 'bg-red-50' : 'bg-blue-50';
  const borderColor = isDangerous ? 'border-red-200' : 'border-blue-200';
  const titleColor = isDangerous ? 'text-red-700' : 'text-blue-700';
  const buttonColor = isDangerous ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
        {/* Header */}
        <div className={`${bgColor} ${borderColor} border rounded p-3 mb-4`}>
          <h2 className={`font-bold text-lg ${titleColor}`}>{title}</h2>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${buttonColor}`}
          >
            {loading ? '⏳ Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
