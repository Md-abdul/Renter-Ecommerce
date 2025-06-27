import React, { useState } from "react";

const FAQComponent = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. All payments are processed securely through our encrypted payment gateway.",
    },
    {
      question: "How long does shipping take?",
      answer: (
        <>
          Our standard shipping times are:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Domestic: 3-5 business days</li>
            <li>International: 7-14 business days</li>
            <li>
              Express shipping: 1-2 business days (additional fee applies)
            </li>
          </ul>
          Tracking information will be provided once your order ships.
        </>
      ),
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for most items. Items must be unused, in original packaging, and with all tags attached. Please contact our customer service to initiate a return and receive a return authorization number.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order has shipped, you'll receive a confirmation email with a tracking number and link. You can also track your order by logging into your account on our website and viewing your order history.",
    },
    {
      question: "Do you offer international shipping?",
      answer:
        "Yes, we ship to most countries worldwide. International shipping rates and delivery times vary depending on the destination. Any customs or import duties are the responsibility of the customer.",
    },
    {
      question: "How do I contact customer support?",
      answer:
        "Our customer support team is available 24/7 via email at support@ranter.com or through our live chat feature on the website. You can also call us at +91 9029297732 during business hours (9am-5pm EST).",
    },
    {
      question: "Are my personal details secure?",
      answer:
        "Absolutely. We use industry-standard SSL encryption to protect all your personal information. We never store your credit card details on our servers and comply with all data protection regulations.",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">
        Frequently Asked Questions
      </h2>
      <ul className="flex flex-col">
        {faqs.map((faq, index) => (
          <li
            key={index}
            className="bg-white my-2 shadow-lg rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="flex flex-row justify-between items-center font-semibold p-4 cursor-pointer w-full text-left"
            >
              <span className="text-gray-800">{faq.question}</span>
              <svg
                className={`fill-current text-blue-600 h-5 w-5 transform transition-transform duration-300 ${
                  activeIndex === index ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
              >
                <path d="M13.962,8.885l-3.736,3.739c-0.086,0.086-0.201,0.13-0.314,0.13S9.686,12.71,9.6,12.624l-3.562-3.56C5.863,8.892,5.863,8.611,6.036,8.438c0.175-0.173,0.454-0.173,0.626,0l3.25,3.247l3.426-3.424c0.173-0.172,0.451-0.172,0.624,0C14.137,8.434,14.137,8.712,13.962,8.885 M18.406,10c0,4.644-3.763,8.406-8.406,8.406S1.594,14.644,1.594,10S5.356,1.594,10,1.594S18.406,5.356,18.406,10 M17.521,10c0-4.148-3.373-7.521-7.521-7.521c-4.148,0-7.521,3.374-7.521,7.521c0,4.147,3.374,7.521,7.521,7.521C14.148,17.521,17.521,14.147,17.521,10"></path>
              </svg>
            </button>
            <div
              className={`border-l-2 border-blue-600 overflow-hidden transition-all duration-300 ${
                activeIndex === index ? "max-h-96" : "max-h-0"
              }`}
            >
              <div className="p-4 text-gray-600">{faq.answer}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FAQComponent;
