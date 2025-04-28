import React, { useState, useEffect } from "react";
import ProductCard from "./HomePage/Products/ProductsCard";
import downloadedImg from "./download (1).jpeg"; // Make sure the path is correct

const HomePage = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 31,
    hours: 29,
    minutes: 56,
    seconds: 13,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        const { days, hours, minutes, seconds } = prevTime;

        let newSeconds = seconds - 1;
        let newMinutes = minutes;
        let newHours = hours;
        let newDays = days;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes -= 1;
        }

        if (newMinutes < 0) {
          newMinutes = 59;
          newHours -= 1;
        }

        if (newHours < 0) {
          newHours = 23;
          newDays -= 1;
        }

        return {
          days: newDays,
          hours: newHours,
          minutes: newMinutes,
          seconds: newSeconds,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home-page">
      {/* Deal of the Week Section with image on right */}
      <ProductCard />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "40px",
          backgroundColor: "#f0eeee",
          marginBottom: "40px",
          boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            flex: 1,
          }}
        >
          <h2
            style={{
              fontSize: "14px",
              fontWeight: "600",
              letterSpacing: "2px",
              marginBottom: "10px",
              color: "#333",
            }}
          >
            DEAL OF THE WEEK
          </h2>

          <h3
            style={{
              fontSize: "32px",
              fontWeight: "700",
              marginBottom: "20px",
              color: "#d2a80e",
            }}
          >
            SPRING COLLECTION
          </h3>

          <button
            style={{
              padding: "12px 30px",
              backgroundColor: "#000",
              color: "#fff",
              border: "none",
              borderRadius: "0",
              fontWeight: "600",
              letterSpacing: "1px",
              marginBottom: "30px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            SHOP NOW
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              marginBottom: "10px",
            }}
          >
            <div style={{ fontSize: "24px", fontWeight: "700" }}>
              {timeLeft.days.toString().padStart(2, "0")}
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700" }}>:</div>
            <div style={{ fontSize: "24px", fontWeight: "700" }}>
              {timeLeft.hours.toString().padStart(2, "0")}
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700" }}>:</div>
            <div style={{ fontSize: "24px", fontWeight: "700" }}>
              {timeLeft.minutes.toString().padStart(2, "0")}
            </div>
            <div style={{ fontSize: "24px", fontWeight: "700" }}>:</div>
            <div style={{ fontSize: "24px", fontWeight: "700" }}>
              {timeLeft.seconds.toString().padStart(2, "0")}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "25px",
              fontSize: "12px",
              color: "#666",
              textTransform: "uppercase",
            }}
          >
            <span>Days</span>
            <span>Hours</span>
            <span>Minutes</span>
            <span>Seconds</span>
          </div>
        </div>

        {/* Image on the right side */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={downloadedImg}
            alt="Spring Collection"
            style={{
              maxWidth: "100%",
              height: "auto",
              maxHeight: "400px",
            }}
          />
        </div>
      </div>

      {/* Categories Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Men's Fashion",
                image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=600",
                link: "#"
              },
              {
                name: "Women's Fashion",
                image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600",
                link: "#"
              },
              {
                name: "Kids & Babies",
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZ5wrY0ocW4McL3u98nUJ6vd3PV4DmvGfHyQ&s",
                link: "#"
              }
            ].map((category, index) => (
              <div key={index} className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <h3 className="text-2xl font-bold text-white bg-black/50 px-6 py-2 rounded-lg">
                    {category.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Summer Sale Up To 50% Off</h2>
          <p className="text-xl text-white mb-8">Limited time offer on selected items. Don't miss out!</p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg">
            Shop Now
          </button>
        </div>
      </section>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        padding: '40px 20px',
        flexWrap: 'wrap'
      }}>
        {/* Women's T-shirts Box */}
        <div style={{
          width: '500px',
          height: '300px',
          backgroundImage: 'url(https://i.pinimg.com/736x/58/46/a4/5846a416fa608dc63335e27753ccfa02.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '10px'
            }}>
              STARTING AT ₹149
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}>
              Men's Wears Dresses
            </div>
            <button style={{
              padding: '10px 30px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              SHOP NOW
            </button>
          </div>
        </div>

        {/* Men's Sportswear Box */}
        <div style={{
          width: '500px',
          height: '300px',
          backgroundImage: 'url(https://i.pinimg.com/236x/62/75/84/627584cef629e2d131529ee76d039b41.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '10px'
            }}>
              STARTING AT ₹149
            </div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '20px'
            }}>
              Women's Wear Dresses
            </div>
            <button style={{
              padding: '10px 30px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              SHOP NOW
            </button>
          </div>
        </div>
      </div>


      {/* Features Section */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🚚",
                title: "Free Shipping",
                description: "Free delivery on all orders over $50"
              },
              {
                icon: "💳",
                title: "Secure Payment",
                description: "100% secure payment methods"
              },
              {
                icon: "🔄",
                title: "Easy Returns",
                description: "30-day return policy"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
