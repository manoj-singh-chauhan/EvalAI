// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";

// export default function AdminUserActivityPage() {
//   const { userId } = useParams();
//   const [data, setData] = useState<any>(null);

//   useEffect(() => {
//     fetch(`http://localhost:5000/api/admin/test/users/${userId}/activity`)
//       .then(res => res.json())
//       .then(setData);
//   }, [userId]);

//   if (!data) return <p>Loading...</p>;

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>User Activity</h2>

//       <h3>Question Papers</h3>
//       {data.questionPapers.length === 0 && <p>No papers</p>}
//       {data.questionPapers.map((p: any) => (
//         <div key={p.id}>
//           <p>Paper ID: {p.id}</p>
//           <p>Status: {p.status}</p>
//         </div>
//       ))}

//       <h3>Answer Sheets</h3>
//       {data.answerSheets.length === 0 && <p>No answers</p>}
//       {data.answerSheets.map((a: any) => (
//         <div key={a.id}>
//           <p>Answer ID: {a.id}</p>
//           <p>Status: {a.status}</p>
//         </div>
//       ))}
//     </div>
//   );
// }
