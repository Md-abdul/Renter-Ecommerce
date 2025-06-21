import React from "react";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-6">
      <div className="max-w-3xl w-full bg-white p-12 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
          Get in Touch
        </h1>

        <p className="text-lg text-gray-600 text-center mb-6">
          We'd love to hear from you! Fill out the form below and we'll get back
          to you as soon as possible.
        </p>

        <form className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-lg font-medium text-gray-800"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-lg font-medium text-gray-800"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
              placeholder="john.doe@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-lg font-medium text-gray-800"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows="4"
              className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
              placeholder="Write your message here..."
            ></textarea>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full py-3 px-6 border border-transparent rounded-lg shadow-md text-lg font-semibold text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all duration-300"
            >
              Send Message
            </button>
          </div>
        </form>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Other Ways to Reach Us
          </h2>
          <div className="space-y-2 text-lg text-gray-700">
            <p>
              Email:{" "}
              <a
                href="mailto:info.ranter@gmail.com"
                className="text-yellow-600 hover:underline"
              >
                info.ranter@gmail.com
              </a>
            </p>
            <p>
              Phone:{" "}
              <a
                href="tel:9029297732"
                className="text-yellow-600 hover:underline"
              >
                9029297732
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
