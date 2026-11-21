import { getProduct } from "./api.js";

const productDetails = document.querySelector("#product-details");
const productReviews = document.querySelector("#product-reviews");
const productMessage = document.querySelector("#product-message");

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

function formatPrice(amount) {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK"
  }).format(amount);
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function makeRating(rating) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

function renderProduct(product) {
  const layout = makeElement("div", "product-details-layout");

  // Product image
  const image = makeElement("img", "product-image");
  image.src = product.image?.url || "";
  image.alt = product.image?.alt || product.title;

  // Product information
  const info = makeElement("div", "product-info");

  const heading = makeElement("h1", "", product.title);

  const rating = makeElement("div", "product-rating");
  const stars = makeElement(
    "span",
    "rating-stars",
    makeRating(product.rating)
  );

  const ratingText = makeElement(
    "span",
    "",
    `${product.rating ?? "Not rated"} / 5`
  );

  rating.append(stars, ratingText);

  // Prices
  const prices = makeElement("div", "price-row");

  const hasDiscount =
    typeof product.discountedPrice === "number" &&
    product.discountedPrice < product.price;

  const currentPrice = hasDiscount
    ? product.discountedPrice
    : product.price;

  prices.append(
    makeElement("span", "price", formatPrice(currentPrice))
  );

  if (hasDiscount) {
    prices.append(
      makeElement("span", "old-price", formatPrice(product.price))
    );
  }

  // Description
  const description = makeElement(
    "p",
    "product-description",
    product.description || "No description available."
  );

  // Tags
  const tags = makeElement("div", "product-tags");

  if (Array.isArray(product.tags)) {
    product.tags.forEach((tag) => {
      tags.append(makeElement("span", "product-tag", tag));
    });
  }

  // Buttons
  const actions = makeElement("div", "product-actions");

  const addButton = makeElement("button", "btn", "Add to Cart");
  addButton.type = "button";

  const shareButton = makeElement("button", "share-button", "Share");
  shareButton.type = "button";
  shareButton.setAttribute("aria-label", "Copy product link");

  const feedback = makeElement("p", "product-feedback");
  feedback.setAttribute("role", "status");

  addButton.addEventListener("click", () => {
    // We'll use this same storage key when building login.
    const token = localStorage.getItem("nova_token");

    if (!token) {
      feedback.textContent = "Please log in to add items to your cart.";
      return;
    }

    const cart = JSON.parse(localStorage.getItem("nova_cart") || "[]");

    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: currentPrice,
        image: product.image?.url || "",
        quantity: 1
      });
    }

    localStorage.setItem("nova_cart", JSON.stringify(cart));
    feedback.textContent = `${product.title} added to your cart!`;
  });

  shareButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      feedback.textContent = "Product link copied!";
    } catch {
      feedback.textContent = "Could not copy the link automatically.";
    }
  });

  actions.append(addButton, shareButton);

  info.append(
    heading,
    rating,
    prices,
    description,
    tags,
    actions,
    feedback
  );

  layout.append(image, info);
  productDetails.replaceChildren(layout);
}

function renderReviews(reviews) {
  productReviews.replaceChildren();

  if (!Array.isArray(reviews) || reviews.length === 0) {
    productReviews.textContent = "No customer reviews yet.";
    return;
  }

  const list = makeElement("div", "reviews-list");

  reviews.forEach((review) => {
    const card = makeElement("article", "review-card");

    const author = makeElement(
      "h3",
      "",
      review.username || "Customer"
    );

    const stars = makeElement(
      "div",
      "rating-stars",
      makeRating(review.rating)
    );

    const description = makeElement(
      "p",
      "",
      review.description || ""
    );

    card.append(author, stars, description);
    list.append(card);
  });

  productReviews.append(list);
}

async function loadProduct() {
  if (!productId) {
    productMessage.textContent = "No product was selected.";
    return;
  }

  try {
    const product = await getProduct(productId);

    document.title = `${product.title} | NOVA`;

    renderProduct(product);
    renderReviews(product.reviews);

    productMessage.textContent = "";
  } catch (error) {
    productMessage.textContent =
      error.message || "Could not load this product.";
  }
}

loadProduct();