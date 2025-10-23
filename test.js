// test.js
const fetch = require("node-fetch");

// Replace with your Railway API URL including https
const API_BASE_URL = "https://e-mart-production-a6ef.up.railway.app";
const ENDPOINT = "/api/customers";

async function fetchCustomers() {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINT}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Customers:", data);
  } catch (error) {
    console.error("Error fetching customers:", error.message);
  }
}

fetchCustomers();
