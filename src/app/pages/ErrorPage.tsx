import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { Home, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function ErrorPage() {
  const error = useRouteError();
  let errorMessage: string;
  let errorStatus: number | undefined;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || error.data?.message || 'Oops! Page not found.';
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    console.error(error);
    errorMessage = 'An unexpected error occurred.';
  }

  const is404 = errorStatus === 404 || errorMessage.toLowerCase().includes('not found');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-6xl font-black text-[#5B6F1E] mb-4">
          {errorStatus || (is404 ? '404' : 'Oops!')}
        </h1>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {is404 ? 'Page Not Found' : 'Something went wrong'}
        </h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {is404 
            ? "We couldn't find the page you're looking for. It might have been moved or deleted, or the link you followed might be incorrect." 
            : errorMessage}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-[#6B8E23] text-white px-6 py-3 rounded-full font-bold hover:bg-[#5B7A1E] transition transform hover:scale-105 active:scale-95 shadow-lg"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-200 px-6 py-3 rounded-full font-bold hover:bg-gray-50 transition transform hover:scale-105 active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        <div className="mt-12 text-sm text-gray-400">
          © 2026 Eco-Friendly Living. All rights reserved.
        </div>
      </div>
    </div>
  );
}
