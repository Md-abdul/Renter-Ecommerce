import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Return = () => {
  const [activeSection, setActiveSection] = useState("RETURN_POLICY");

  // Set the first section as active when page loads
  useEffect(() => {
    setActiveSection("RETURN_POLICY");
  }, []);

  const sections = [
    { id: "RETURN_POLICY", title: "RETURN POLICY" },
    { id: "REFUNDS", title: "REFUNDS" },
    { id: "ITEM_DAMAGED", title: "ITEM DAMAGED DURING SHIPMENT" },
    { id: "EXCHANGE", title: "EXCHANGE" },
    { id: "IN_STORE", title: "WARRANTY" },
    { id: "FAQS", title: "FAQS" },
  ];

  const sectionContent = {
    RETURN_POLICY: (
      <div>
        <h2 className="text-2xl font-bold mb-4">RETURN POLICY</h2>
        <p className="mb-4">
          Returning an item is easy. If you're not satisfied with your purchase,
          you can initiate a return online. Please note that items must be
          returned within 10 days of the order delivered date and that items are
          in their original condition, where the item is unworn, unwashed,
          without alterations and has all tags attached. Ranter Store.in reserves the
          right to deny refund if the item does not meet its Return Policy
          guidelines. Final sales, promotional items or opened packaged items
          may not be exchanged, returned or refunded.
        </p>
        <p className="mb-4">
          Returns are not available on the orders placed using the promo
          NORETURN and BUY2GET2.
        </p>
        <p className="mb-4">
          We guarantee our merchandise to be free of manufacturing defects. If
          you receive a damaged or defective item, or your item proves to be
          defective in workmanship or materials within 15 days with normal wear
          (excluding stains), we will always accept the item for assessment and
          provide a refund if validated as faulty. Such returns have to be
          initiated with our customer care and not via online returns.
        </p>
        <p className="mb-4">
          If you miss your return pickup, one more attempt will be made to pick
          up your return package on the following business day. After the second
          failed attempt, the return request will be cancelled.
        </p>
        <p className="mb-4">
          As soon as we receive your return in our warehouse, we will proceed
          with the returns check and validation. Once the return has been
          approved, we will notify you by email and your refund will be credited
          within 15 days. If you return is not approved, a member of our
          Customer Care team will be in touch.
        </p>
        <p className="mb-4">
          Please do not hand over any additional items to the shipping partner
          during return pickup. If you wish to return more products, please get
          in touch with our Customer Care team, who will arrange a pickup for
          the additional products. We will not be responsible for refund of
          additional/ unaccounted products lost in transit.
        </p>
      </div>
    ),
    REFUNDS: (
      <div>
        <h2 className="text-2xl font-bold mb-4">REFUNDS</h2>
        <p className="mb-4">
          Refunds will be made to the same form of payment originally used for
          the purchase within 15 days. Please note that refund payment times are
          dictated by the issuing bank and are outside our control. Please
          consult your bank for more information.
        </p>
        <p className="mb-4">
          For Cash on Delivery (COD) orders refunds will be issued through
          bank/UPI transfers only. Please add correct details while placing your
          online return request. In case of failure, you will receive a link,
          using which you can initiate refund on your preferred mode.
        </p>
        <p className="mb-4">
          Please note that we are unable to issue refunds through cash or
          cheque.
        </p>
        <p className="mb-4">
          If an item is returned that does not comply with our Returns Policy,
          we will not approve and process the refund. We reserve the right to
          not return an item which does not comply with our Returns Policy.
          Please contact our Customer Care team to enquire about the validity of
          your return if you are unsure.
        </p>
      </div>
    ),
    ITEM_DAMAGED: (
      <div>
        <h2 className="text-2xl font-bold mb-4">
          ITEM DAMAGED DURING SHIPMENT
        </h2>
        <p className="mb-4">
          If you received an item which is damaged upon arrival, please contact
          our Customer Care team immediately. You have the right to a full
          refund on all shipments that arrive damaged provided you inform us
          within 1 week of receiving the package.
        </p>
        <p className="mb-4">
          To return an item, please follow the Return Instructions. Once the
          item is received we will assess and validate. If approved, we will
          refund the purchase price of the damaged item.
        </p>
      </div>
    ),
    EXCHANGE: (
      <div>
        <h2 className="text-2xl font-bold mb-4">EXCHANGE</h2>
        <p className="mb-4">
          We now allow exchanges for a different product within 10 days of the
          order confirmation date, subject to availability. The returned item
          must be in its original condition—unworn, unwashed, unaltered, and
          with all tags attached. Ranter Store.in reserves the right to reject exchanges
          if the item does not meet these criteria.
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            If the exchange product costs more than the original item, you will
            be prompted to pay the difference amount at the time of exchange.
          </li>
          <li>
            If the exchange product costs less, the remaining balance will be
            issued as a Ranter Store.in gift card, which can be used for future
            purchases on our website.
          </li>
        </ul>
        <p className="mb-4">
          Please note: Exchange is only valid for items bought on Ranter Store.in and
          cannot be processed at physical stores.
        </p>
        <p className="mb-4">
          Items bought on sale or during promotions are eligible for exchange
          only, not for returns or refunds.
        </p>
        <p className="mb-4">Only one exchange request is allowed per order.</p>
        <p className="mb-4">
          To initiate an exchange, follow the steps in our online Return &
          Exchange portal.
        </p>
      </div>
    ),
    IN_STORE: (
      <div>
        <h2 className="text-2xl font-bold mb-4">WARRANTY</h2>
        <p className="mb-4">
          At Ranter Store, we stand behind the quality of our products and want you to
          love every purchase. A 6-Months warranty backs all Ranter Store's India
          products against manufacturing and material defects (excluding normal
          wear and tear).
        </p>
        <p className="mb-4">
          <span className="text-xl font-bold">
            Examples of Manufacturer Defects
          </span>
          : A manufacturer defect is any irregularity or flaw that goes beyond
          normal wear and tear. Here are some examples:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            Stitching Issues: Uneven or frayed stitching affecting structural
            integrity.
          </li>
          <li>
            Faulty Zippers or Buttons: Malfunctioning closures hindering normal
            use.
          </li>
          <li>Misalignment of Pockets: Uneven or misaligned pocket sewing.</li>
          <li>
            Issues with Hardware: Problems with rivets, grommets, or metal
            components.
          </li>
        </ul>

        <p className="mb-4 font-bold">
          Understanding Jeans Warranty: Small Holes and Wear & Tear
        </p>
        <p className="mb-4">
          It's essential to clarify what's covered under our warranty when it
          comes to small holes that appear over time.
        </p>
        <p className="mb-4">
          Our warranty is designed to protect against manufacturing defects,
          such as issues with stitching or material quality. However, normal
          wear and tear—like small holes from regular use—isn't typically
          covered under warranty.
        </p>
        <p className="mb-4">
          Here are more examples of wear and tear that are considered normal
          with regular use of jeans:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            Fading: Over time, jeans naturally fade due to washing and exposure
            to sunlight.
          </li>
          <li>
            Stretching: Fabric can stretch with regular wear, especially in
            areas like the knees and seat.
          </li>
          <li>
            Abrasion: Friction from everyday use can cause slight abrasion on
            fabric surfaces.
          </li>
          <li>
            Minor Pilling: Small balls of fibers may form on the fabric surface,
            particularly in high-friction areas.
          </li>
          <li>
            Color Transfer: Some dye from jeans may transfer onto other fabrics,
            especially when new.
          </li>
          <li>
            Hem Wear: The bottom edge of jeans may show signs of wear or fraying
            over time.
          </li>
          <li>Belt Loops: Belt loops can wear down with frequent belt use.</li>
        </ul>

        <p className="mb-4">How to Initiate a Warranty Claim:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Send an email to info.ranter@gmail.com</li>
          <li>
            Attach pictures of the defect, size label, country label, and
            product style label
          </li>
          <li>
            You will receive an email confirmation when a claim has been
            received
          </li>
          <li>Wait 3-4 business days for processing</li>
        </ul>

        <p className="mb-4">Warranty Program Details:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>
            If we confirm a defect, we'll send you a voucher for a replacement
            at Ranter Store in
          </li>
          <li>The voucher is for one-time use only</li>
          <li>
            Any funds not utilized towards the purchase are non-refundable
          </li>
          <li>Lost or stolen vouchers won't be replaced</li>
          <li>One product per claim, up to six claims every six months</li>
        </ul>

        <p className="mb-4">Photo Instructions:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Send at least two clear images of the defect</li>
          <li>Include clear photos of the size label and product care label</li>
          <li>Images must be sharp and clear, with legible text on tags</li>
        </ul>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="border p-2 rounded">
            <img
              src="https://help.Ranter.com/hc/article_attachments/25597835572749"
              alt="Example of size label"
              className="w-full h-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/300x200?text=Label+Example";
              }}
            />
            <p className="text-sm text-center mt-2">Size Label Example</p>
          </div>
          <div className="border p-2 rounded">
            <img
              src="https://help.Ranter.com/hc/article_attachments/25597855214349"
              alt="Example of care label"
              className="w-full h-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/300x200?text=Care+Label+Example";
              }}
            />
            <p className="text-sm text-center mt-2">Care Label Example</p>
          </div>
        </div>
      </div>
    ),
    FAQS: (
      <div>
        <h2 className="text-2xl font-bold mb-4">FREQUENTLY ASKED QUESTIONS</h2>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg">
              How long does it take to process a return?
            </h3>
            <p className="mt-2">
              Returns are typically processed within 5-7 business days after we
              receive your item.
            </p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg">Can I return sale items?</h3>
            <p className="mt-2">
              Sale items can only be exchanged, not returned for a refund.
            </p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg">
              Do I have to pay for return shipping?
            </h3>
            <p className="mt-2">
              We offer free returns for all domestic orders. International
              returns may incur shipping costs.
            </p>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Returns & Warranty
          </h1>
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
                          ? "bg-yellow-500 text-black shadow-md font-semibold"
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

export default Return;
