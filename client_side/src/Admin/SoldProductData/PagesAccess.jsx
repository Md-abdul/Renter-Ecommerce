// import React, { useEffect, useState } from "react";
// import { getDocs, collection, doc, updateDoc } from "firebase/firestore";
// import { db } from "../firebase"; // Adjust path as needed

// const PagesAccess = () => {
//   const [pages, setPages] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Define all available routes with their default visibility
//   const availableRoutes = [
//     { path: "/", name: "Home Page", enabled: true },
//     { path: "/mens", name: "Men's Products", enabled: true },
//     { path: "/womens", name: "Women's Products", enabled: true },
//     { path: "/kids", name: "Kids Products", enabled: true },
//     { path: "/storelocator", name: "Store Locator", enabled: true },
//     { path: "/product/:_id", name: "Single Product", enabled: true },
//     { path: "/productCart", name: "Shopping Cart", enabled: true },
//     { path: "/checkout", name: "Checkout", enabled: true },
//     { path: "/login", name: "Login", enabled: true },
//     { path: "/signup", name: "Signup", enabled: true },
//     { path: "/aboutpage", name: "About Us", enabled: true },
//     { path: "/contactpage", name: "Contact Us", enabled: true },
//     { path: "/order", name: "User Orders", enabled: true },
//     { path: "/forgot_password", name: "Forgot Password", enabled: true },
//     { path: "/term-of-uses", name: "Terms of Use", enabled: true },
//     { path: "/term-of-return", name: "Return Policy", enabled: true },
//     { path: "/term-of-privacy", name: "Privacy Policy", enabled: true },
//   ];

//   useEffect(() => {
//     const fetchPageSettings = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "pageSettings"));
//         if (!querySnapshot.empty) {
//           const settings = querySnapshot.docs[0].data();
//           setPages(settings.pages || availableRoutes);
//         } else {
//           setPages(availableRoutes);
//         }
//       } catch (error) {
//         console.error("Error fetching page settings:", error);
//         setPages(availableRoutes);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPageSettings();
//   }, []);

//   const handleToggle = async (index) => {
//     const updatedPages = [...pages];
//     updatedPages[index].enabled = !updatedPages[index].enabled;
//     setPages(updatedPages);

//     try {
//       // Update in Firestore (assuming you have a document for settings)
//       const settingsRef = doc(db, "pageSettings", "mainSettings");
//       await updateDoc(settingsRef, { pages: updatedPages });
//     } catch (error) {
//       console.error("Error updating page settings:", error);
//       // Revert if update fails
//       setPages([...pages]);
//     }
//   };

//   if (loading) {
//     return <div>Loading page settings...</div>;
//   }

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-6">Page Access Control</h1>
//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Page Name
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Path
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Action
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {pages.map((page, index) => (
//               <tr key={index}>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                   {page.name}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   {page.path}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   <span
//                     className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                       page.enabled
//                         ? "bg-green-100 text-green-800"
//                         : "bg-red-100 text-red-800"
//                     }`}
//                   >
//                     {page.enabled ? "Enabled" : "Disabled"}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                   <button
//                     onClick={() => handleToggle(index)}
//                     className={`px-3 py-1 rounded-md text-sm font-medium ${
//                       page.enabled
//                         ? "bg-red-100 text-red-700 hover:bg-red-200"
//                         : "bg-green-100 text-green-700 hover:bg-green-200"
//                     }`}
//                   >
//                     {page.enabled ? "Disable" : "Enable"}
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default PagesAccess;
