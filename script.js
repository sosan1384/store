const productList = document.getElementById("product-list");
const statusMessage = document.getElementById("status-message");
const searchInput = document.getElementById("search-input");
const cartPanel = document.getElementById("cart-panel");
const overlay = document.getElementById("overlay");
const cartItemsElement = document.getElementById("cart-items");
const cartCountElement = document.getElementById("cart-count");
const cartTotalElement = document.getElementById("cart-total");

const API_URL = "https://fakestoreapi.com/products";
let products = [];
let cart = [];
let activeFilter = "all";

async function loadProducts() {
  statusMessage.textContent = "در حال دریافت محصولات...";
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("API request failed");
    products = await response.json();
  } catch (error) {
    console.warn("API unavailable; using sample products.", error);
    products = getFallbackProducts();
    statusMessage.textContent = "اتصال به API برقرار نشد؛ محصولات نمونه نمایش داده می‌شوند.";
  }
  applyFilters();
}

function getFallbackProducts() {
  return [
    { id: 101, title: "هدفون بی‌سیم", category: "electronics", price: 29.99, description: "هدفون مناسب برای موسیقی و استفاده روزانه.", image: "https://placehold.co/500x500?text=Headphones" },
    { id: 102, title: "ساعت هوشمند", category: "electronics", price: 49.50, description: "ساعت هوشمند با طراحی ساده و کاربردی.", image: "https://placehold.co/500x500?text=Smart+Watch" },
    { id: 103, title: "زیورآلات ظریف", category: "jewelery", price: 35.00, description: "انتخابی ساده و زیبا برای هر روز.", image: "https://placehold.co/500x500?text=Jewelry" },
    { id: 104, title: "لباس روزمره", category: "women's clothing", price: 59.00, description: "لباسی راحت برای استفاده روزانه.", image: "https://placehold.co/500x500?text=Fashion" },
    { id: 105, title: "کیف دستی", category: "women's clothing", price: 42.00, description: "کیف سبک با طراحی مینیمال.", image: "https://placehold.co/500x500?text=Bag" },
    { id: 106, title: "پوشاک مردانه", category: "men's clothing", price: 39.00, description: "استایلی ساده و کاربردی.", image: "https://placehold.co/500x500?text=Mens+Wear" }
  ];
}

function formatPrice(price) {
  return `${Number(price).toFixed(2)} افغانی`;
}

function getCategoryLabel(category) {
  const labels = {
    electronics: "تکنولوژی",
    jewelery: "زیورآلات",
    "men's clothing": "پوشاک مردانه",
    "women's clothing": "پوشاک زنانه"
  };
  return labels[category] || "منتخب";
}

function renderProducts(items) {
  productList.innerHTML = "";
  if (!items.length) {
    productList.innerHTML = '<p class="status-message">محصولی با این مشخصات پیدا نشد.</p>';
    return;
  }

  items.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const imageWrap = document.createElement("div");
    imageWrap.className = "product-image-wrap";

    const image = document.createElement("img");
    image.className = "product-image";
    image.src = product.image;
    image.alt = product.title;
    image.loading = "lazy";
    image.onerror = () => { image.src = "https://placehold.co/500x500?text=Product"; };

    const tag = document.createElement("span");
    tag.className = "product-tag";
    tag.textContent = getCategoryLabel(product.category);

    imageWrap.append(image, tag);

    const info = document.createElement("div");
    info.className = "product-info";

    const title = document.createElement("h3");
    title.textContent = product.title;

    const description = document.createElement("p");
    description.className = "product-description";
    description.textContent = product.description || "توضیحی برای این محصول ثبت نشده است.";

    const bottom = document.createElement("div");
    bottom.className = "product-bottom";

    const price = document.createElement("span");
    price.className = "price";
    price.textContent = formatPrice(product.price);

    const button = document.createElement("button");
    button.className = "add-button";
    button.textContent = "افزودن به سبد +";
    button.addEventListener("click", () => addToCart(product.id));

    bottom.append(price, button);
    info.append(title, description, bottom);
    card.append(imageWrap, info);
    productList.appendChild(card);
  });
}

function applyFilters() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = products.filter(product => {
    const matchesCategory = activeFilter === "all" || product.category === activeFilter;
    const matchesSearch = product.title.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });
  renderProducts(filtered);
}

function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll(".filter-chip").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });
  applyFilters();
}

document.querySelectorAll(".filter-chip").forEach(button => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

document.querySelectorAll(".category-card").forEach(card => {
  card.addEventListener("click", () => {
    const category = card.dataset.category;
    setFilter(category);
  });
});

searchInput.addEventListener("input", applyFilters);

function addToCart(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;
  const existing = cart.find(item => item.id === productId);
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  renderCart();
}

function changeQuantity(productId, amount) {
  const item = cart.find(product => product.id === productId);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart = cart.filter(product => product.id !== productId);
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  renderCart();
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCountElement.textContent = count;
  cartTotalElement.textContent = formatPrice(total);
  cartItemsElement.innerHTML = "";

  if (!cart.length) {
    cartItemsElement.innerHTML = '<p class="empty-cart">سبد خریدت هنوز خالی است.</p>';
    return;
  }

  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-item";

    const image = document.createElement("img");
    image.src = item.image;
    image.alt = item.title;

    const details = document.createElement("div");
    const title = document.createElement("h4");
    title.textContent = item.title;
    const price = document.createElement("small");
    price.textContent = formatPrice(item.price);

    const controls = document.createElement("div");
    controls.className = "quantity-controls";

    const minus = document.createElement("button");
    minus.textContent = "−";
    minus.setAttribute("aria-label", "کم کردن تعداد");
    minus.addEventListener("click", () => changeQuantity(item.id, -1));

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity;

    const plus = document.createElement("button");
    plus.textContent = "+";
    plus.setAttribute("aria-label", "زیاد کردن تعداد");
    plus.addEventListener("click", () => changeQuantity(item.id, 1));

    controls.append(minus, quantity, plus);
    details.append(title, price, controls);

    const remove = document.createElement("button");
    remove.className = "remove-button";
    remove.textContent = "حذف";
    remove.addEventListener("click", () => removeFromCart(item.id));

    row.append(image, details, remove);
    cartItemsElement.appendChild(row);
  });
}

function openCart() {
  cartPanel.classList.add("open");
  overlay.classList.add("show");
}
function closeCart() {
  cartPanel.classList.remove("open");
  overlay.classList.remove("show");
}

document.getElementById("cart-toggle").addEventListener("click", openCart);
document.getElementById("cart-close").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

document.getElementById("checkout-button").addEventListener("click", () => {
  const message = document.getElementById("checkout-message");
  message.textContent = cart.length
    ? "این نسخه نمایشی است؛ برای سفارش واقعی باید بخش پرداخت و سرور اضافه شود."
    : "ابتدا محصولی به سبد خرید اضافه کن.";
});

loadProducts();
renderCart();
