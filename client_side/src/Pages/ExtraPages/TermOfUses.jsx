import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TermOfUses = () => {
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
          The Terms of Use outlined below are for ranter® store Loop Member Program Terms & Conditions, please click here
        </p>
        
        <p className="mb-4">
          Our Websites have different purposes and functionalities. We describe these differences on this page, so please read it carefully. If you have any questions regarding the Terms of Use, please contact us through the information provided towards the end of this document.
        </p>
      </div>
    ),
    ELIGIBILITY: (
      <div>
        <h2 className="text-2xl font-bold mb-4">ELIGIBILITY</h2>
        <p className="mb-4">
          To use our Websites, you must be at least 18 years old or the age of majority in your jurisdiction, whichever is higher. By accessing or using our Websites, you represent and warrant that you meet this age requirement.
        </p>
        <p className="mb-4">
          If you are under 18 but at least 13 years old, you may only use our Websites under the supervision of a parent or legal guardian who agrees to be bound by these Terms of Use.
        </p>
      </div>
    ),
    PRIVACY_POLICY: (
      <div>
        <h2 className="text-2xl font-bold mb-4">PRIVACY POLICY & DATA SECURITY</h2>
        <p className="mb-4">
          Your privacy is important to us. Our Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our Websites.
        </p>
        <p className="mb-4">
          We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing and against accidental loss, destruction, or damage.
        </p>
      </div>
    ),
    OWNERSHIP: (
      <div>
        <h2 className="text-2xl font-bold mb-4">OWNERSHIP OF WEBSITES, CONTENT AND TRADEMARKS</h2>
        <p className="mb-4">
          All content on our Websites, including text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of reanter  Strauss & Co. or its content suppliers and protected by international copyright laws.
        </p>
        <p className="mb-4">
          The trademarks, logos, and service marks displayed on our Websites (collectively the "Trademarks") are the registered and unregistered marks of reanter  Strauss & Co. in the United States and other countries.
        </p>
      </div>
    ),
    USE_OF_WEBSITES: (
      <div>
        <h2 className="text-2xl font-bold mb-4">YOUR USE OF OUR WEBSITES</h2>
        <p className="mb-4">
          Subject to your compliance with these Terms, we grant you a personal, non-exclusive, non-transferable, limited privilege to enter, access, and use our Websites.
        </p>
        <p className="mb-4">
          You agree not to use our Websites for any unlawful purpose or in any way that might harm, damage, or disparage any other party.
        </p>
      </div>
    ),
    USER_CONTENT: (
      <div>
        <h2 className="text-2xl font-bold mb-4">USER-GENERATED CONTENT</h2>
        <p className="mb-4">
          Our Websites may allow you to post, upload, publish, submit or transmit content, including but not limited to text, photographs, videos, and other materials ("User Content").
        </p>
        <p className="mb-4">
          You retain ownership of any intellectual property rights that you hold in your User Content. By posting User Content, you grant us a worldwide, perpetual, irrevocable, non-exclusive, royalty-free, sublicensable and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the User Content in connection with our Websites and our business.
        </p>
      </div>
    ),
    CONTENT_RULES: (
      <div>
        <h2 className="text-2xl font-bold mb-4">USER-GENERATED CONTENT RULES</h2>
        <p className="mb-4">
          You agree not to post User Content that: (1) may create a risk of harm, loss, physical or mental injury, emotional distress, death, disability, disfigurement, or physical or mental illness to you, to any other person, or to any animal; (2) may create a risk of any other loss or damage to any person or property; (3) seeks to harm or exploit children by exposing them to inappropriate content, asking for personally identifiable details or otherwise; (4) may constitute or contribute to a crime or tort; (5) contains any information or content that we deem to be unlawful, harmful, abusive, racially or ethnically offensive, defamatory, infringing, invasive of personal privacy or publicity rights, harassing, humiliating to other people (publicly or otherwise), libelous, threatening, profane, or otherwise objectionable; (6) contains any information or content that is illegal (including, without limitation, the disclosure of insider information under securities law or of another party's trade secrets); (7) contains any information or content that you do not have a right to make available under any law or under contractual or fiduciary relationships; or (8) contains any information or content that you know is not correct and current.
        </p>
      </div>
    ),
    COPYRIGHT: (
      <div>
        <h2 className="text-2xl font-bold mb-4">COPYRIGHT AND TRADEMARK RULES</h2>
        <p className="mb-4">
          All content included on our Websites, such as text, graphics, logos, button icons, images, audio clips, digital downloads, data compilations, and software, is the property of reanter  Strauss & Co. or its content suppliers and protected by international copyright laws. The compilation of all content on our Websites is the exclusive property of reanter  Strauss & Co. and protected by international copyright laws.
        </p>
        <p className="mb-4">
          The trademarks, logos, and service marks displayed on our Websites (collectively the "Trademarks") are the registered and unregistered marks of reanter  Strauss & Co. in the United States and other countries. All other trademarks not owned by reanter  Strauss & Co. that appear on our Websites are the property of their respective owners, who may or may not be affiliated with, connected to, or sponsored by reanter  Strauss & Co.
        </p>
      </div>
    ),
    INFRINGEMENT: (
      <div>
        <h2 className="text-2xl font-bold mb-4">INFRINGEMENT NOTIFICATION</h2>
        <p className="mb-4">
          If you believe that any content on our Websites infringes your copyright, please send us a notice containing the following information:
        </p>
        <ol className="list-decimal pl-6 mb-4 space-y-2">
          <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
          <li>Identification of the copyrighted work claimed to have been infringed, or, if multiple copyrighted works at a single online site are covered by a single notification, a representative list of such works at that site.</li>
          <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate the material.</li>
          <li>Information reasonably sufficient to permit us to contact you, such as an address, telephone number, and, if available, an electronic mail address at which you may be contacted.</li>
          <li>A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
          <li>A statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
        </ol>
      </div>
    ),
    ACCOUNTS: (
      <div>
        <h2 className="text-2xl font-bold mb-4">ACCOUNTS, PASSWORDS AND SECURITY</h2>
        <p className="mb-4">
          Certain features or services offered on or through our Websites may require you to open an account (including setting up a ranter® store Loop Member Program account and password). You are entirely responsible for maintaining the confidentiality of your account information, including your password, and for any and all activity that occurs under your account.
        </p>
        <p className="mb-4">
          You agree to notify us immediately of any unauthorized use of your account or password, or any other breach of security. However, you may be held liable for losses incurred by us or any other user of or visitor to our Websites due to someone else using your ranter® store Loop Member Program account or password.
        </p>
        <p className="mb-4">
          You may not use anyone else's ranter® store Loop Member Program account or password at any time without the express permission and consent of the holder of that ranter® store Loop Member Program account or password.
        </p>
      </div>
    ),
    PRODUCTS: (
      <div>
        <h2 className="text-2xl font-bold mb-4">ONLINE PRODUCTS AND SALES</h2>
        <p className="mb-4">
          All features, specifications, products and prices of products and services described or depicted on our Websites are subject to change at any time without notice. The inclusion of any products or services on our Websites at a particular time does not imply or warrant that these products or services will be available at any time.
        </p>
        <p className="mb-4">
          We reserve the right, with or without prior notice, to limit the available quantity of or discontinue any product or service; to honor, or impose conditions on the honoring of, any coupon, coupon code, promotional code or other similar promotions; to bar any user from making any or all purchase(s); and/or to refuse to provide any user with any product or service.
        </p>
      </div>
    ),
    LINKS: (
      <div>
        <h2 className="text-2xl font-bold mb-4">LINKS TO OUR WEBSITES; THIRD PARTY LINKS</h2>
        <p className="mb-4">
          You may link to our Websites, provided you do so in a way that is fair and legal and does not damage our reputation or take advantage of it, but you must not establish a link in such a way as to suggest any form of association, approval or endorsement on our part where none exists.
        </p>
        <p className="mb-4">
          Our Websites may contain links to third-party websites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You further acknowledge and agree that we shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such websites or services.
        </p>
      </div>
    ),
    CHANGES: (
      <div>
        <h2 className="text-2xl font-bold mb-4">CHANGE IN WEBSITES AND CONTENT</h2>
        <p className="mb-4">
          We may update our Websites and their content from time to time, but their content is not necessarily complete or up-to-date. Any of the material on our Websites may be out of date at any given time, and we are under no obligation to update such material.
        </p>
        <p className="mb-4">
          We reserve the right to withdraw or amend our Websites, and any service or material we provide on our Websites, in our sole discretion without notice. We will not be liable if for any reason all or any part of our Websites is unavailable at any time or for any period.
        </p>
      </div>
    ),
    DISCLAIMERS: (
      <div>
        <h2 className="text-2xl font-bold mb-4">DISCLAIMERS; LIMITATIONS ON LIABILITY</h2>
        <p className="mb-4">
          THE WEBSITES AND ALL INFORMATION, CONTENT, MATERIALS, PRODUCTS (INCLUDING SOFTWARE) AND SERVICES INCLUDED ON OR OTHERWISE MADE AVAILABLE TO YOU THROUGH THE WEBSITES ARE PROVIDED BY US ON AN "AS IS" AND "AS AVAILABLE" BASIS, UNLESS OTHERWISE SPECIFIED IN WRITING. WE MAKE NO REPRESENTATIONS OR WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, AS TO THE OPERATION OF THE WEBSITES OR THE INFORMATION, CONTENT, MATERIALS, PRODUCTS (INCLUDING SOFTWARE) OR SERVICES INCLUDED ON OR OTHERWISE MADE AVAILABLE TO YOU THROUGH THE WEBSITES, UNLESS OTHERWISE SPECIFIED IN WRITING. YOU EXPRESSLY AGREE THAT YOUR USE OF THE WEBSITES IS AT YOUR SOLE RISK.
        </p>
        <p className="mb-4">
          TO THE FULL EXTENT PERMISSIBLE BY APPLICABLE LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. WE DO NOT WARRANT THAT THE WEBSITES; INFORMATION, CONTENT, MATERIALS, PRODUCTS (INCLUDING SOFTWARE) OR SERVICES INCLUDED ON OR OTHERWISE MADE AVAILABLE TO YOU THROUGH THE WEBSITES; THEIR SERVERS; OR E-MAIL SENT FROM US ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. WE WILL NOT BE LIABLE FOR ANY DAMAGES OF ANY KIND ARISING FROM THE USE OF THE WEBSITES OR FROM ANY INFORMATION, CONTENT, MATERIALS, PRODUCTS (INCLUDING SOFTWARE) OR SERVICES INCLUDED ON OR OTHERWISE MADE AVAILABLE TO YOU THROUGH THE WEBSITES, INCLUDING, BUT NOT LIMITED TO DIRECT, INDIRECT, INCIDENTAL, PUNITIVE, AND CONSEQUENTIAL DAMAGES, UNLESS OTHERWISE SPECIFIED IN WRITING.
        </p>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900">TERMS OF USE</h1>
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

export default TermOfUses;