export default function Modal({
  isOpen,
  onClose,
  children,
  onSubmitHandler,
  title,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
        >
          &times;
        </button>
        <h2 className="font-bold text-xl text-center mb-4 font-muktaVaani border-b-[1px] pb-2">
          {title}
        </h2>
        <div className="mb-6">{children}</div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onSubmitHandler}
            className="bg-green-600 text-white px-5 py-2 rounded-md font-muktaVaani hover:bg-green-700 transition duration-200"
          >
            Pay Now
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-5 py-2 font-muktaVaani rounded-md hover:bg-red-600 transition duration-200"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
