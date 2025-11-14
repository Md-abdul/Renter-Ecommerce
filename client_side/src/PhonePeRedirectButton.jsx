import React from "react";

const PhonePeRedirectButton = () => {
  const deepLink =
    "ppesim://mandate?pa=MURTAJAUAT@ybl&pn=SUBSCRIBEMID&am=200&mam=&tr=OM2511132118158592636016&utm_campaign=SUBSCRIBE_AUTH&utm_medium=MURTAJAUAT&utm_source=OM2511132118158592636016";

  const handleRedirect = () => {
    window.location.href = deepLink;
  };

  return (
    <button
      onClick={handleRedirect}
      style={{
        padding: "12px 20px",
        fontSize: "16px",
        backgroundColor: "#4f46e5",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      Open in PhonePe
    </button>
  );
};

export default PhonePeRedirectButton;
