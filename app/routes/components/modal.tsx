import React from "react";

function Modal({ onClose, actionUrl }) {
  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        <div className="fixed inset-0 bg-gray-500 opacity-75"></div>

        <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all sm:w-96">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 flex flex-col justify-center items-center">
            <h3
              className="text-lg leading-6 font-normal text-gray-900"
              id="modal-title"
            >
              로그아웃 하시겠습니까? :(
            </h3>
          </div>
          <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              type="button"
              className="w-full h-12 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-1/2 sm:text-center sm:ml-3"
            >
              아니요
            </button>
            <form method="post" action={actionUrl} className="sm:w-1/2">
              <button
                type="submit"
                className="w-full h-12 py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 text-center"
              >
                예
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
