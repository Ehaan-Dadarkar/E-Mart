const productsSection = document.getElementById("products-section");
const customersSection = document.getElementById("customers-section");
const ordersSection = document.getElementById("orders-section");
const productsTable = document.getElementById("products-table");
const customersTable = document.getElementById("customers-table");
const ordersTable = document.getElementById("orders-table");

// Replace with your Railway deployment URL
const API_BASE_URL = "https://e-mart-production-78cf.up.railway.app";

// --- NAV HANDLERS ---
document.getElementById("products-link").addEventListener("click", () => {
  productsSection.classList.remove("hidden");
  customersSection.classList.add("hidden");
  ordersSection.classList.add("hidden");
  setActiveNav("products-link");
});
document.getElementById("customers-link").addEventListener("click", () => {
  customersSection.classList.remove("hidden");
  productsSection.classList.add("hidden");
  ordersSection.classList.add("hidden");
  setActiveNav("customers-link");
});
document.getElementById("orders-link").addEventListener("click", () => {
  ordersSection.classList.remove("hidden");
  customersSection.classList.add("hidden");
  productsSection.classList.add("hidden");
  setActiveNav("orders-link");
});

function setActiveNav(id) {
  document
    .querySelectorAll(".nav-link")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// --- FETCH HELPER ---
async function fetchAPI(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      credentials: "include", // important if your API uses cookies/session
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "API request failed");
    }
    return await res.json();
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err.message);
    throw err;
  }
}

// --- PRODUCTS ---
async function loadProducts() {
  try {
    const data = await fetchAPI("/api/products");
    productsTable.innerHTML = data
      .map((p) => {
        const price = parseFloat(p.price) || 0;
        const imageUrl = p.imageUrl || "";
        const name = p.name || "";
        const category = p.category || "";
        return `
<tr>
  <td>${
    imageUrl
      ? `<img src="${imageUrl}" alt="${name}" class="w-12 h-12 object-cover rounded"/>`
      : ""
  }</td>
  <td>${name}</td>
  <td>$${price.toFixed(2)}</td>
  <td>${category}</td>
  <td>${p.inStock == 1 ? "Yes" : "No"}</td>
  <td class="table-actions">
    <button class="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500" onclick="editProduct(${
      p.id
    }, '${encodeURIComponent(name)}', ${price}, '${encodeURIComponent(
          category
        )}', ${p.inStock}, '${encodeURIComponent(imageUrl)}')">Edit</button>
    <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onclick="deleteProduct(${
      p.id
    })">Delete</button>
  </td>
</tr>`;
      })
      .join("");
  } catch {
    productsTable.innerHTML = `<tr><td colspan="6">Failed to load products</td></tr>`;
  }
}

// --- CUSTOMERS ---
async function loadCustomers() {
  try {
    const data = await fetchAPI("/api/customers");
    customersTable.innerHTML = data
      .map(
        (c) => `
<tr>
  <td>${c.id}</td>
  <td>${c.name}</td>
  <td>${c.email}</td>
  <td>${c.phone || ""}</td>
  <td class="table-actions">
    <button class="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500" onclick="openEditCustomerModal(${
      c.id
    }, '${c.name}', '${c.email}', '${c.phone || ""}')">Edit</button>
    <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onclick="deleteCustomer(${
      c.id
    })">Delete</button>
  </td>
</tr>`
      )
      .join("");
  } catch {
    customersTable.innerHTML = `<tr><td colspan="5">Failed to load customers</td></tr>`;
  }
}

// --- ORDERS ---
async function loadOrders() {
  try {
    const orders = await fetchAPI("/api/orders");
    ordersTable.innerHTML = orders
      .map((o) => {
        let items = [];
        try {
          items = JSON.parse(o.items);
        } catch {}
        return `
<tr>
  <td>${o.id}</td>
  <td>${o.customer_name}</td>
  <td>$${parseFloat(o.total).toFixed(2)}</td>
  <td>${items.map((i) => `${i.name} x${i.quantity}`).join(", ")}</td>
  <td>${o.customer_address}, ${o.customer_city}, ${o.customer_state}, ${
          o.customer_zip
        }</td>
  <td class="table-actions">
    <button class="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500" onclick="openEditOrderModal(${
      o.id
    }, '${o.customer_name}', '${o.customer_address}', '${o.customer_city}', '${
          o.customer_state
        }', '${o.customer_zip}', ${o.total})">Edit</button>
    <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onclick="deleteOrder(${
      o.id
    })">Delete</button>
  </td>
</tr>`;
      })
      .join("");
  } catch {
    ordersTable.innerHTML = `<tr><td colspan="6">Failed to load orders</td></tr>`;
  }
}

// --- INITIAL LOAD ---
loadProducts();
loadCustomers();
loadOrders();
