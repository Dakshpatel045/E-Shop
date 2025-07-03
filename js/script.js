$(document).ready(function () {
  $.getJSON("Data/products.json", function (products) {
    // Select 4 random featured products
    let featured = products.sort(() => 0.5 - Math.random()).slice(0, 4);

    featured.forEach((product) => {
      $("#featuredProducts").append(`
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="card h-100">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text fw-bold text-success">₹${product.price}</p>
                            <a href="product-detail.html?id=${product.id}" class="btn btn-sm btn-outline-dark mt-auto w-100">View Details</a>
                        </div>
                    </div>
                </div>
            `);
    });
  });

  //product page jquery starts

  let products = [];
  let brands = new Set();
  let filteredProducts = [];
  let currentPage = 1;
  const productsPerPage = 6;

  function displayProducts(data) {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedData = data.slice(start, end);

    $("#productGrid").empty();
    if (paginatedData.length === 0) {
      $("#productGrid").html('<p class="text-center">No products found.</p>');
      return;
    }

    paginatedData.forEach((product) => {
      $("#productGrid").append(`
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <img src="${product.image}" class="card-img-top" alt="${product.name}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text text-muted">${product.brand}</p>
            <p class="card-text fw-bold text-success">₹${product.price}</p>
            <div class="mt-auto">
              <a href="product-detail.html?id=${product.id}" class="btn btn-sm btn-outline-dark mt-auto w-100">View Details</a>
            </div>
          </div>
        </div>
      </div>
    `);
      brands.add(product.brand);
    });

    // Populate brand filter dynamically
    $("#brandFilter").empty().append('<option value="">All</option>');
    Array.from(brands)
      .sort()
      .forEach((brand) => {
        $("#brandFilter").append(`<option value="${brand}">${brand}</option>`);
      });

    renderPagination(data.length);
  }

  function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / productsPerPage);
    const pagination = $("#pagination");
    pagination.empty();

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      pagination.append(`
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <a class="page-link" href="#">${i}</a>
      </li>
    `);
    }

    $(".page-link").click(function (e) {
      e.preventDefault();
      currentPage = parseInt($(this).text());
      displayProducts(filteredProducts); // re-filter and re-render
    });
  }

  function filterProducts() {
    let search = $("#searchInput").val().toLowerCase();
    let category = $("#categoryFilter").val();
    let brand = $("#brandFilter").val();
    let minPrice = parseInt($("#minPrice").val()) || 0;
    let maxPrice = parseInt($("#maxPrice").val()) || Infinity;

    filteredProducts = products.filter((product) => {
      return (
        product.name.toLowerCase().includes(search) &&
        (category === "" || product.category === category) &&
        (brand === "" || product.brand === brand) &&
        product.price >= minPrice &&
        product.price <= maxPrice
      );
    });

    currentPage = 1; // Reset only when filters change
    displayProducts(filteredProducts);
  }

  $.getJSON("Data/products.json", function (data) {
    products = data;
    filteredProducts = products;
    displayProducts(filteredProducts);
  });

  $("#searchInput, #categoryFilter, #brandFilter, #minPrice, #maxPrice").on(
    "input change",
    filterProducts
  );

  $("#clearFilters").click(function () {
    $("#searchInput").val("");
    $("#categoryFilter").val("");
    $("#brandFilter").val("");
    $("#minPrice").val("");
    $("#maxPrice").val("");
    filterProducts();
  });
  //product page jquery ends

  // ✅ product-detail page jquery starts

function isLoggedIn() {
    return !!localStorage.getItem("loggedInUser");
}

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

// Fetch and display product details
$.getJSON("Data/products.json", function (products) {
    const product = products.find((p) => p.id == productId);

    if (product) {
        $("#productDetails").html(`
            <div class="col-md-6">
                <div class="border rounded shadow-sm overflow-hidden" style="max-height: 450px; display: flex; align-items: center; justify-content: center;">
                    <img src="${product.image}" alt="${product.name}" class="img-fluid" style="max-height: 100%; object-fit: contain;">
                </div>
            </div>
            <div class="col-md-6">
                <h1 class="fw-bold mb-2">${product.name}</h1>
                <p class="text-muted mb-1">Brand: <strong>${product.brand}</strong></p>
                <p class="fs-4 fw-semibold text-success mb-3">₹${product.price}</p>
                <p class="mb-4">${product.description || "No description available for this product."}</p>

                <div class="d-flex flex-column flex-sm-row gap-3">
                    <button class="btn btn-lg btn-outline-dark mt-auto w-100 add-to-cart" data-id="${product.id}">
                        <i class="bi bi-cart-plus me-2"></i>Add to Cart
                    </button>
                    <button class="btn btn-lg btn-outline-dark mt-auto w-100 add-to-wishlist" data-id="${product.id}">
                        <i class="bi bi-heart me-2"></i>Add to Wishlist
                    </button>
                </div>
            </div>
        `);
    } else {
        $("#productDetails").html('<p class="text-center">Product not found.</p>');
    }
});

// ✅ Add to Cart with login check
$(document).on("click", ".add-to-cart", function () {
    if (!isLoggedIn()) {
        alert("Please login to add products to your cart.");
        window.location.href = "login.html";
        return;
    }

    let id = parseInt($(this).data("id"));
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Ensure consistent object structure {id, qty}
    if (!cart.some(item => item.id === id)) {
        cart.push({ id: id, qty: 1 });
        localStorage.setItem("cart", JSON.stringify(cart));
        alert("Product added to cart!");
    } else {
        alert("Product already in cart.");
    }
});

// ✅ Add to Wishlist with login check
$(document).on("click", ".add-to-wishlist", function () {
    if (!isLoggedIn()) {
        alert("Please login to add products to your wishlist.");
        window.location.href = "login.html";
        return;
    }

    let id = parseInt($(this).data("id"));
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    if (!wishlist.includes(id)) {
        wishlist.push(id);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        alert("Product added to wishlist!");
    } else {
        alert("Product already in wishlist.");
    }
});

// ✅ product-detail page jquery ends




  //Cart jquery starts

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Convert old format (array of IDs) to new format (array of objects with qty)
  if (cart.length && typeof cart[0] === "number") {
    cart = cart.map((id) => ({ id, qty: 1 }));
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  if (cart.length === 0) {
    $("#cartContainer").html(`
      <div class="text-center py-5">
        <i class="bi bi-cart-x fs-1 text-muted"></i>
        <p class="mt-3 fs-5 text-muted">Your cart is empty.</p>
      </div>
    `);
  } else {
    $.getJSON("Data/products.json", function (products) {
      let total = 0;
      let cartItems = cart.map((item) => {
        const product = products.find((p) => p.id === item.id);
        return { ...product, qty: item.qty };
      });

      let cartHTML = `
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
      `;

      cartItems.forEach((item) => {
        const subtotal = item.price * item.qty;
        total += subtotal;

        cartHTML += `
          <tr data-id="${item.id}">
            <td>
              <div class="d-flex align-items-center gap-3">
                <img src="${item.image}" alt="${item.name}" width="60" height="60" class="rounded shadow-sm object-fit-cover" style="object-fit: cover;">
                <div>
                  <div class="fw-semibold">${item.name}</div>
                  <div class="text-muted small">${item.brand}</div>
                </div>
              </div>
            </td>
            <td>₹${item.price}</td>
            <td>
              <div class="d-flex align-items-center gap-1">
  <button class="btn btn-outline-secondary btn-sm quantity-decrease px-2" type="button">−</button>
  <input type="text" class="form-control form-control-sm text-center quantity-input" value="${item.qty}" readonly style="width: 45px;">
  <button class="btn btn-outline-secondary btn-sm quantity-increase px-2" type="button">+</button>
</div>

            </td>
            <td class="fw-bold text-success subtotal">₹${subtotal}</td>
            <td>
              <button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.id}">
                <i class="bi bi-trash me-1"></i> Remove
              </button>
            </td>
          </tr>
        `;
      });

      cartHTML += `
            </tbody>
          </table>
        </div>
        <div class="d-flex justify-content-between align-items-center mt-4">
          <div class="fw-bold fs-5">Total: ₹<span id="cartTotal">${total}</span></div>
          <a href="checkout.html" class="btn btn-lg btn-outline-dark">
            <i class="bi bi-credit-card me-2"></i>Proceed to Checkout
          </a>
        </div>
      `;

      $("#cartContainer").html(cartHTML);
    });
  }

  // Quantity Increase/Decrease
  $(document).on(
    "click",
    ".quantity-increase, .quantity-decrease",
    function () {
      const row = $(this).closest("tr");
      const id = parseInt(row.data("id"));
      const input = row.find(".quantity-input");
      let qty = parseInt(input.val());

      if ($(this).hasClass("quantity-increase")) {
        qty++;
      } else if (qty > 1) {
        qty--;
      }

      input.val(qty);

      // Update cart in localStorage
      cart = cart.map((item) => (item.id === id ? { ...item, qty } : item));
      localStorage.setItem("cart", JSON.stringify(cart));

      // Update subtotal and total
      const price = parseFloat(
        row.find("td:nth-child(2)").text().replace("₹", "")
      );
      const subtotal = price * qty;
      row.find(".subtotal").text(`₹${subtotal}`);

      let newTotal = 0;
      $(".subtotal").each(function () {
        newTotal += parseFloat($(this).text().replace("₹", ""));
      });
      $("#cartTotal").text(newTotal);
    }
  );

  // Remove Item
  $(document).on("click", ".remove-item", function () {
    const id = $(this).data("id");
    cart = cart.filter((item) => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    location.reload();
  });

  // Cart jquery ends

  // Wishlist jQuery Starts
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  function loadWishlist() {
    if (wishlist.length === 0) {
      $("#wishlistContainer").html(`
      <div class="text-center py-5">
        <i class="bi bi-heart fs-1 text-muted"></i>
        <p class="mt-3 fs-5 text-muted">Your wishlist is empty.</p>
      </div>
    `);
      return;
    }

    $.getJSON("Data/products.json", function (products) {
      let wishlistItems = products.filter((p) => wishlist.includes(p.id));
      let wishlistHTML = `
      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Price</th>
              <th scope="col">Add to Cart</th>
              <th scope="col">Remove</th>
            </tr>
          </thead>
          <tbody>
    `;

      wishlistItems.forEach((item) => {
        wishlistHTML += `
        <tr>
          <td>
            <div class="d-flex align-items-center gap-3">
              <img src="${item.image}" alt="${item.name}" width="60" height="60" class="rounded shadow-sm object-fit-cover" style="object-fit: cover;">
              <div>
                <div class="fw-semibold">${item.name}</div>
                <div class="text-muted small">${item.brand}</div>
              </div>
            </div>
          </td>
          <td class="fw-bold text-success">₹${item.price}</td>
          <td>
            <button class="btn btn-sm btn-outline-dark add-to-cart-from-wishlist" data-id="${item.id}">
              <i class="bi bi-cart-plus me-1"></i> Add
            </button>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-danger remove-from-wishlist" data-id="${item.id}">
              <i class="bi bi-trash me-1"></i> Remove
            </button>
          </td>
        </tr>
      `;
      });

      wishlistHTML += `
          </tbody>
        </table>
      </div>
    `;

      $("#wishlistContainer").html(wishlistHTML);
    });
  }
  loadWishlist();

  // Remove from wishlist
  $(document).on("click", ".remove-from-wishlist", function () {
    let id = $(this).data("id");
    wishlist = wishlist.filter((itemId) => itemId !== id);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    loadWishlist();
  });

  // Add to cart from wishlist and remove from wishlist
  $(document).on("click", ".add-to-cart-from-wishlist", function () {
    let id = $(this).data("id");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Check if the product is already in cart by id
    if (!cart.some((item) => item.id === id)) {
      cart.push({ id: id, qty: 1 });
      localStorage.setItem("cart", JSON.stringify(cart));

      // Remove from wishlist
      wishlist = wishlist.filter((itemId) => itemId !== id);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));

      alert("Product added to cart and removed from wishlist.");
      loadWishlist();
    } else {
      alert("Product is already in the cart.");
    }
  });

  // Wishlist jQuery Ends

  // Checkout logic starts here
  cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    $("#orderSummary").html(`
    <div class="text-center py-5">
      <i class="bi bi-cart-x fs-1 text-muted"></i>
      <p class="mt-3 fs-5 text-muted">Your cart is empty.</p>
      <a href="products.html" class="btn btn-outline-dark mt-3">Continue Shopping</a>
    </div>
  `);
    $("#checkoutForm").hide();
  } else {
    $.getJSON("Data/products.json", function (products) {
      let cartItems = cart.map((item) => {
        const product = products.find((p) => p.id === item.id);
        return { ...product, qty: item.qty };
      });

      let subtotal = 0;
      let shipping = 50;
      let summaryHTML = `
      <div class="table-responsive">
        <table class="table table-sm align-middle">
          <thead class="table-light">
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
    `;

      cartItems.forEach((item) => {
        const itemSubtotal = item.price * item.qty;
        subtotal += itemSubtotal;

        summaryHTML += `
        <tr>
          <td>
            <div class="d-flex align-items-center gap-2">
              <img src="${item.image}" alt="${item.name}" width="50" height="50" class="rounded shadow-sm">
              <span>${item.name}</span>
            </div>
          </td>
          <td>₹${item.price}</td>
          <td>${item.qty}</td>
          <td class="fw-semibold text-success">₹${itemSubtotal}</td>
        </tr>
      `;
      });

      const total = subtotal + shipping;

      summaryHTML += `
          </tbody>
        </table>
      </div>
      <hr>
      <div class="text-end fw-semibold">Subtotal: ₹${subtotal}</div>
      <div class="text-end fw-semibold">Shipping: ₹${shipping}</div>
      <div class="text-end fs-5 fw-bold">Total: ₹${total}</div>
    `;

      $("#orderSummary").html(summaryHTML);
    });
  }

  $("#checkoutForm").submit(function (e) {
    e.preventDefault();

    const fields = [
      "#name",
      "#email",
      "#phone",
      "#address",
      "#city",
      "#pincode",
      "#state",
    ];
    for (let field of fields) {
      if ($(field).val().trim() === "") {
        alert("Please fill all required fields.");
        return;
      }
    }

    alert("✅ Order placed successfully!");
    localStorage.removeItem("cart");
    window.location.href = "index.html";
  });

  // checkout ends

  //login page jquery

  $("#togglePassword").on("click", function () {
    const passwordField = $("#loginPassword");
    const type =
      passwordField.attr("type") === "password" ? "text" : "password";
    passwordField.attr("type", type);
    $(this).find("i").toggleClass("bi-eye bi-eye-slash");
  });

  $("#loginForm").on("submit", function (e) {
    e.preventDefault();
    const username = $("#loginUsername").val().trim();
    const password = $("#loginPassword").val().trim();

    $.getJSON("Data/users.json", function (users) {
      const user = users.find(
        (u) => u.username === username && u.password === password
      );
      if (user) {
        localStorage.setItem("loggedInUser", JSON.stringify({ username: user.username }));
        alert("Login successful!");
        updateNavbarLinks();
        window.location.href = "index.html";
      } else {
        alert("Invalid username or password.");
      }
    });
  });

  function updateNavbarLinks() {
    const isLoggedIn = !!localStorage.getItem("loggedInUser");
    if (isLoggedIn) {
      $(".nav-wishlist, .nav-cart, .nav-logout").removeClass("d-none");
      $(".nav-login").addClass("d-none");
    } else {
      $(".nav-wishlist, .nav-cart, .nav-logout").addClass("d-none");
      $(".nav-login").removeClass("d-none");
    }
  }
  updateNavbarLinks();

  $("#logoutLink").on("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("loggedInUser");
    updateNavbarLinks();
    alert("Logged out successfully.");
    window.location.href = "index.html";
  });
  $(document).ready(function () {
    const restrictedPages = ["wishlist.html", "cart.html"];
    const currentPage = location.pathname.split("/").pop();
    const isLoggedIn = !!localStorage.getItem("loggedInUser");
    if (restrictedPages.includes(currentPage) && !isLoggedIn) {
      alert("Please log in to access this page.");
      window.location.href = "login.html";
    }
  });
});
