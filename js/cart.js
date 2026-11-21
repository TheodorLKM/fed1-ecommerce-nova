const cartItems = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const cartMessage = document.querySelector("#cart-message");
const cartSubtotal = document.querySelector("#cart-subtotal");
const cartTotal = document.querySelector("#cart-total");
const clearCartButton = document.querySelector("#clear-cart");
const checkoutLink = document.querySelector("#checkout-link");

function formatPrice(amount) {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK"
  }).format(amount);
}

function getCart() {
  try {
    const storedCart = JSON.parse(
      localStorage.getItem("nova_cart") || "[]"
    );

    if (!Array.isArray(storedCart)) {
      return [];
    }

    return storedCart.filter((item) =>
      item &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      typeof item.price === "number" &&
      Number.isFinite(item.price) &&
      item.price >= 0 &&
      Number.isSafeInteger(item.quantity) &&
      item.quantity > 0
    );
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("nova_cart", JSON.stringify(cart));
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function changeQuantity(id, amount) {
  const cart = getCart();
  const item = cart.find((product) => product.id === id);

  if (!item) {
    return;
  }

  const newQuantity = item.quantity + amount;

  if (newQuantity < 1) {
    return;
  }

  if (!Number.isSafeInteger(newQuantity)) {
    return;
  }

  item.quantity = newQuantity;

  saveCart(cart);
  renderCart();
}

function removeItem(id) {
  const updatedCart = getCart().filter(
    (product) => product.id !== id
  );

  saveCart(updatedCart);
  cartMessage.textContent = "Product removed from your cart.";
  renderCart();
}

function createCartItem(item) {
  const article = createElement("article", "cart-item");

  // Product image
  const image = createElement("img", "cart-item-image");
  image.src = item.image || "";
  image.alt = item.title;
  image.loading = "lazy";

  // Product information
  const info = createElement("div", "cart-item-info");

  const heading = createElement("h3");
  const productLink = createElement("a", "", item.title);
  productLink.href =
    `../product/index.html?id=${encodeURIComponent(item.id)}`;

  heading.append(productLink);

  const unitPrice = createElement(
    "p",
    "cart-item-price",
    formatPrice(item.price)
  );

  // Quantity controls
  const actions = createElement("div", "cart-item-actions");
  const quantityControl = createElement("div", "quantity-control");

  const decreaseButton = createElement("button", "", "−");
  decreaseButton.type = "button";
  decreaseButton.setAttribute(
    "aria-label",
    `Decrease quantity of ${item.title}`
  );
  decreaseButton.disabled = item.quantity <= 1;

  decreaseButton.addEventListener("click", () => {
    changeQuantity(item.id, -1);
  });

  const quantity = createElement(
    "span",
    "",
    String(item.quantity)
  );
  quantity.setAttribute("aria-label", "Quantity");

  const increaseButton = createElement("button", "", "+");
  increaseButton.type = "button";
  increaseButton.setAttribute(
    "aria-label",
    `Increase quantity of ${item.title}`
  );

  increaseButton.addEventListener("click", () => {
    changeQuantity(item.id, 1);
  });

  quantityControl.append(
    decreaseButton,
    quantity,
    increaseButton
  );

  // Remove button
  const removeButton = createElement(
    "button",
    "remove-item",
    "Remove"
  );
  removeButton.type = "button";
  removeButton.setAttribute(
    "aria-label",
    `Remove ${item.title} from cart`
  );

  removeButton.addEventListener("click", () => {
    removeItem(item.id);
  });

  actions.append(quantityControl, removeButton);

  const lineTotal = createElement(
    "p",
    "cart-item-total",
    `Item total: ${formatPrice(item.price * item.quantity)}`
  );

  info.append(heading, unitPrice, actions, lineTotal);
  article.append(image, info);

  return article;
}

function renderCart() {
  const cart = getCart();

  cartItems.replaceChildren();

  const totalQuantity = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  cartCount.textContent =
    `${totalQuantity} ${totalQuantity === 1 ? "item" : "items"} in your cart`;

  cartSubtotal.textContent = formatPrice(subtotal);
  cartTotal.textContent = formatPrice(subtotal);

  const isEmpty = cart.length === 0;

  clearCartButton.disabled = isEmpty;
  checkoutLink.setAttribute("aria-disabled", String(isEmpty));

  if (isEmpty) {
    checkoutLink.removeAttribute("href");
    checkoutLink.tabIndex = -1;

    const emptyState = createElement("div", "cart-empty");
    const title = createElement(
      "h2",
      "",
      "Your cart is empty"
    );
    const description = createElement(
      "p",
      "",
      "Discover something you'll love at NOVA."
    );

    const shopLink = createElement(
      "a",
      "btn",
      "Explore products"
    );
    shopLink.href = "../index.html#products";

    emptyState.append(title, description, shopLink);
    cartItems.append(emptyState);

    return;
  }

  checkoutLink.href = "../checkout/index.html";
  checkoutLink.tabIndex = 0;

  const cards = cart.map(createCartItem);
  cartItems.append(...cards);
}

clearCartButton.addEventListener("click", () => {
  const cart = getCart();

  if (cart.length === 0) {
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to remove all items from your cart?"
  );

  if (!confirmed) {
    return;
  }

  saveCart([]);
  cartMessage.textContent = "Your cart has been cleared.";
  renderCart();
});

renderCart();