import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-light text-slate-900 tracking-tight mb-2">
              404
            </h1>
            <div className="h-1 w-16 bg-slate-300 mx-auto rounded-full"></div>
          </div>

          <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-4 tracking-tight">
            Page Not Found
          </h2>
          <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
            The page you're looking for doesn't exist or may have been moved. 
            Let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center justify-center gap-3 px-8 py-3.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 active:scale-95"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="group flex items-center justify-center gap-3 px-8 py-3.5 bg-slate-900 rounded-lg text-white font-medium hover:bg-slate-800 transition-all duration-200 active:scale-95 shadow-sm"
          >
            <Home size={18} />
            Return Home
          </button>
        </div>
      </div>

      <div className="fixed top-0 right-0 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-20 -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-20 -z-10 pointer-events-none"></div>
    </div>
  );
};

export default NotFoundPage;