import { getProducts } from "./api.js";

const carouselContent = document.querySelector("#carousel-content");
const carouselCount = document.querySelector("#carousel-count");
const previousButton = document.querySelector("#previous");
const nextButton = document.querySelector("#next");
const productGrid = document.querySelector("#product-grid");
const productStatus = document.querySelector("#product-status");

let featuredProducts = [];
let currentIndex = 0;

function formatPrice(amount) {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK"
  }).format(amount);
}

function productUrl(id) {
  return `./product/index.html?id=${encodeURIComponent(id)}`;
}

function getPriceHtml(product) {
  const hasDiscount =
    typeof product.discountedPrice === "number" &&
    product.discountedPrice < product.price;

  if (hasDiscount) {
    return `
      <div class="price-row">
        <span class="price">${formatPrice(product.discountedPrice)}</span>
        <span class="old-price">${formatPrice(product.price)}</span>
      </div>
    `;
  }

  return `
    <div class="price-row">
      <span class="price">${formatPrice(product.price)}</span>
    </div>
  `;
}

function renderCarousel() {
  if (featuredProducts.length === 0) {
    return;
  }

  const product = featuredProducts[currentIndex];

  carouselContent.replaceChildren();

  const article = document.createElement("article");
  article.className = "carousel-product";

  const image = document.createElement("img");
  image.src = product.image?.url || "";
  image.alt = product.image?.alt || product.title;
  image.loading = "eager";

  const title = document.createElement("h2");
  title.textContent = product.title;

  const price = document.createElement("div");
  price.innerHTML = getPriceHtml(product);

  const link = document.createElement("a");
  link.className = "btn";
  link.href = productUrl(product.id);
  link.textContent = "View product";

  article.append(image, title, price, link);
  carouselContent.append(article);

  carouselCount.textContent =
    `${currentIndex + 1} / ${featuredProducts.length}`;
}

function changeSlide(direction) {
  if (featuredProducts.length === 0) {
    return;
  }

  currentIndex =
    (currentIndex + direction + featuredProducts.length) %
    featuredProducts.length;

  renderCarousel();
}

previousButton.addEventListener("click", () => changeSlide(-1));
nextButton.addEventListener("click", () => changeSlide(1));

function createProductCard(product) {
  const card = document.createElement("a");
  card.className = "product-card";
  card.href = productUrl(product.id);

  const image = document.createElement("img");
  image.src = product.image?.url || "";
  image.alt = product.image?.alt || product.title;
  image.loading = "lazy";

  const content = document.createElement("div");
  content.className = "product-card-content";

  const title = document.createElement("h3");
  title.textContent = product.title;

  const price = document.createElement("div");
  price.innerHTML = getPriceHtml(product);

  content.append(title, price);
  card.append(image, content);

  return card;
}

async function loadHomepage() {
  try {
    const products = await getProducts();

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("No products are available right now.");
    }

    featuredProducts = products.slice(0, 3);
    currentIndex = 0;

    renderCarousel();

    const cards = products.slice(0, 12).map(createProductCard);
    productGrid.replaceChildren(...cards);

    productStatus.textContent =
      `Showing ${cards.length} products.`;
  } catch (error) {
    carouselContent.textContent = "Featured products could not be loaded.";
    carouselCount.textContent = "—";
    productStatus.textContent =
      error.message || "Something went wrong while loading products.";
  }
}

loadHomepage();