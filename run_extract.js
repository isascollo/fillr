// run-extract.js
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const extractOrder = require("./extract_order");

const html = fs.readFileSync(path.join(__dirname, "walmart_order.html"), "utf-8");
const dom = new JSDOM(html, { runScripts: "dangerously" });

global.window = dom.window;
global.document = dom.window.document;

extractOrder();