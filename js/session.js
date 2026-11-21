const token = localStorage.getItem("nova_token");

document.querySelectorAll(".nav-links").forEach((nav) => {
  const loginLink = [...nav.querySelectorAll("a")].find((link) =>
    link.getAttribute("href")?.includes("login.html")
  );

  if (!loginLink) return;

  if (token) {
    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.className = "nav-logout";
    logoutButton.textContent = "Log out";

    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("nova_token");
      localStorage.removeItem("nova_user");
      localStorage.removeItem("nova_cart");
      sessionStorage.removeItem("nova_last_order");

      const isNestedPage = window.location.pathname
        .split("/")
        .filter(Boolean)
        .length > 1;

      // Resolve the homepage from the existing logo link.
      const homeLink = document.querySelector(".logo");
      window.location.href = homeLink?.href || (isNestedPage ? "../index.html" : "./index.html");
    });

    loginLink.replaceWith(logoutButton);
  }
});