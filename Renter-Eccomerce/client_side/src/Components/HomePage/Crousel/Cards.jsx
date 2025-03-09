import React from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import img1 from "../../../assets/jeans1.jpg";
import img2 from "../../../assets/jeans2.jpg";
import img3 from "../../../assets/jeans3.jpg";

const Cards = () => {
  const items = [
    {
      key: 1,
      src: img1,
    },
    {
      key: 2,
      src: img2,
    },
    {
      key: 3,
      src: img3,
    },
  ];

  return (
    <div
      className="mx-auto shadow-lg rounded-lg "
      style={{
        width: "95%", // Adjust the width of the container to make it smaller
        marginTop: "40px",
        height: "73vh",
        padding: "10px", // Add padding around the container
      }}
    >
      <Carousel
        autoPlay
        interval={3000} // Slide every 3 seconds
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        stopOnHover
        swipeable
      >
        {items.map((item) => (
          <div key={item.key}>
            <img
              src={item.src}
              alt={`slide-${item.key}`}
              //   className="rounded-lg"
              style={{
                width: "100%", // Make image fill the height of the container
                height: "70vh",
                objectFit: "cover", // Ensures the image covers the container, cropping if necessary
              }}
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default Cards;
