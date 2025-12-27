import { ArrowRight } from "lucide-react";

const NotFoundPage = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-end p-4 bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/404-page-not-found.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/40 to-transparent"></div>
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 pb-12">
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleGoHome}
            className="px-8 py-3 bg-gray-900 text-white font-medium rounded hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            Go to Homepage
            <ArrowRight size={18} />
          </button>
          
          <button
            onClick={handleGoBack}
            className="px-8 py-3 border-2 border-gray-400 text-gray-900 font-medium rounded hover:bg-white transition-all duration-200 bg-white/90 shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;