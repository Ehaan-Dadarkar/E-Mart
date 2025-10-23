// Base URL for Railway deployment
const API_BASE_URL = "https://e-mart-production-78cf.up.railway.app";

// DOM Elements
const productListDiv = document.getElementById("product-list");
const cartItemsList = document.getElementById("cart-items");
const cartTotalSpan = document.getElementById("cart-subtotal");
const productsSection = document.getElementById("products-section");
const cartSection = document.getElementById("cart-section");
const productsLink = document.getElementById("products-link");
const cartLink = document.getElementById("cart-link");
const addressForm = document.getElementById("address-form");
const saveAddressButton = document.getElementById("save-address");
const addressButton = document.getElementById("address-button");
const addressDisplay = document.getElementById("address-display");
const loginButton = document.getElementById("login-button");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const usernameDisplay = document.getElementById("username-display");
const logoutButton = document.getElementById("logout-button");
const openCartButton = document.getElementById("open-cart");
const openProductsButton = document.getElementById("open-products");

// State
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let address = JSON.parse(localStorage.getItem("address")) || {};
let userId = localStorage.getItem("userId");
let userName = localStorage.getItem("userName") || "";

// NAV LINK ACTIVE STATE
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-link")
      .forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
  });
});

// INITIAL UI
function applyInitialUI() {
  updateAddressDisplay();
  updateLoginButton();
  updateCartBadge();
}

// LOGIN / LOGOUT
function updateLoginButton() {
  if (userId) {
    loginButton.classList.add("hidden");
    usernameDisplay.textContent = ` ${userName}`;
    logoutButton.classList.remove("hidden");
  } else {
    loginButton.classList.remove("hidden");
    usernameDisplay.textContent = "";
    logoutButton.classList.add("hidden");
  }
}

// ADDRESS DISPLAY
function updateAddressDisplay() {
  if (address && address.name) {
    addressDisplay.textContent = `Shipping to: ${address.name}`;
    addressButton.textContent = "Change Address";
  } else {
    addressDisplay.textContent = `No shipping address added yet.`;
    addressButton.textContent = "Add Address";
  }
}

// SHOW SECTIONS
function showProducts() {
  productsSection.classList.remove("hidden");
  cartSection.classList.add("hidden");
}
function showCart() {
  productsSection.classList.add("hidden");
  cartSection.classList.remove("hidden");
  updateCartDisplay();
}

// NAV EVENTS
productsLink.addEventListener("click", (e) => {
  e.preventDefault();
  showProducts();
});
cartLink.addEventListener("click", (e) => {
  e.preventDefault();
  showCart();
});
openCartButton.addEventListener("click", showCart);
openProductsButton.addEventListener("click", () => {
  showProducts();
});

// SAVE ADDRESS
saveAddressButton.addEventListener("click", () => {
  address = {
    name: document.getElementById("name").value,
    address: document.getElementById("address").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    zip: document.getElementById("zip").value,
  };
  localStorage.setItem("address", JSON.stringify(address));
  updateAddressDisplay();
  $("#addressModal").modal("hide");
});

// CART BADGE
function updateCartBadge() {
  const badge = document.getElementById("cart-count-badge");
  badge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// FETCH PRODUCTS & RENDER
let products = [];
fetch(`${API_BASE_URL}/api/products`)
  .then((res) => res.json())
  .then((data) => {
    products = data;
    renderProducts();
  });

function renderProducts() {
  productListDiv.innerHTML = products
    .map(
      (p) => `
    <div class="w-full sm:w-1/2 md:w-1/3 p-3">
      <div class="rounded-xl shadow-md flex flex-col h-full overflow-hidden hover:shadow-xl transition-shadow duration-300" style="background-color:#1F2937;">
        <div class="h-80 flex items-center justify-center p-4" style="background-color:#111827;">
          <img src="${p.imageUrl || "placeholder.jpg"}" alt="${
        p.name
      }" class="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105" />
        </div>
        <div class="p-5 flex flex-col flex-grow">
          <h5 class="text-lg font-semibold mb-2 text-[#F9FAFB] truncate" title="${
            p.name
          }">${p.name}</h5>
          <p class="text-[#F9FAFB] font-medium mb-2">₹${p.price}</p>
          <p class="text-sm ${
            p.inStock === 1 ? "text-green-400" : "text-red-400"
          } mb-4 font-medium">
            ${p.inStock === 1 ? "In Stock" : "Out of Stock"}
          </p>
          <button class="add-to-cart mt-auto px-4 py-2 rounded-lg font-medium ${
            p.inStock === 1
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-500 text-gray-200 cursor-not-allowed"
          } transition-colors duration-200" data-product-id="${p.id}" ${
        p.inStock === 1 ? "" : "disabled"
      }>
            ${p.inStock === 1 ? "Add to Cart" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = parseInt(btn.dataset.productId);
      const product = products.find((p) => p.id === productId);
      if (!product || Number(product.inStock) !== 1)
        return alert("This product is out of stock.");
      const existing = cart.find((item) => item.id === productId);
      if (existing) {
        existing.quantity++;
        existing.total = (
          parseFloat(existing.price) * existing.quantity
        ).toFixed(2);
      } else {
        cart.push({
          ...product,
          quantity: 1,
          total: parseFloat(product.price).toFixed(2),
        });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartDisplay();
      updateCartBadge();
    });
  });
}

// UPDATE CART DISPLAY
function updateCartDisplay() {
  cartItemsList.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center bg-gray-800 text-white";
    li.style = "border-radius:15px";
    li.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <span>${item.name}</span>
        <div class="quantity-control d-flex align-items-center" style="padding-left: 20px;">
          <button class="btn btn-sm btn-secondary quantity-btn minus" data-index="${index}">-</button>
          <span class="mx-2 quantity-display">${item.quantity}</span>
          <button class="btn btn-sm btn-secondary quantity-btn plus" data-index="${index}">+</button>
        </div>
      </div>
      <button class="btn btn-danger btn-sm remove-from-cart m-3" data-index="${index}">×</button>
    `;
    cartItemsList.appendChild(li);
    total += parseFloat(item.total);
  });

  cartTotalSpan.textContent = total.toFixed(2);
  updateCartBadge();

  document.querySelectorAll(".quantity-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.index;
      cart[idx].quantity = btn.classList.contains("minus")
        ? Math.max(1, cart[idx].quantity - 1)
        : cart[idx].quantity + 1;
      cart[idx].total = (
        parseFloat(cart[idx].price) * cart[idx].quantity
      ).toFixed(2);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartDisplay();
      updateCartBadge();
    });
  });

  document.querySelectorAll(".remove-from-cart").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.dataset.index;
      cart.splice(idx, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartDisplay();
      updateCartBadge();
    });
  });
}

// CHECKOUT
document.getElementById("checkout-button").addEventListener("click", () => {
  if (!userId) return alert("Login required.");
  if (!address || !address.name) return alert("Add shipping address.");
  if (!cart.length) return alert("Your cart is empty.");

  const total = parseFloat(cartTotalSpan.textContent);
  const itemsPayload = cart.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    total: item.total,
  }));

  fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...address, userId, total, items: itemsPayload }),
  })
    .then((res) => res.json().then((data) => ({ status: res.status, data })))
    .then(({ status, data }) => {
      if (status === 201) {
        alert("Checkout completed!");
        cart = [];
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartDisplay();
      } else alert(data.message || "Checkout failed!");
    })
    .catch((err) => {
      console.error(err);
      alert("Checkout failed!");
    });
});

// AUTH
loginButton.addEventListener("click", () => $("#authModal").modal("show"));
loginTab.addEventListener("click", () => toggleAuthForms(true));
registerTab.addEventListener("click", () => toggleAuthForms(false));

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (res.ok) {
    userId = data.userId;
    userName = data.name;
    localStorage.setItem("userId", userId);
    localStorage.setItem("userName", userName);
    updateLoginButton();
    $("#authModal").modal("hide");
  } else alert(data.message);
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const phone = document.getElementById("register-phone").value;
  const password = document.getElementById("register-password").value;
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password }),
  });
  const data = await res.json();
  if (res.ok) {
    alert(data.message);
    toggleAuthForms(true);
    $("#authModal").modal("hide");
  } else alert(data.message);
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  userId = null;
  userName = "";
  updateLoginButton();
});

function toggleAuthForms(showLogin) {
  if (showLogin) {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
  } else {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    loginTab.classList.remove("active");
    registerTab.classList.add("active");
  }
}

// INIT
showProducts();
applyInitialUI();
