import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("INTRODUCTION");

  const sections = [
    { id: "INTRODUCTION", title: "INTRODUCTION" },
    { id: "ELIGIBILITY", title: "ELIGIBILITY" },
    { id: "PRIVACY_POLICY", title: "PRIVACY POLICY & DATA SECURITY" },
    { id: "OWNERSHIP", title: "OWNERSHIP OF WEBSITES, CONTENT AND TRADEMARKS" },
    { id: "USE_OF_WEBSITES", title: "YOUR USE OF OUR WEBSITES" },
    { id: "USER_CONTENT", title: "USER-GENERATED CONTENT" },
    { id: "CONTENT_RULES", title: "USER-GENERATED CONTENT RULES" },
    { id: "COPYRIGHT", title: "COPYRIGHT AND TRADEMARK RULES" },
    { id: "INFRINGEMENT", title: "INFRINGEMENT NOTIFICATION" },
    { id: "ACCOUNTS", title: "ACCOUNTS, PASSWORDS AND SECURITY" },
    { id: "PRODUCTS", title: "ONLINE PRODUCTS AND SALES" },
    { id: "LINKS", title: "LINKS TO OUR WEBSITES; THIRD PARTY LINKS" },
    { id: "CHANGES", title: "CHANGE IN WEBSITES AND CONTENT" },
    { id: "DISCLAIMERS", title: "DISCLAIMERS; LIMITATIONS ON LIABILITY" },
  ];

  const sectionContent = {
    INTRODUCTION: (
      <div>
        <h2 className="text-2xl font-bold mb-4">INTRODUCTION</h2>
        <p className="mb-4">
          The Terms of Use outlined below are for reanter in. For ranter store Loop
          Member Program Terms & Conditions, please click here.
        </p>
        <p className="mb-4">
          Our Websites have different purposes and functionalities. We describe
          these differences on this page, so please read it carefully. If you
          have any questions regarding the Terms of Use, please contact us
          through the information provided towards the end of this document.
        </p>
      </div>
    ),
    ELIGIBILITY: (
      <div>
        <h2 className="text-2xl font-bold mb-4">ELIGIBILITY</h2>
        <p className="mb-4">
          To use our Websites, you must be at least 18 years old or the age of
          majority in your jurisdiction, whichever is higher. By accessing or
          using our Websites, you represent and warrant that you meet this age
          requirement.
        </p>
        <p className="mb-4">
          If you are under 18 but at least 13 years old, you may only use our
          Websites under the supervision of a parent or legal guardian who
          agrees to be bound by these Terms of Use.
        </p>
      </div>
    ),
    PRIVACY_POLICY: (
      <div>
        <h2 className="text-2xl font-bold mb-4">
          PRIVACY POLICY & DATA SECURITY
        </h2>
        <p className="mb-4">
          Your privacy is important to us. Our Privacy Policy explains how we
          collect, use, disclose, and safeguard your information when you visit
          our Websites.
        </p>
        <p className="mb-4">
          We implement appropriate technical and organizational measures to
          protect your personal data against unauthorized or unlawful processing
          and against accidental loss, destruction, or damage.
        </p>
      </div>
    ),
    OWNERSHIP: (
      <div>
        <h2 className="text-2xl font-bold mb-4">
          OWNERSHIP OF WEBSITES, CONTENT AND TRADEMARKS
        </h2>
        <p className="mb-4">
          All content on our Websites, including text, graphics, logos, button
          icons, images, audio clips, digital downloads, data compilations, and
          software, is the property of reanter Strauss & Co. or its content
          suppliers and protected by international copyright laws.
        </p>
        <p className="mb-4">
          The trademarks, logos, and service marks displayed on our Websites
          (collectively the "Trademarks") are the registered and unregistered
          marks of reanter Strauss & Co. in the United States and other countries.
        </p>
      </div>
    ),
    // Add content for other sections similarly
    USE_OF_WEBSITES: (
      <div>
        <h2 className="text-2xl font-bold mb-4">YOUR USE OF OUR WEBSITES</h2>
        <p className="mb-4">
          Subject to your compliance with these Terms, we grant you a personal,
          non-exclusive, non-transferable, limited privilege to enter, access,
          and use our Websites.
        </p>
        <p className="mb-4">
          You agree not to use our Websites for any unlawful purpose or in any
          way that might harm, damage, or disparage any other party.
        </p>
      </div>
    ),
    // Placeholder content for remaining sections
    USER_CONTENT: (
      <div>
        <h2 className="text-2xl font-bold mb-4">USER-GENERATED CONTENT</h2>
        <p>Content details...</p>
      </div>
    ),
    CONTENT_RULES: (
      <div>
        <h2 className="text-2xl font-bold mb-4">
          USER-GENERATED CONTENT RULES
        </h2>
        <p>Rules details...</p>
      </div>
    ),
    COPYRIGHT: (
      <div>
        <h2 className="text-2xl font-bold mb-4">
          COPYRIGHT AND TRADEMARK RULES
        </h2>
        <p>Copyright details...</p>
      </div>
    ),
    INFRINGEMENT: (
      <div>
        <h2 className="text-2xl font-bold mb-4">INFRINGEMENT NOTIFICATION</h2>
        <p>Infringement details...</p>
      </div>
    ),
    ACCOUNTS: (
      <div>
        <h2 className="text-2xl font-bold mb-4">
          ACCOUNTS, PASSWORDS AND SECURITY
        </h2>
        <p>Accounts details...</p>
      </div>
    ),
    PRODUCTS: (
      <div>
        <h2 className="text-2xl font-bold mb-4">ONLINE PRODUCTS AND SALES</h2>
        <p>Products details...</p>
      </div>
    ),
    LINKS: (
      <div>
        <h2 className="text-2xl font-bold mb-4">
          LINKS TO OUR WEBSITES; THIRD PARTY LINKS
        </h2>
        <p>Links details...</p>
      </div>
    ),
    CHANGES: (
      <div>
        <h2 className="text-2xl font-bold mb-4">
          CHANGE IN WEBSITES AND CONTENT
        </h2>
        <p>Changes details...</p>
      </div>
    ),
    DISCLAIMERS: (
      <div>
        <h2 className="text-2xl font-bold mb-4">
          DISCLAIMERS; LIMITATIONS ON LIABILITY
        </h2>
        <p>Disclaimer details...</p>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900">RANTER STORE STRAUSS & CO. PRIVACY POLICY</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="sticky top-8">
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                        activeSection === section.id
                          ? "bg-yellow-500 text-black shadow-md"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-xl shadow-sm p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {sectionContent[activeSection]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Last updated: May 14, 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
