import React from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import img1 from "../../../assets/mens banners.png";
import img2 from "../../../assets/banner-jens-2.webp";
import img3 from "../../../assets/banner-jens1.webp";
import img4 from "../../../assets/upd.png";
import img5 from "../../../assets/womans banners.png";
import { IoIosArrowDropleftCircle } from "react-icons/io";
import { IoIosArrowDroprightCircle } from "react-icons/io";

const Cards = () => {
  // const items = [
  //   {
  //     key: 1,
  //     src: img1,
  //   },
  //   {
  //     key: 2,
  //     src: img5,
  //   },
  //   {
  //     key: 3,
  //     src: img2,
  //   },
  //   {
  //     key: 4,
  //     src: img3,
  //   },
  // ];

  return (
    <div
      className="mx-auto shadow-lg rounded-lg mt-10"
      style={{
        width: "95%", // Adjust the width of the container to make it smaller
        marginTop: "8rem",
        height: "70vh", // Default height for larger screens
        padding: "10px", // Add padding around the container
        border:'3px solid red'
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
        renderArrowPrev={(onClickHandler, hasPrev, label) =>
          hasPrev && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              style={{
                position: "absolute",
                zIndex: 2,
                top: "50%",
                left: "10px",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "rgba(0, 0, 0, 0.8)")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "rgba(0, 0, 0, 0.5)")
              }
            >
              <IoIosArrowDropleftCircle />
            </button>
          )
        }
        renderArrowNext={(onClickHandler, hasNext, label) =>
          hasNext && (
            <button
              type="button"
              onClick={onClickHandler}
              title={label}
              style={{
                position: "absolute",
                zIndex: 2,
                top: "50%",
                right: "10px",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
              }}
              onMouseEnter={(e) =>
                (e.target.style.backgroundColor = "rgba(0, 0, 0, 0.8)")
              }
              onMouseLeave={(e) =>
                (e.target.style.backgroundColor = "rgba(0, 0, 0, 0.5)")
              }
            >
              <IoIosArrowDroprightCircle />
            </button>
          )
        }
      >
        {items.map((item) => (
          <div key={item.key}>
            <img
              src={item.src}
              alt={`slide-${item.key}`}
              style={{
                width: "100%",
                height: "70vh", // Default height for larger screens
                objectFit: "cover", // Ensures the image covers the container, cropping if necessary
                borderRadius: "10px",
              }}
            />
          </div>
        ))}
      </Carousel>

      {/* Add media queries for responsiveness */}
      <style>
        {`
          @media (max-width: 1024px) {
            .carousel-container {
              height: 5vh; /* Adjust height for tablets */
            }
            .carousel-container img {
              height: 5vh; /* Adjust height for tablets */
            }
          }

          @media (max-width: 768px) {
            .carousel-container {
              height: 20vh; /* Adjust height for smaller tablets */
            }
            .carousel-container img {
              height: 20vh; /* Adjust height for smaller tablets */
            }
          }

          @media (max-width: 480px) {
            .carousel-container {
              height: 10vh; /* Adjust height for mobile devices */
            }
            .carousel-container img {
              height: 10vh; /* Adjust height for mobile devices */
            }
          }
        `}
      </style>
    </div>
  );
};

export default Cards;
