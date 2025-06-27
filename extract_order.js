"use strict";
// ** Write your module here **
// It must send an event "order_details" from the page containing an Order object,
// which describes all the relevant data points on the page.
// The order_details data you are sending should match the `expected_output` object in `test.js`

module.exports = function extract_order() {
  try {
    setTimeout(() => {
      let orderNumber = "";
      const orderNumberMatch = document.body.textContent.match(/Order\s?#(\d+)/);
      if (orderNumberMatch) {
        orderNumber = orderNumberMatch[1];
      }
      console.log("order number:", orderNumber);
      }, 1000);
  } catch (e) {
    console.error(e);
  }
};
