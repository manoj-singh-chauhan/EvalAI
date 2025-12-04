const Loader = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[300px]">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>

      <p className="mt-3 text-gray-500 text-sm font-medium animate-pulse">
        {text}
      </p>
    </div>
  );
};

export default Loader;
