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

    // subtotal only in querystring in url
    const extractSubtotal = () => {
      const iframeSrc = document.querySelector(
        'iframe[src*="tap.walmart.com"]',
      )?.src;
      return (
        new URLSearchParams(iframeSrc?.split("?")[1]).get("subtotal") || ""
      );
    };

    const extractOrderNumber = () => {
      const match = text.match(/Order\s?#(\d+)/);
      return match ? match[1] : "";
    };

    const extractGrandTotal = () => {
      const match = text.match(/\$(\d+\.\d{2})\s+\|/);
      return match ? match[1] : "";
    };

    const extractTax = (subtotal, grandTotal) => {
      if (!subtotal || !grandTotal) return "";
      const tax = parseFloat(grandTotal) - parseFloat(subtotal);
      return tax.toFixed(2);
    };

    const extractShipping = (subtotal, grandTotal, tax) => {
      const text = getTextContent().toLowerCase();

      if (text.includes("free shipping")) {
        return "0";
      }

      const cartTotal = parseFloat(grandTotal);
      const sub = parseFloat(subtotal);
      const t = parseFloat(tax);

      if ([cartTotal, sub, t].some(isNaN)) return "";

      const shipping = cartTotal - sub - t;
      return shipping.toFixed(2);
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

    const extractProducts = () => {
      const iframeSrc = document.querySelector(
        'iframe[src*="tap.walmart.com"]',
      )?.src;
      if (!iframeSrc) return [];

      const params = new URLSearchParams(iframeSrc.split("?")[1]);
      const prices = params.get("item_prices")?.split(",") || [];
      const quantities =
        params
          .get("item_quantities")
          ?.split(",")
          .map((q) => parseInt(q)) || [];

      const productImgs = Array.from(
        document.querySelectorAll('[data-testid="collapsedItemList"] img[alt]'),
      );

      return productImgs.map((img, index) => {
        const name = img.alt.trim();
        const unitPrice = prices[index] || "0.00";
        const quantity = quantities[index] || 1;
        const lineTotal = (parseFloat(unitPrice) * quantity).toFixed(2);

        return {
          "Product Name": name,
          "Unit Price": unitPrice,
          Quantity: quantity.toString(),
          "Line Total": lineTotal,
        };
      });
    };

    const orderNumber = extractOrderNumber();
    const grandTotal = extractGrandTotal();
    const subtotal = extractSubtotal();
    const tax = extractTax(subtotal, grandTotal);
    const shipping = extractShipping(subtotal, grandTotal, tax);
    const paymentType = extractPaymentType();
    const products = extractProducts();

    const order = {
      "Order Number": orderNumber,
      Products: products,
      Shipping: shipping,
      Subtotal: subtotal,
      "Grand Total": grandTotal,
      Tax: tax,
      "Payment Type": paymentType,
    };

    const event = new CustomEvent("order_details", { detail: order });
    document.dispatchEvent(event);
  } catch (e) {
    console.error(e);
  }
};
