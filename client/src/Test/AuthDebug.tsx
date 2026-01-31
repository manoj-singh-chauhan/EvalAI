import { useUser, useAuth } from "@clerk/clerk-react";

export default function AuthDebug() {
  const { user } = useUser();
  const { isSignedIn, getToken } = useAuth();

  return (
    <div className="p-4 bg-gray-100 rounded">
      <p>Signed In: {isSignedIn ? "YES" : "NO"}</p>
      <p>User ID: {user?.id || "null"}</p>

      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={async () => {
          const token = await getToken();
          console.log("TOKEN =", token);
          alert("Token printed in console.");
        }}
      >
        Show Token
      </button>
    </div>
  );
}
