import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Home, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  let title = "Oops! Something went wrong";
  let message = "We're sorry, but an unexpected error has occurred. Our team has been notified.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "404 - Page Not Found";
      message = "The page you're looking for doesn't exist or has been moved to a new location.";
    } else if (error.status === 401) {
      title = "401 - Unauthorized";
      message = "You don't have permission to access this page. Please sign in.";
    } else if (error.status === 503) {
      title = "503 - Service Unavailable";
      message = "Looks like our servers are having a momentary lapse. Please try again in a few minutes.";
    }
  }

  return (
    <div className="min-h-screen bg-[#f8faf5] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-[#5B6F1E] mb-4">
          {title}
        </h1>
        
        <p className="text-gray-600 mb-8 text-lg">
          {message}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-[#6B8E23] text-[#6B8E23] rounded-full font-bold hover:bg-[#6B8E23] hover:text-white transition group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
          
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#6B8E23] text-white rounded-full font-bold hover:bg-[#5B6F1E] transition shadow-lg shadow-green-900/20"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
        
        <div className="mt-12">
          <p className="text-sm text-gray-400">
            If you believe this is a bug, please <Link to="/contact" className="text-[#6B8E23] hover:underline">contact support</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
