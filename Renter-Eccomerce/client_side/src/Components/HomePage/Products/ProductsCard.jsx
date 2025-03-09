// import React, { useState } from "react";
// import {
//   Card,
//   CardImg,
//   CardBody,
//   CardTitle,
//   CardText,
//   Button,
//   Row,
//   Col,
// } from "reactstrap";
// import { FaHeart, FaStar } from "react-icons/fa";

// const ProductCard = () => {
//   const [hoveredIndex, setHoveredIndex] = useState(null);
//   const products = [
//     {
//       image:
//         "https://i.pinimg.com/236x/cd/3e/6d/cd3e6df5d0cf60565da20043ff408bb0.jpg",
//       title: "Wrangler Retro Jeans",
//       summary:
//         "This is an amazing product with top-quality materials and design.",
//       price: "$100",
//       offerPrice: "$80",
//       discount: "20% OFF",
//       rating: 4.5,
//       reviews: 1788,
//     },
//     {
//       image:
//         "https://i.pinimg.com/236x/4b/76/51/4b7651981d166ba2b97ce1f9f8132743.jpg",
//       title: "Levi's Strauss & Co.",
//       summary:
//         "Highly durable and stylish, perfect for everyday use and travel.",
//       price: "$120",
//       offerPrice: "$90",
//       discount: "25% OFF",
//       rating: 4.2,
//       reviews: 4999,
//     },
//     {
//       image:
//         "https://i.pinimg.com/236x/f4/59/4f/f4594fa6b8ce773a516db3fcaa91df5b.jpg",
//       title: "True Religion Brand",
//       summary: "A must-have product with excellent features and great reviews.",
//       price: "$150",
//       offerPrice: "$130",
//       discount: "15% OFF",
//       rating: 4.8,
//       reviews: 3444,
//     },
//     {
//       image:
//         "https://i.pinimg.com/236x/54/b7/60/54b76021d0162388f61f32b02819f3f4.jpg",
//       title: "Calvin Klein Denim",
//       summary: "A must-have product with excellent features and great reviews.",
//       price: "$150",
//       offerPrice: "$130",
//       discount: "15% OFF",
//       rating: 4.8,
//       reviews: 3444,
//     },
//   ];

//   return (
//     <Row
//       style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
//     >
//       <h1
//         style={{
//           fontFamily: "Poppins",
//           fontWeight: "700",
//           fontSize: "32px",
//           color: "#333",
//           textAlign: "center",
//           marginBottom: "20px",
//         }}
//       >
//         BESTSELLERS
//       </h1>
//       <div style={{ width: "90%" }}>
//         <hr style={{ border: "2px solid #ddd", borderRadius: "5px" }} />
//       </div>

//       {products.map((product, index) => (
//         <Col sm="4" key={index} style={{ width: "350px", marginTop: "20px" }}>
//           <Card
//             style={{
//               borderRadius: "16px",
//               boxShadow:
//                 hoveredIndex === index
//                   ? "0px 20px 40px rgba(0, 0, 0, 0.3)"
//                   : "0px 10px 20px rgba(0, 0, 0, 0.1)",
//               transform:
//                 hoveredIndex === index
//                   ? "translateY(-10px) scale(1.05)"
//                   : "scale(1)",
//               transition:
//                 "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
//               cursor: "pointer",
//               position: "relative",
//               background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
//               padding: "12px",
//               border: "none",
//             }}
//             onMouseEnter={() => setHoveredIndex(index)}
//             onMouseLeave={() => setHoveredIndex(null)}
//           >
//             <div style={{ display: "flex", justifyContent: "center" }}>
//               <CardImg
//                 top
//                 src={product.image}
//                 alt={product.title}
//                 style={{
//                   width: "100%",
//                   height: "300px",
//                   objectFit: "cover",
//                   borderRadius: "12px",
//                   boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
//                   transition: "transform 0.3s ease-in-out",
//                   transform:
//                     hoveredIndex === index ? "scale(1.05)" : "scale(1)",
//                 }}
//               />
//             </div>
//             <CardBody style={{ textAlign: "start" }}>
//               <CardTitle
//                 tag="h5"
//                 style={{ fontWeight: "bold", color: "#333", fontSize: "20px" }}
//               >
//                 {product.title}
//               </CardTitle>
//               <CardText style={{ fontSize: "14px", color: "#666" }}>
//                 {product.summary}
//               </CardText>
//               <CardText>
//                 <span
//                   style={{
//                     textDecoration: "line-through",
//                     marginRight: "5px",
//                     color: "#999",
//                   }}
//                 >
//                   {product.price}
//                 </span>
//                 <span
//                   style={{
//                     color: "#28a745",
//                     fontWeight: "bold",
//                     fontSize: "18px",
//                   }}
//                 >
//                   {product.offerPrice}
//                 </span>
//                 <span
//                   style={{
//                     marginLeft: "10px",
//                     color: "#ff5733",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   {product.discount}
//                 </span>
//               </CardText>
//               <Button
//                 style={{
//                   width: "100%",
//                   background: "linear-gradient(145deg, #ffdb4d, #ffbf00)",
//                   color: "black",
//                   fontWeight: "bold",
//                   border: "none",
//                   borderRadius: "8px",
//                   padding: "12px",
//                   transition: "all 0.3s ease-in-out",
//                   boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
//                 }}
//                 onMouseEnter={(e) =>
//                   (e.target.style.boxShadow =
//                     "0px 6px 20px rgba(255, 215, 0, 0.5)")
//                 }
//                 onMouseLeave={(e) =>
//                   (e.target.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)")
//                 }
//               >
//                 Buy Now
//               </Button>
//               <Button
//                 color="link"
//                 style={{
//                   position: "absolute",
//                   top: "10px",
//                   right: "10px",
//                   fontSize: "22px",
//                   color: "#ff4d4d",
//                   transition: "color 0.3s ease-in-out",
//                 }}
//                 onMouseEnter={(e) => (e.target.style.color = "red")}
//                 onMouseLeave={(e) => (e.target.style.color = "#ff4d4d")}
//               >
//                 <FaHeart />
//               </Button>
//             </CardBody>
//           </Card>
//         </Col>
//       ))}
//     </Row>
//   );
// };

// export default ProductCard;

const ProductCard = () => {
  return <h1>hi</h1>;
};
export default ProductCard;
