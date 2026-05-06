// =========================
// NAVBAR
// =========================

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("active");
  navLinks.classList.toggle("show");
});

// Dark mode
const themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark")
    ? "☀️"
    : "🌙";
});

// =========================
// KOSÁR
// =========================

const cartButton = document.getElementById("cart-button");
const cartModal = document.getElementById("cart-modal");
const closeModal = document.getElementById("close-modal");

const cartItemsList = document.getElementById("cart-items");
const cartTotalPrice = document.getElementById("cart-total-price");
const cartCount = document.querySelector(".cart-count");
const checkoutBtn = document.getElementById("checkout-btn");

let cart = [];

cartButton.addEventListener("click", () => {
  cartModal.classList.toggle("show");
  cartModal.classList.toggle("hidden");
});

closeModal.addEventListener("click", () => {
  cartModal.classList.remove("show");
  cartModal.classList.add("hidden");
});

function updateCart() {
  cartItemsList.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItemsList.innerHTML = "<li>Még nincs termék a kosárban.</li>";
  } else {
    cart.forEach((item, index) => {
      const li = document.createElement("li");

      li.innerHTML = `
        ${item.name} - ${item.quantity} db - ${(item.price * item.quantity).toLocaleString()} Ft
        <button class="remove-btn" data-index="${index}">❌</button>
      `;

      cartItemsList.appendChild(li);
      total += item.price * item.quantity;
    });
  }

  cartTotalPrice.textContent = `${total.toLocaleString()} Ft`;
  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index);
      cart.splice(index, 1);
      updateCart();
    });
  });
}

// Checkout
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("A kosár üres!");
    return;
  }
  window.location.href = "thankyou.html";
});

// =========================
// TERMÉKEK + SZŰRÉS
// =========================

const productList = document.getElementById("product-list");
const categoryFilter = document.getElementById("category-filter");
const filterButtons = document.querySelectorAll(".filter-btn");

let allProducts = [];
let filteredProducts = [];

//  API + JSON kompatibilis betöltés
async function loadProducts(source) {
  try {
    const url = source.startsWith("http") ? source : `./${source}`;

    const response = await fetch(url);
    const data = await response.json();

    // többféle backend formátum kezelése
    if (Array.isArray(data)) {
      allProducts = data;
    } else if (data.data) {
      allProducts = data.data;
    } else if (data.products) {
      allProducts = data.products;
    } else {
      throw new Error("Ismeretlen JSON struktúra");
    }

    populateCategories(allProducts);
    applyFilters();
  } catch (error) {
    console.error("Hiba:", error);
    productList.innerHTML = "<p>Hiba történt az adatok betöltésekor 😢</p>";
  }
}

// KORÁBBI BETÖLTÉS, de így se töltötte be a Tanárnő apiját CORS hibára hivatkozva:
// async function loadProducts() {
//   try {
//     const response = await fetch(
//       "https://info.nytta.hu/web/api/gyumolcsok/minden",
//     );
//     const data = await response.json();

//     products = data;
//     renderProducts(products);
//   } catch (error) {
//     console.error(error);
//   }
// }

// kategóriák
function populateCategories(products) {
  if (!Array.isArray(products)) return;

  categoryFilter.innerHTML = `<option value="all">Minden kategória</option>`;

  const categories = [...new Set(products.map((p) => p.category))];

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// kombinált szűrés
function applyFilters() {
  const selectedCategory = categoryFilter.value;

  filteredProducts = allProducts.filter((product) => {
    if (selectedCategory === "all") return true;
    return product.category === selectedCategory;
  });

  renderProducts(filteredProducts);
}

// gombok (JSON + API)
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    loadProducts(btn.dataset.file);
  });
});

// dropdown
categoryFilter.addEventListener("change", applyFilters);

// =========================
// RENDER
// =========================

function renderProducts(products) {
  productList.innerHTML = "";

  if (!products || products.length === 0) {
    productList.innerHTML = "<p>Nincs találat 😢</p>";
    return;
  }

  products.forEach((product) => {
    const div = document.createElement("div");
    div.className = "product-card";

    // többféle adatforrás támogatás
    const price = Number(product.price || product.price_huf || 0);
    const image = product.image || product.picture;
    const available =
      product.available !== undefined
        ? product.available
        : Number(product.stock) > 0;

    div.innerHTML = `
      <img src="${image}" alt="${product.name}" class="product-image">
      <h2 class="product-name">${product.name}</h2>
      <p class="product-price">${price.toLocaleString()} Ft</p>
      ${
        available
          ? `<button class="btn-primary add-to-cart">Kosárba</button>`
          : "Előjegyezhető"
      }
      ${Number(product.stock) < 0 ? `<p>Szezonális</p>` : ""}
    `;

    const button = div.querySelector(".add-to-cart");

    if (button) {
      button.addEventListener("click", () => {
        const existingItem = cart.find((item) => item.id === product.id);

        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: price,
            quantity: 1,
          });
        }

        updateCart();
      });
    }

    productList.appendChild(div);
  });
}

// =========================
// INIT
// =========================

document.addEventListener("DOMContentLoaded", () => {
  //  API alapértelmezett - külső api-ról
  // loadProducts("https://hur.webmania.cc/products.json");
  // 👉 API - tanárnőtől - szűréssel:
  loadProducts("https://info.nytta.hu/web/api/gyumolcsok/minden");
  // loadProducts("https://info.nytta.hu/web/api/gyumolcsok/keszleten/mind");
  // loadProducts("https://info.nytta.hu/web/api/gyumolcsok/keszleten/szezonalis");
  // loadProducts("https://info.nytta.hu/web/api/gyumolcsok/keszleten/raktaron");
  // loadProducts("https://info.nytta.hu/web/api/gyumolcsok/keszleten/rendelheto");

  //  lokális megoldásom:
  // loadProducts("minden.json");
});
