// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export default function AdminUsersPage() {
//   const [users, setUsers] = useState<any[]>([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetch("http://localhost:5000/api/admin/test/users")
//       .then(res => res.json())
//       .then(data => setUsers(data.users));
//   }, []);

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Admin – All Users</h2>

//       {users.map(user => (
//         <div
//           key={user.id}
//           style={{
//             border: "1px solid #ccc",
//             padding: 10,
//             marginBottom: 10,
//           }}
//         >
//           <p><b>Name:</b> {user.firstName} {user.lastName}</p>
//           <p><b>Email:</b> {user.emailAddresses[0]?.emailAddress}</p>

//           <button
//             onClick={() => navigate(`/admin/users/${user.id}`)}
//           >
//             View Activity
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// }
