"use strict";
// ** Write your module here **
// It must send an event "order_details" from the page containing an Order object,
// which describes all the relevant data points on the page.
// The order_details data you are sending should match the `expected_output` object in `test.js`

const PaymentType = {
  VISA: "Visa",
  MASTERCARD: "MasterCard",
  AMEX: "Amex",
  UNKNOWN: "Unknown",
};

const getTextContent = () => document?.body?.textContent || "";

module.exports = function extract_order() {
  try {
    const text = getTextContent();
    if (!text) throw new Error("DOM not ready");

    const extractOrderNumber = () => {
      const match = text.match(/Order\s?#(\d+)/);
      return match ? match[1] : "";
    };

    const extractGrandTotal = () => {
      const match = text.match(/\$(\d+\.\d{2})\s+\|/);
      return match ? match[1] : "";
    };

    const extractPaymentType = () => {
      const img = document.querySelector(
        'img[alt*="Visa"], img[alt*="MasterCard"], img[alt*="Amex"]',
      );
      const alt = img?.alt?.toLowerCase() || "";

      if (alt.includes("visa")) return PaymentType.VISA;
      if (alt.includes("mastercard")) return PaymentType.MASTERCARD;
      if (alt.includes("amex")) return PaymentType.AMEX;

      return PaymentType.UNKNOWN;
    };

    const order = {
      "Order Number": extractOrderNumber(),
      Products: [],
      Shipping: "0",
      Subtotal: "",
      "Grand Total": extractGrandTotal(),
      Tax: "",
      "Payment Type": extractPaymentType(),
    };

    console.log(order);
  } catch (e) {
    console.error(e);
  }
};
