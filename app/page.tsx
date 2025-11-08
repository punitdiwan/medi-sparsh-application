// import React from 'react'
// import Link from 'next/link';
// function page() {
//   return (
//     <div>
//       <div>
//         login
//       </div>

//     </div>
//   )
// }

// this is for only frontend 
import { redirect } from "next/navigation";

export default function page() {
  redirect("/sign-in");
}