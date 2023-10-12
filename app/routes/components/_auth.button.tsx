export default function AuthButton({ label, isSubmitting }) {
  return (
    <div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
      >
        {isSubmitting ? "로딩 중" : label}
      </button>
    </div>
  );
}
