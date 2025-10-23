const productsSection = document.getElementById("products-section");
const customersSection = document.getElementById("customers-section");
const ordersSection = document.getElementById("orders-section");
const productsTable = document.getElementById("products-table");
const customersTable = document.getElementById("customers-table");
const ordersTable = document.getElementById("orders-table");

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

// --- PRODUCTS ---
async function loadProducts() {
  try {
    const res = await fetch("http://localhost:3000/api/products");
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();

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
  } catch (err) {
    console.error(err);
    productsTable.innerHTML = `<tr><td colspan="6">Failed to load products</td></tr>`;
  }
}

document
  .getElementById("product-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("product-id").value;
    const product = {
      name: document.getElementById("product-name").value,
      price: parseFloat(document.getElementById("product-price").value),
      category: document.getElementById("product-category").value,
      inStock: parseInt(document.getElementById("product-stock").value),
      imageUrl: document.getElementById("product-image").value,
    };
    const method = id ? "PUT" : "POST";
    const url = id
      ? `http://localhost:3000/api/products/${id}`
      : "http://localhost:3000/api/products";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    if (res.ok) {
      closeModal("productModal");
      loadProducts();
    }
  });

function editProduct(id, name, price, category, stock, imageUrl) {
  document.getElementById("product-id").value = id;
  document.getElementById("product-name").value = decodeURIComponent(name);
  document.getElementById("product-price").value = price;
  document.getElementById("product-category").value =
    decodeURIComponent(category);
  document.getElementById("product-stock").value = stock;
  document.getElementById("product-image").value = decodeURIComponent(imageUrl);
  openModal("productModal");
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  await fetch(`http://localhost:3000/api/products/${id}`, { method: "DELETE" });
  loadProducts();
}

// --- CUSTOMERS ---
function openEditCustomerModal(id, name, email, phone) {
  document.getElementById("customer-id").value = id;
  document.getElementById("customer-name").value = name;
  document.getElementById("customer-email").value = email;
  document.getElementById("customer-phone").value = phone || "";
  openModal("customerModal");
}

document
  .getElementById("customer-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("customer-id").value;
    const updatedCustomer = {
      name: document.getElementById("customer-name").value,
      email: document.getElementById("customer-email").value,
      phone: document.getElementById("customer-phone").value,
    };
    const res = await fetch(`http://localhost:3000/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedCustomer),
    });
    if (res.ok) {
      closeModal("customerModal");
      loadCustomers();
    } else {
      const data = await res.json();
      alert(data.message || "Failed to update customer");
    }
  });

async function deleteCustomer(id) {
  if (!confirm("Delete this customer?")) return;
  const res = await fetch(`http://localhost:3000/api/customers/${id}`, {
    method: "DELETE",
  });
  if (res.ok) loadCustomers();
  else {
    const data = await res.json();
    alert(data.message || "Failed to delete customer");
  }
}

async function loadCustomers() {
  const res = await fetch("http://localhost:3000/api/customers");
  const data = await res.json();
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
}

// --- ORDERS ---
function openEditOrderModal(id, name, address, city, state, zip, total) {
  document.getElementById("order-id").value = id;
  document.getElementById("order-customer-name").value = name;
  document.getElementById("order-address").value = address;
  document.getElementById("order-city").value = city;
  document.getElementById("order-state").value = state;
  document.getElementById("order-zip").value = zip;
  document.getElementById("order-total").value = total;
  openModal("orderModal");
}

async function loadOrders() {
  try {
    const res = await fetch("http://localhost:3000/api/orders");
    if (!res.ok) throw new Error("Failed to fetch orders");
    const orders = await res.json();
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
  } catch (err) {
    console.error(err);
    ordersTable.innerHTML = `<tr><td colspan="6">Failed to load orders</td></tr>`;
  }
}

async function deleteOrder(id) {
  if (!confirm("Are you sure you want to delete this order?")) return;
  const res = await fetch(`http://localhost:3000/api/orders/${id}`, {
    method: "DELETE",
  });
  if (res.ok) loadOrders();
  else {
    const data = await res.json();
    alert(data.message || "Failed to delete order");
  }
}

document.getElementById("order-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("order-id").value;
  const updatedOrder = {
    customer_name: document.getElementById("order-customer-name").value,
    customer_address: document.getElementById("order-address").value,
    customer_city: document.getElementById("order-city").value,
    customer_state: document.getElementById("order-state").value,
    customer_zip: document.getElementById("order-zip").value,
    total: parseFloat(document.getElementById("order-total").value),
  };
  const res = await fetch(`http://localhost:3000/api/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedOrder),
  });
  if (res.ok) closeModal("orderModal"), loadOrders();
  else {
    const data = await res.json();
    alert(data.message || "Failed to update order");
  }
});

// --- MODALS ---
function openModal(modalId) {
  document.getElementById(modalId).classList.remove("hidden");
}
function closeModal(modalId) {
  document.getElementById(modalId).classList.add("hidden");
}

document.getElementById("add-product-btn").addEventListener("click", () => {
  document.getElementById("product-id").value = "";
  document.getElementById("product-name").value = "";
  document.getElementById("product-price").value = "";
  document.getElementById("product-category").value = "";
  document.getElementById("product-stock").value = "1";
  document.getElementById("product-image").value = "";
  openModal("productModal");
});

// --- INITIAL LOAD ---
loadProducts();
loadCustomers();
loadOrders();
