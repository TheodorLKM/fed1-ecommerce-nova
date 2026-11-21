const checkoutForm = document.querySelector("#checkout-form");
const checkoutItems = document.querySelector("#checkout-items");
const checkoutSubtotal = document.querySelector("#checkout-subtotal");
const checkoutTotal = document.querySelector("#checkout-total");
const checkoutMessage = document.querySelector("#checkout-message");
const purchaseButton = document.querySelector("#complete-purchase");

function formatPrice(amount) {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK"
  }).format(amount);
}

function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem("nova_cart") || "[]");

    if (!Array.isArray(cart)) return [];

    return cart.filter((item) =>
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

function getSubtotal(cart) {
  return cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}

function showMessage(text, type = "error") {
  checkoutMessage.textContent = text;
  checkoutMessage.className = `auth-message ${type}`;
}

function renderOrder() {
  const cart = getCart();
  checkoutItems.replaceChildren();

  const subtotal = getSubtotal(cart);

  checkoutSubtotal.textContent = formatPrice(subtotal);
  checkoutTotal.textContent = formatPrice(subtotal);

  if (cart.length === 0) {
    checkoutItems.textContent =
      "Your cart is empty. Add a product before checking out.";
    purchaseButton.disabled = true;
    return;
  }

  purchaseButton.disabled = false;

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "checkout-item";

    const image = document.createElement("img");
    image.src = item.image || "";
    image.alt = item.title;

    const info = document.createElement("div");
    info.className = "checkout-item-info";

    const title = document.createElement("strong");
    title.textContent = item.title;

    const details = document.createElement("span");
    details.textContent =
      `${item.quantity} × ${formatPrice(item.price)}`;

    info.append(title, details);
    row.append(image, info);
    checkoutItems.append(row);
  });
}

function validateCheckout() {
  const inputs = checkoutForm.querySelectorAll(
    ".checkout-form-grid input"
  );

  let valid = true;
  let firstInvalid = null;

  inputs.forEach((input) => {
    const value = input.value.trim();

    const isEmpty = value.length === 0;
    const invalidEmail =
      input.type === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const invalid = isEmpty || invalidEmail;

    input.setAttribute("aria-invalid", String(invalid));

    if (invalid) {
      valid = false;
      if (!firstInvalid) firstInvalid = input;
    }
  });

  const selectedPayment = checkoutForm.querySelector(
    'input[name="payment"]:checked'
  );

  if (!selectedPayment) {
    valid = false;
  }

  if (!valid) {
    showMessage(
      "Please complete all delivery fields, enter a valid email, and select a payment method."
    );
    firstInvalid?.focus();
  }

  return valid;
}

function prefillEmail() {
  try {
    const user = JSON.parse(
      localStorage.getItem("nova_user") || "null"
    );

    if (user?.email) {
      document.querySelector("#checkout-email").value = user.email;
    }
  } catch {
  }
}

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  showMessage("");

  const token = localStorage.getItem("nova_token");

  if (!token) {
    showMessage("Please log in before completing your purchase.");
    return;
  }

  const cart = getCart();

  if (cart.length === 0) {
    showMessage("Your cart is empty.");
    renderOrder();
    return;
  }

  if (!validateCheckout()) {
    return;
  }

  const total = getSubtotal(cart);
  const itemCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const order = {
    reference: `NOVA-${Date.now()}`,
    total,
    itemCount
  };

  try {
    sessionStorage.setItem("nova_last_order", JSON.stringify(order));
    localStorage.removeItem("nova_cart");

    window.location.href = "../success/index.html";
  } catch {
    showMessage("Could not complete the demo checkout. Please try again.");
  }
});

prefillEmail();
renderOrder();