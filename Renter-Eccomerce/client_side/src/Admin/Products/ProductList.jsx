// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Search,
//   ChevronUp,
//   ChevronDown,
//   Heart,
//   ShoppingCart,
//   Star,
// } from "lucide-react";
// import { useCart } from "../../context/CartContext";
// import { useProduct } from "../../context/ProductContext";
// const ProductList = () => {
//   const [products, setProducts] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentProduct, setCurrentProduct] = useState(null);
//   const [uploadModalOpen, setUploadModalOpen] = useState(false);
//   const [excelFile, setExcelFile] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [productToDelete, setProductToDelete] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

// const ProductList = ({ category }) => {
//   const {
//     filteredProducts,
//     loading,
//     error,
//     searchQuery,
//     setSearchQuery,
//     sortOrder,
//     setSortOrder,
//   } = useProduct();
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(12);
//   const [isSearchExpanded, setIsSearchExpanded] = useState(false);
//   const navigate = useNavigate();
//   const { addToCart } = useCart();

//   // Pagination Logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentProducts = filteredProducts(category).slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setIsLoading(true);
//         const response = await fetch("http://localhost:5000/api/products");
//         const data = await response.json();
//         setProducts(data);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchProducts();
//   }, []);

//   const confirmDelete = (product) => {
//     setProductToDelete(product);
//     setShowDeleteModal(true);
//   };

//   const handleDeleteConfirmed = async () => {
//     if (!productToDelete) return;

//     try {
//       const response = await fetch(
//         `http://localhost:5000/api/products/${productToDelete._id}`,
//         { method: "DELETE" }
//       );
//       if (response.ok) {
//         setProducts(products.filter((p) => p._id !== productToDelete._id));
//         setShowDeleteModal(false);
//         setProductToDelete(null);
//       }
//     } catch (error) {
//       console.error("Error deleting product:", error);
//     }

//   const totalPages = Math.ceil(
//     filteredProducts(category).length / itemsPerPage
//   );

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleProductClick = (productId) => {
//     navigate(`/product/${productId}`);
//   };

//   const handleAddToCart = (e, product) => {
//     e.stopPropagation();
//     const defaultColor = product.colors[0]?.name;
//     const defaultSize = product.sizes[0]?.size;
//     addToCart(product, 1, defaultColor, defaultSize);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-red-500 text-lg font-light">{error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
//       <div className="flex justify-between items-center mb-8">
//         <h2 className="text-3xl font-bold text-gray-900">Product Management</h2>
//         <div className="flex space-x-4">
//           <button
//             onClick={() => {
//               setCurrentProduct(null);
//               setIsModalOpen(true);
//             }}
//             className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md cursor-pointer"
//           >
//             <span className="flex items-center">
//               <svg
//                 className="w-5 h-5 mr-2"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 6v6m0 0v6m0-6h6m-6 0H6"
//                 />
//               </svg>
//               Add Product
//             </span>
//           </button>
//           <button
//             onClick={toggleUploadModal}
//             className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md cursor-pointer"
//           >
//             <span className="flex items-center">
//               <svg
//                 className="w-5 h-5 mr-2"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//                 xmlns="http://www.w3.org/2000/svg"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                 />
//               </svg>
//               Upload Excel
//             </span>
//     <div className="container mx-auto px-6 py-12 max-w-7xl">
//       {/* Premium Header Section */}
//       <div className="mb-12 text-center">
//         <h1 className="text-4xl font-light text-gray-900 mb-2 tracking-wide">
//           {category ? `${category} Collection` : "Luxury Collection"}
//         </h1>
//         <p className="text-gray-500 font-light max-w-2xl mx-auto">
//           Discover our curated selection of premium products crafted with
//           exceptional quality
//         </p>
//       </div>

//       {/* Premium Search and Sort Section */}
//       <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
//         <div className="relative w-full md:w-auto">
//           <div
//             className={`relative transition-all duration-500 ease-in-out ${
//               isSearchExpanded ? "w-full md:w-96" : "w-12"
//             }`}
//           >
//             <input
//               type="text"
//               placeholder="Search our collection..."
//               className={`w-full pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 shadow-sm transition-all duration-300 ${
//                 isSearchExpanded ? "opacity-100" : "absolute opacity-0"
//               }`}
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//             <button
//               onClick={() => setIsSearchExpanded(!isSearchExpanded)}
//               className={`absolute left-0 top-0 p-3 rounded-full ${
//                 isSearchExpanded
//                   ? "text-gold-500"
//                   : "bg-white text-gray-500 hover:text-gold-500"
//               } transition-all duration-300`}
//             >
//               <Search size={20} />
//             </button>
//           </div>
//         </div>

//         <div className="flex items-center gap-4">
//           <span className="text-sm text-gray-500 font-light uppercase tracking-wider">
//             Sort By:
//           </span>
//           <button
//             onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
//             className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-full hover:border-gold-500 hover:text-gold-500 transition-all duration-300"
//           >
//             {sortOrder === "asc" ? (
//               <>
//                 <ChevronUp size={18} />
//                 <span className="text-sm font-light">Price (Low to High)</span>
//               </>
//             ) : (
//               <>
//                 <ChevronDown size={18} />
//                 <span className="text-sm font-light">Price (High to Low)</span>
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//       {isLoading ? (
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-900">
//                 <tr>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
//                     Product
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
//                     Price
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
//                     Category
//                   </th>
//                   <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {products.map((product) => (
//                   <tr
//                     key={product._id}
//                     className="hover:bg-gray-50 transition-colors duration-150"
//                   >
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div className="flex-shrink-0 h-12 w-12 rounded-lg overflow-hidden border border-gray-200">
//                           {product.colors?.[0]?.images?.[0]?.imageUrl && (
//                             <img
//                               className="h-full w-full object-cover"
//                               src={product.colors[0].images[0].imageUrl}
//                               alt={product.title}
//                             />
//                           )}
//                         </div>
//                         <div className="ml-4">
//                           <div className="text-sm font-semibold text-gray-900">
//                             {product.title}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {product.summary?.substring(0, 40)}...
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm font-semibold text-gray-900">
//                         ${product.price}
//                       </div>
//                       {product.offerPrice && (
//                         <div className="text-xs text-gray-500 line-through">
//                           ${product.offerPrice}
//                         </div>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 capitalize">
//                         {product.category}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() => {
//                             setCurrentProduct(product);
//                             setIsModalOpen(true);
//                           }}
//                           className="text-yellow-600 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100 px-3 py-1 rounded-md transition-colors duration-200 flex items-center cursor-pointer"
//                         >
//                           <svg
//                             className="w-4 h-4 mr-1"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                             xmlns="http://www.w3.org/2000/svg"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//                             />
//                           </svg>
//                           Edit
//                         </button>
//                         <button
//                           onClick={() => confirmDelete(product)}
//                           className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200 flex items-center cursor-pointer"
//                         >
//                           <svg
//                             className="w-4 h-4 mr-1"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                             xmlns="http://www.w3.org/2000/svg"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth={2}
//                               d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                             />
//                           </svg>
//                           Delete
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           {products.length === 0 && !isLoading && (
//             <div className="text-center py-12">
//               <svg
//                 className="mx-auto h-12 w-12 text-gray-400"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
//                 />
//               </svg>
//               <h3 className="mt-2 text-lg font-medium text-gray-900">
//                 No products
//               </h3>
//               <p className="mt-1 text-sm text-gray-500">
//                 Get started by adding a new product.
//               </p>
//               <div className="mt-6">
//                 <button
//                   onClick={() => {
//                     setCurrentProduct(null);
//                     setIsModalOpen(true);
//                   }}
//                   className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
//                 >
//                   <svg
//                     className="-ml-1 mr-2 h-5 w-5"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 6v6m0 0v6m0-6h6m-6 0H6"
//                     />
//                   </svg>
//                   New Product
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Add/Edit Product Modal */}
//       {/* {isModalOpen && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//             <div
//               className="fixed inset-0 transition-opacity"
//               aria-hidden="true"
//             >
//               <div
//                 className="absolute inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
//                 onClick={toggleModal}
//               ></div>
//             </div>

//             <span
//               className="hidden sm:inline-block sm:align-middle sm:h-screen"
//               aria-hidden="true"
//             >
//               &#8203;
//             </span>

//             <div
//               className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-10 sm:align-middle sm:max-w-4xl sm:w-full"
//             >
//               <div className="bg-white px-6 pt-6 pb-4">
//                 <div className="flex items-start justify-between">
//                   <h3 className="text-2xl font-bold text-gray-900">
//                     {currentProduct ? "Edit Product" : "Add New Product"}
//                   </h3>
//                   <button
//                     onClick={toggleModal}
//                     className="ml-4 bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors duration-200"
//                   >
//                     <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>

//               <div className="px-6 pb-6">
//                 <ProductForm
//                   product={currentProduct}
//                   setProducts={setProducts}
//                   products={products}
//                   onClose={toggleModal}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       )} */}

//       {/* Upload Excel Modal */}
//       {/* {uploadModalOpen && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//             <div
//               className="fixed inset-0 transition-opacity"
//               aria-hidden="true"
//             >
//               <div
//                 className="absolute inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
//                 onClick={toggleUploadModal}
//               ></div>
//             </div>
//             <span
//               className="hidden sm:inline-block sm:align-middle sm:h-screen"
//               aria-hidden="true"
//             >
//               &#8203;
//             </span>
//             <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//               <div className="bg-white px-6 pt-6 pb-4">
//                 <div className="flex items-start justify-between">
//                   <h3 className="text-xl font-bold text-gray-900">
//                     Upload Products from Excel
//                   </h3>
//                   <button
//                     onClick={toggleUploadModal}
//                     className="ml-4 bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors duration-200"
//                   >
//                     <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
              
//               <div className="px-6 pb-6 space-y-6">
//                 <div>
//                   <label
//                     htmlFor="excelFile"
//                     className="block text-sm font-medium text-gray-700 mb-2"
//                   >
//                     Select Excel File
//                   </label>
//                   <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
//                     <div className="space-y-1 text-center">
//                       <svg
//                         className="mx-auto h-12 w-12 text-gray-400"
//                         stroke="currentColor"
//                         fill="none"
//                         viewBox="0 0 48 48"
//                         aria-hidden="true"
//                       >
//                         <path
//                           d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
//                           strokeWidth={2}
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         />
//                       </svg>
//                       <div className="flex text-sm text-gray-600">
//                         <label
//                           htmlFor="excelFile"
//                           className="relative cursor-pointer bg-white rounded-md font-medium text-yellow-500 hover:text-yellow-600 focus-within:outline-none"
//                         >
//                           <span>Upload a file</span>
//                           <input
//                             id="excelFile"
//                             name="excelFile"
//                             type="file"
//                             accept=".xlsx,.xls"
//                             onChange={handleFileChange}
//                             className="sr-only"
//                           />
//                         </label>
//                         <p className="pl-1">or drag and drop</p>
//                       </div>
//                       <p className="text-xs text-gray-500">
//                         XLSX or XLS up to 10MB
//                       </p>
//                     </div>
//                   </div>
//                   {excelFile && (
//                     <p className="mt-2 text-sm text-gray-600">
//                       Selected file: {excelFile.name}
//                     </p>
//                   )}
//                 </div>

//                 <div className="mt-6 text-sm text-gray-600">
//                   <p className="mb-2 font-medium">
//                     Download the template file to ensure correct format:
//                   </p>
//                   <a
//                     href="/product_template.xlsx"
//                     download="product_template.xlsx"
//                     className="inline-flex items-center text-yellow-600 hover:text-yellow-700 hover:underline"
//                   >
//                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                     </svg>
//                     Download Excel Template
//                   </a>
//                 </div>
//               </div>

//               <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
//                 <button
//                   type="button"
//                   className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
//                   onClick={toggleUploadModal}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleExcelUpload}
//                   disabled={!excelFile}
//                   className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-200 ${excelFile ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-yellow-300 cursor-not-allowed'}`}
//                 >
//                   Upload Products
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )} */}

//       {/* Delete Confirmation Modal */}
//       {/* {showDeleteModal && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//             <div
//               className="fixed inset-0 transition-opacity"
//               aria-hidden="true"
//             >
//               <div
//                 className="absolute inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
//                 onClick={() => setShowDeleteModal(false)}
//               ></div>
//             </div>
//             <span
//               className="hidden sm:inline-block sm:align-middle sm:h-screen"
//               aria-hidden="true"
//             >
//               &#8203;
//             </span>
//             <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//               <div className="bg-white px-6 pt-6 pb-4">
//                 <div className="sm:flex sm:items-start">
//                   <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
//                     <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                     </svg>
//                   </div>
//                   <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
//                     <h3 className="text-lg leading-6 font-medium text-gray-900">
//                       Delete Product
//                     </h3>
//                     <div className="mt-2">
//                       <p className="text-sm text-gray-500">
//                         Are you sure you want to delete <span className="font-semibold">{productToDelete?.title}</span>? This action cannot be undone.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
//                 <button
//                   type="button"
//                   className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
//                   onClick={() => {
//                     setShowDeleteModal(false);
//                     setProductToDelete(null);
//                   }}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
//                   onClick={handleDeleteConfirmed}
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )} */}

//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//             <div
//               className="fixed inset-0 transition-opacity"
//               aria-hidden="true"
//             >
//               <div
//                 className="absolute inset-0 bg-gray-500 opacity-75"
//                 onClick={toggleModal}
//               ></div>
//             </div>

//             <span
//               className="hidden sm:inline-block sm:align-middle sm:h-screen"
//               aria-hidden="true"
//             >
//               &#8203;
//             </span>

//             <div
//               className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-10 sm:align-middle sm:max-w-xl sm:w-full"
//               style={{ height: "40rem" }}
//             >
//               <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//                 <div className="sm:flex sm:items-start">
//                   <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
//                     <div className="flex justify-between items-center mb-4">
//                       <h3 className="text-lg leading-6 font-medium text-gray-900">
//                         {currentProduct ? "Edit Product" : "Add Product"}
//                       </h3>
//                       <button
//                         onClick={toggleModal}
//                         className="text-gray-400 hover:text-gray-500"
//                       >
//                         <span className="sr-only">Close</span>
//                         <svg
//                           className="h-6 w-6"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth="2"
//                             d="M6 18L18 6M6 6l12 12"
//                           />
//                         </svg>
//                       </button>
//                     </div>

//                     <div>
//                       <ProductForm
//                         product={currentProduct}
//                         setProducts={setProducts}
//                         products={products}
//                         onClose={toggleModal}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
// =======
//       {/* Luxury Product Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//         {currentProducts.map((product) => (
//           <div
//             key={product._id}
//             onClick={() => handleProductClick(product._id)}
//             className="group relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-xl border border-gray-100 hover:border-gold-100"
//           >
//             {/* Product Image */}
//             <div className="relative w-full aspect-square overflow-hidden">
//               <img
//                 src={
//                   product.colors[0]?.images[0]?.imageUrl ||
//                   "https://via.placeholder.com/500"
//                 }
//                 alt={product.title}
//                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//               />

//               {/* Quick View Overlay */}
//               <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all duration-500 opacity-0 group-hover:opacity-100">
//                 <button className="bg-white text-gray-800 px-6 py-2 rounded-full font-light text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
//                   Quick View
//                 </button>
//               </div>

//               {/* Discount Badge */}
//               {product.discount > 0 && (
//                 <div className="absolute top-4 right-4 bg-gold-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
//                   {product.discount}% OFF
//                 </div>
//               )}

//               {/* Wishlist Button */}
//               <button
//                 className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-all duration-300"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <Heart
//                   size={20}
//                   className="text-gray-400 hover:text-red-500 transition-colors"
//                 />
//               </button>
//             </div>

//             {/* Product Details */}
//             <div className="p-5">
//               <h3 className="text-lg font-light text-gray-900 mb-2 tracking-wide">
//                 {product.title}
//               </h3>
//               <p className="text-gray-500 text-sm mb-4 line-clamp-2 font-light">
//                 {product.summary}
//               </p>

//               {/* Rating */}
//               <div className="flex items-center mb-4">
//                 <div className="flex">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       size={16}
//                       className={`${
//                         i < Math.floor(product.rating)
//                           ? "text-gold-500 fill-gold-500"
//                           : "text-gray-300"
//                       }`}
//                     />
//                   ))}
//                 </div>
//                 <span className="ml-2 text-xs text-gray-400 font-light">
//                   ({product.reviews} reviews)
//                 </span>
//               </div>

//               {/* Price and Add to Cart */}
//               <div className="flex items-center justify-between pt-4 border-t border-gray-100">
//                 <div>
//                   <span className="text-xl font-light text-gray-900">
//                     ₹{product.offerPrice || product.price}
//                   </span>
//                   {product.offerPrice && product.offerPrice < product.price && (
//                     <span className="ml-2 text-sm text-gray-400 line-through font-light">
//                       ₹{product.price}
//                     </span>
//                   )}
//                 </div>
//                 <button
//                   onClick={(e) => handleAddToCart(e, product)}
//                   className="bg-white border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white p-2 rounded-full transition-all duration-300"
//                 >
//                   <ShoppingCart size={18} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Luxury Pagination */}
//       {totalPages > 1 && (
//         <div className="flex justify-center mt-16">
//           <nav className="inline-flex rounded-full shadow-sm border border-gray-200 p-1">
//             {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//               <button
//                 key={page}
//                 onClick={() => handlePageChange(page)}
//                 className={`w-10 h-10 flex items-center justify-center text-sm font-light ${
//                   currentPage === page
//                     ? "bg-gold-500 text-white"
//                     : "text-gray-500 hover:bg-gray-50"
//                 } rounded-full mx-1 transition-all duration-300`}
//               >
//                 {page}
//               </button>
//             ))}
//           </nav>
//         </div>
//       )}
//       {/* Upload Excel Modal */}
//       {uploadModalOpen && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//             <div
//               className="fixed inset-0 transition-opacity"
//               aria-hidden="true"
//             >
//               <div
//                 className="absolute inset-0 bg-gray-500 opacity-75"
//                 onClick={toggleUploadModal}
//               ></div>
//             </div>
//             <span
//               className="hidden sm:inline-block sm:align-middle sm:h-screen"
//               aria-hidden="true"
//             >
//               &#8203;
//             </span>
//             <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//               <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//                 <div className="sm:flex sm:items-start">
//                   <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
//                     <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
//                       Upload Products from Excel
//                     </h3>
//                     <div className="space-y-4">
//                       <div>
//                         <label
//                           htmlFor="excelFile"
//                           className="block text-sm font-medium text-gray-700 mb-1"
//                         >
//                           Select Excel File
//                         </label>
//                         <input
//                           type="file"
//                           id="excelFile"
//                           accept=".xlsx,.xls"
//                           onChange={handleFileChange}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                       <div className="pt-4 flex justify-end space-x-3">
//                         <button
//                           type="button"
//                           className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
//                           onClick={toggleUploadModal}
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           type="button"
//                           onClick={handleExcelUpload}
//                           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         >
//                           Upload
//                         </button>
//                       </div>
//                       <div className="mt-4 text-sm text-gray-600">
//                         <p className="mb-2">
//                           Download the template file to ensure correct format:
//                         </p>
//                         <a
//                           href="/product_template.xlsx"
//                           download="product_template.xlsx"
//                           className="text-blue-600 hover:text-blue-500 hover:underline"
//                         >
//                           Download Excel Template
//                         </a>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//             <div
//               className="fixed inset-0 transition-opacity"
//               aria-hidden="true"
//             >
//               <div
//                 className="absolute inset-0 bg-gray-500 opacity-75"
//                 onClick={() => setDeleteModalOpen(false)}
//               ></div>
//             </div>
//             <span
//               className="hidden sm:inline-block sm:align-middle sm:h-screen"
//               aria-hidden="true"
//             >
//               &#8203;
//             </span>
//             <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
//               <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
//                 <div className="sm:flex sm:items-start">
//                   <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
//                     <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
//                       Confirm Delete
//                     </h3>
//                     <p className="text-gray-600 mb-4">
//                       Are you sure you want to delete user:{" "}
//                       {/* <strong className="text-gray-900">
//                          {userToDelete?.name}
//                        </strong> */}
//                       ? This action cannot be undone.
//                     </p>
//                     <div className="pt-4 flex justify-end space-x-3">
//                       <button
//                         type="button"
//                         className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
//                         onClick={() => {
//                           setShowDeleteModal(false);
//                           setProductToDelete(null);
//                         }}
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         type="button"
//                         className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
//                         onClick={handleDeleteConfirmed}
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//       {/* Premium Newsletter Section */}
//       <div className="bg-gray-900 text-white py-20 mt-16 rounded-xl overflow-hidden relative">
//         <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 to-gold-500/5"></div>
//         <div className="container mx-auto px-6 text-center relative z-10">
//           <h2 className="text-3xl font-light mb-4 tracking-wide">
//             Stay in Style
//           </h2>
//           <p className="text-gray-300 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
//             Subscribe to our newsletter and receive 10% off your first purchase,
//             plus exclusive access to new collections and private events.
//           </p>
//           <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
//             <input
//               type="email"
//               placeholder="Your email address"
//               className="flex-1 px-5 py-3 rounded-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 font-light"
//             />
//             <button className="bg-gold-500 text-gray-900 px-6 py-3 rounded-full font-light hover:bg-gold-400 transition-colors shadow-md">
//               Subscribe
//             </button>
//           </div>
//           <p className="text-xs text-gray-500 mt-4 font-light">
//             By subscribing, you agree to our Privacy Policy
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductList;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Heart,
  ShoppingCart,
  Star,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useProduct } from "../../context/ProductContext";

const ProductList = ({ category }) => {
  const {
    filteredProducts,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
  } = useProduct();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts(category).slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(
    filteredProducts(category).length / itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const defaultColor = product.colors[0]?.name;
    const defaultSize = product.sizes[0]?.size;
    addToCart(product, 1, defaultColor, defaultSize);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg font-light">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-7xl">
      {/* Premium Header Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-light text-gray-900 mb-2 tracking-wide">
          {category ? `${category} Collection` : "Luxury Collection"}
        </h1>
        <p className="text-gray-500 font-light max-w-2xl mx-auto">
          Discover our curated selection of premium products crafted with
          exceptional quality
        </p>
      </div>

      {/* Premium Search and Sort Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="relative w-full md:w-auto">
          <div
            className={`relative transition-all duration-500 ease-in-out ${
              isSearchExpanded ? "w-full md:w-96" : "w-12"
            }`}
          >
            <input
              type="text"
              placeholder="Search our collection..."
              className={`w-full pl-12 pr-6 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 shadow-sm transition-all duration-300 ${
                isSearchExpanded ? "opacity-100" : "absolute opacity-0"
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className={`absolute left-0 top-0 p-3 rounded-full ${
                isSearchExpanded
                  ? "text-gold-500"
                  : "bg-white text-gray-500 hover:text-gold-500"
              } transition-all duration-300`}
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 font-light uppercase tracking-wider">
            Sort By:
          </span>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-full hover:border-gold-500 hover:text-gold-500 transition-all duration-300"
          >
            {sortOrder === "asc" ? (
              <>
                <ChevronUp size={18} />
                <span className="text-sm font-light">Price (Low to High)</span>
              </>
            ) : (
              <>
                <ChevronDown size={18} />
                <span className="text-sm font-light">Price (High to Low)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Luxury Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {currentProducts.map((product) => (
          <div
            key={product._id}
            onClick={() => handleProductClick(product._id)}
            className="group relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-xl border border-gray-100 hover:border-gold-100"
          >
            {/* Product Image */}
            <div className="relative w-full aspect-square overflow-hidden">
              <img
                src={
                  product.colors[0]?.images[0]?.imageUrl ||
                  "https://via.placeholder.com/500"
                }
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Quick View Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all duration-500 opacity-0 group-hover:opacity-100">
                <button className="bg-white text-gray-800 px-6 py-2 rounded-full font-light text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  Quick View
                </button>
              </div>

              {/* Discount Badge */}
              {product.discount > 0 && (
                <div className="absolute top-4 right-4 bg-gold-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                  {product.discount}% OFF
                </div>
              )}

              {/* Wishlist Button */}
              <button
                className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <Heart
                  size={20}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                />
              </button>
            </div>

            {/* Product Details */}
            <div className="p-5">
              <h3 className="text-lg font-light text-gray-900 mb-2 tracking-wide">
                {product.title}
              </h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2 font-light">
                {product.summary}
              </p>

              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < Math.floor(product.rating)
                          ? "text-gold-500 fill-gold-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-xs text-gray-400 font-light">
                  ({product.reviews} reviews)
                </span>
              </div>

              {/* Price and Add to Cart */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-xl font-light text-gray-900">
                    ₹{product.offerPrice || product.price}
                  </span>
                  {product.offerPrice && product.offerPrice < product.price && (
                    <span className="ml-2 text-sm text-gray-400 line-through font-light">
                      ₹{product.price}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className="bg-white border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white p-2 rounded-full transition-all duration-300"
                >
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Luxury Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-16">
          <nav className="inline-flex rounded-full shadow-sm border border-gray-200 p-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 flex items-center justify-center text-sm font-light ${
                  currentPage === page
                    ? "bg-gold-500 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                } rounded-full mx-1 transition-all duration-300`}
              >
                {page}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Premium Newsletter Section */}
      <div className="bg-gray-900 text-white py-20 mt-16 rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 to-gold-500/5"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl font-light mb-4 tracking-wide">
            Stay in Style
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Subscribe to our newsletter and receive 10% off your first purchase,
            plus exclusive access to new collections and private events.
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-5 py-3 rounded-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 font-light"
            />
            <button className="bg-gold-500 text-gray-900 px-6 py-3 rounded-full font-light hover:bg-gold-400 transition-colors shadow-md">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4 font-light">
            By subscribing, you agree to our Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductList;