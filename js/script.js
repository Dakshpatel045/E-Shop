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

  // Product page jQuery
  let products = [];
  let brands = new Set();
  let filteredProducts = [];
  let currentPage = 1;
  const productsPerPage = 6;

  // ✅ Display products without regenerating brand filter
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
    });

    renderPagination(data.length);
  }

  // ✅ Render pagination
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
      displayProducts(filteredProducts);
    });
  }

  // ✅ Populate brand dropdown ONCE
  function populateBrandFilter(data) {
    brands.clear();
    data.forEach((product) => brands.add(product.brand));

    $("#brandFilter").empty().append('<option value="">All</option>');
    Array.from(brands)
      .sort()
      .forEach((brand) => {
        $("#brandFilter").append(`<option value="${brand}">${brand}</option>`);
      });
  }

  // ✅ Filter products
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

    currentPage = 1;
    displayProducts(filteredProducts);

    // ✅ For debugging:
    console.log("Filter applied:", {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      filteredCount: filteredProducts.length,
    });
  }

  // ✅ Load data and initialize
  $.getJSON("Data/products.json", function (data) {
    products = data;
    filteredProducts = products;
    populateBrandFilter(products);
    displayProducts(filteredProducts);
  });

  // ✅ Bind filters
  $("#searchInput, #categoryFilter, #brandFilter, #minPrice, #maxPrice").on(
    "input change",
    filterProducts
  );

  // ✅ Clear filters
  $("#clearFilters").click(function () {
    $("#searchInput").val("");
    $("#categoryFilter").val("");
    $("#brandFilter").val("");
    $("#minPrice").val("");
    $("#maxPrice").val("");
    filterProducts();
  });

  // Product-detail page jQuery
  function isLoggedIn() {
    return !!localStorage.getItem("loggedInUser");
  }

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  $.getJSON("Data/products.json", function (products) {
    const product = products.find((p) => p.id == productId);

    if (product) {
      $("#productDetails").html(`
  <div class="col-12 mb-4">
    <nav class="breadcrumb bg-white px-3 py-2 rounded shadow-sm">
      <a href="index.html" class="breadcrumb-item text-decoration-none">Home</a>
      <a href="products.html" class="breadcrumb-item text-decoration-none">Products</a>
      <span class="breadcrumb-item active" aria-current="page">${
        product.name
      }</span>
    </nav>
  </div>

  <div class="col-md-6">
  <div class="product-card border rounded shadow-sm p-3 bg-white overflow-hidden text-center">
  <div class="product-image-container">
    <img src="${product.image}" alt="${
        product.name
      }" class="img-fluid product-image" />
  </div>
</div>

</div>

  <div class="col-md-6">
    <div class="product-card border rounded shadow-sm p-4 bg-white h-100 d-flex flex-column justify-content-between">
      <div>
        <h2 class="fw-bold mb-2">${product.name}</h2>
        
        <div class="mb-2">
          <span class="text-warning">
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-half"></i>
            <i class="bi bi-star"></i>
          </span>
          <small class="text-muted">(128 reviews)</small>
        </div>

        <p class="text-body-secondary mb-2">Brand: <strong>${
          product.brand
        }</strong></p>
        <span class="badge bg-success mb-3 px-3 py-2 fs-6">In Stock</span>
        <h4 class="text-success fw-semibold mb-4">₹${product.price.toLocaleString()}</h4>
        <p class="mb-4">${
          product.description || "No description available for this product."
        }</p>
      </div>
      <div class="d-flex flex-column flex-sm-row gap-3">
        <button class="btn btn-outline-dark btn-lg w-100 add-to-cart" data-id="${
          product.id
        }">
          <i class="bi bi-cart-plus me-2"></i>Add to Cart
        </button>
        <button class="btn btn-outline-dark btn-lg w-100 add-to-wishlist" data-id="${
          product.id
        }">
          <i class="bi bi-heart me-2"></i>Add to Wishlist
        </button>
      </div>
    </div>
  </div>
`);
    } else {
      $("#productDetails").html(
        '<p class="text-center">Product not found.</p>'
      );
    }
  });

  // Add to Cart with login check
  $(document).on("click", ".add-to-cart", function () {
    if (!isLoggedIn()) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to add products to your cart.",
        confirmButtonText: "Go to Login",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "login.html";
        }
      });
      return;
    }

    let id = parseInt($(this).data("id"));
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!cart.some((item) => item.id === id)) {
      cart.push({ id: id, qty: 1 });
      localStorage.setItem("cart", JSON.stringify(cart));
      updateNavBadges();
      Swal.fire({
        icon: "success",
        title: "Added to Cart",
        text: "Product added to cart!",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "info",
        title: "Already in Cart",
        text: "Product already in cart.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });

  $(document).on("click", ".add-to-wishlist", function () {
    if (!isLoggedIn()) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to add products to your wishlist.",
        confirmButtonText: "Go to Login",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "login.html";
        }
      });
      return;
    }

    let id = parseInt($(this).data("id"));
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Check if product is in cart
    if (cart.some((item) => item.id === id)) {
      Swal.fire({
        icon: "error",
        title: "Cannot Add to Wishlist",
        text: "This product is already in your cart.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    // If not in cart, proceed with wishlist addition
    if (!wishlist.includes(id)) {
      wishlist.push(id);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      updateNavBadges();
      Swal.fire({
        icon: "success",
        title: "Added to Wishlist",
        text: "Product added to wishlist!",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "info",
        title: "Already in Wishlist",
        text: "Product already in wishlist.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });
  // Cart jQuery
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

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
        <table class="table table-hover align-middle cart-table">
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
              <button class="btn btn-outline-dark btn-sm quantity-decrease px-2" type="button">−</button>
              <input type="text" class="form-control form-control-sm text-center quantity-input" value="${item.qty}" readonly style="width: 45px;">
              <button class="btn btn-outline-dark btn-sm quantity-increase px-2" type="button">+</button>
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
        <a href="checkout.html" class="btn btn-sm btn-outline-dark proceed-to-checkout">
          <i class="bi bi-credit-card me-2"></i>Proceed to Checkout
        </a>
      </div>
    `;
      $("#cartContainer").html(cartHTML);
    });
  }

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

      cart = cart.map((item) => (item.id === id ? { ...item, qty } : item));
      localStorage.setItem("cart", JSON.stringify(cart));

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

  $(document).on("click", ".remove-item", function () {
    const id = $(this).data("id");
    Swal.fire({
      title: "Remove Product?",
      text: "Are you sure you want to remove this item from your cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, remove it",
    }).then((result) => {
      if (result.isConfirmed) {
        cart = cart.filter((item) => item.id !== id);
        localStorage.setItem("cart", JSON.stringify(cart));
        updateNavBadges();
        Swal.fire({
          icon: "success",
          title: "Removed!",
          text: "Product has been removed from your cart.",
          timer: 1200,
          showConfirmButton: false,
        });

        setTimeout(() => {
          location.reload();
        }, 1300);
      }
    });
  });

  // Wishlist jQuery
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
        <table class="table table-hover align-middle wishlist-table">
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

  $(document).on("click", ".remove-from-wishlist", function () {
    let id = $(this).data("id");
    Swal.fire({
      title: "Remove Product?",
      text: "Are you sure you want to remove this item from your wishlist?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, remove it",
    }).then((result) => {
      if (result.isConfirmed) {
        wishlist = wishlist.filter((itemId) => itemId !== id);
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        updateNavBadges();

        Swal.fire({
          icon: "success",
          title: "Removed!",
          text: "Product has been removed from your wishlist.",
          timer: 1200,
          showConfirmButton: false,
        });

        loadWishlist();
      }
    });
  });

  $(document).on("click", ".add-to-cart-from-wishlist", function () {
    let id = $(this).data("id");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!cart.some((item) => item.id === id)) {
      cart.push({ id: id, qty: 1 });
      localStorage.setItem("cart", JSON.stringify(cart));

      wishlist = wishlist.filter((itemId) => itemId !== id);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      updateNavBadges();
      Swal.fire({
        icon: "success",
        title: "Moved to Cart",
        text: "Product added to cart and removed from wishlist.",
        timer: 1500,
        showConfirmButton: false,
      });
      loadWishlist();
    } else {
      Swal.fire({
        icon: "info",
        title: "Already in Cart",
        text: "Product is already in the cart.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });

  // Checkout logic
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

  // $("#checkoutForm").submit(function (e) {
  //   e.preventDefault();

  //   const fields = [
  //     "#name",
  //     "#email",
  //     "#phone",
  //     "#address",
  //     "#city",
  //     "#pincode",
  //     "#state",
  //   ];
  //   for (let field of fields) {
  //     if ($(field).val().trim() === "") {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Missing Information",
  //         text: "Please fill all required fields.",
  //         confirmButtonText: "OK",
  //       });
  //       return;
  //     }
  //   }

  //   Swal.fire({
  //     icon: "success",
  //     title: "Order Placed",
  //     text: "✅ Order placed successfully!",
  //     timer: 1500,
  //     showConfirmButton: false,
  //   }).then(() => {
  //     localStorage.removeItem("cart");
  //     window.location.href = "index.html";
  //   });
  // });

  // Login page jQuery
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
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify({ username: user.username })
        );
        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: "Welcome back!",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          updateNavbarLinks();
          window.location.href = "index.html";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Invalid username or password.",
          confirmButtonText: "OK",
        });
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
  updateNavBadges();

  $("#logoutLink").on("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("loggedInUser");
    updateNavbarLinks();
    $(".offcanvas").offcanvas("hide");
    Swal.fire({
      icon: "success",
      title: "Logged Out",
      text: "Logged out successfully.",
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      window.location.href = "index.html";
    });
  });

  $(document).ready(function () {
    const restrictedPages = ["wishlist.html", "cart.html"];
    const currentPage = location.pathname.split("/").pop();
    const isLoggedIn = !!localStorage.getItem("loggedInUser");
    if (restrictedPages.includes(currentPage) && !isLoggedIn) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please log in to access this page.",
        confirmButtonText: "Go to Login",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "login.html";
        }
      });
    }
  });

  // team emember load

  const teamMembers = [
    {
      name: "Team Member 1",
      role: "Lead Instructor",
      img: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=400&fit=crop",
    },
    {
      name: "Team Member 2",
      role: "Content Strategist",
      img: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=400&fit=crop",
    },
    {
      name: "Team Member 3",
      role: "Technical Specialist",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&fit=crop",
    },
    {
      name: "Team Member 4",
      role: "UX Designer",
      img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=400&fit=crop",
    },
    {
      name: "Team Member 5",
      role: "Marketing Lead",
      img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&fit=crop",
    },
    {
      name: "Team Member 6",
      role: "Backend Developer",
      img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=400&fit=crop",
    },
  ];

  const $container = $(".team-scroll-container");

  $.each(teamMembers, function (i, member) {
    const card = `
      <div class="card border-0 text-center flex-shrink-0 shadow-sm" style="width: 250px;">
        <img src="${member.img}" class="rounded-circle mx-auto mt-3 shadow-sm" alt="${member.name}" style="width: 150px; height: 150px; object-fit: cover;">
        <div class="card-body">
          <h5 class="card-title mb-1">${member.name}</h5>
          <small class="text-muted">${member.role}</small>
        </div>
      </div>
    `;
    $container.append(card);
  });

  // real time valition caontact us

  function validateName() {
    let name = $("#name").val().trim();
    if (name.length < 3) {
      $("#nameError").text("Name must be at least 3 characters.");
      return false;
    } else {
      $("#nameError").text("");
      return true;
    }
  }

  function validateEmail() {
    let email = $("#email").val().trim();
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      $("#emailError").text("Please enter a valid email address.");
      return false;
    } else {
      $("#emailError").text("");
      return true;
    }
  }

  function validateMessage() {
    let message = $("#message").val().trim();
    if (message.length < 30) {
      $("#messageError").text("Message must be at least 30 characters.");
      return false;
    } else {
      $("#messageError").text("");
      return true;
    }
  }

  // Real-time validation
  $("#name").on("input", validateName);
  $("#email").on("input", validateEmail);
  $("#message").on("input", validateMessage);

  // On form submission
  $("#contactForm").on("submit", function (e) {
    e.preventDefault();

    // Force validation on all fields so messages appear even if untouched
    let isNameValid = validateName();
    let isEmailValid = validateEmail();
    let isMessageValid = validateMessage();

    if (isNameValid && isEmailValid && isMessageValid) {
      // Clear form
      $("#contactForm")[0].reset();
      $("#nameError, #emailError, #messageError").text("");

      // SweetAlert success popup
      Swal.fire({
        icon: "success",
        title: "Message Sent!",
        text: "Thank you for contacting us. We will get back to you shortly.",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  });

  // validation for shipping
  function validateShippingName() {
    let name = $("#shippingName").val().trim();
    if (name.length < 3) {
      $("#shippingNameError").text("Name must be at least 3 characters.");
      return false;
    } else {
      $("#shippingNameError").text("");
      return true;
    }
  }

  function validateShippingEmail() {
    let email = $("#shippingEmail").val().trim();
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      $("#shippingEmailError").text("Please enter a valid email.");
      return false;
    } else {
      $("#shippingEmailError").text("");
      return true;
    }
  }

  function validateShippingPhone() {
    let phone = $("#shippingPhone").val().trim();
    let phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(phone)) {
      $("#shippingPhoneError").text("Enter a valid 10-digit phone number.");
      return false;
    } else {
      $("#shippingPhoneError").text("");
      return true;
    }
  }

  function validateShippingAddress() {
    let address = $("#shippingAddress").val().trim();
    if (address.length < 10) {
      $("#shippingAddressError").text(
        "Address must be at least 10 characters."
      );
      return false;
    } else {
      $("#shippingAddressError").text("");
      return true;
    }
  }

  function validateShippingCity() {
    let city = $("#shippingCity").val().trim();
    if (city.length < 2) {
      $("#shippingCityError").text("Please enter a valid city.");
      return false;
    } else {
      $("#shippingCityError").text("");
      return true;
    }
  }

  function validateShippingPincode() {
    let pincode = $("#shippingPincode").val().trim();
    let pincodePattern = /^[0-9]{6}$/;
    if (!pincodePattern.test(pincode)) {
      $("#shippingPincodeError").text("Enter a valid 6-digit pincode.");
      return false;
    } else {
      $("#shippingPincodeError").text("");
      return true;
    }
  }

  function validateShippingState() {
    let state = $("#shippingState").val().trim();
    if (state.length < 2) {
      $("#shippingStateError").text("Please enter a valid state.");
      return false;
    } else {
      $("#shippingStateError").text("");
      return true;
    }
  }

  // ===== REAL-TIME VALIDATION =====

  $("#shippingName").on("input", validateShippingName);
  $("#shippingEmail").on("input", validateShippingEmail);
  $("#shippingPhone").on("input", validateShippingPhone);
  $("#shippingAddress").on("input", validateShippingAddress);
  $("#shippingCity").on("input", validateShippingCity);
  $("#shippingPincode").on("input", validateShippingPincode);
  $("#shippingState").on("input", validateShippingState);

  // ===== FORM SUBMISSION HANDLING =====

  $("#checkoutForm").on("submit", function (e) {
    e.preventDefault();

    let isNameValid = validateShippingName();
    let isEmailValid = validateShippingEmail();
    let isPhoneValid = validateShippingPhone();
    let isAddressValid = validateShippingAddress();
    let isCityValid = validateShippingCity();
    let isPincodeValid = validateShippingPincode();
    let isStateValid = validateShippingState();

    if (
      isNameValid &&
      isEmailValid &&
      isPhoneValid &&
      isAddressValid &&
      isCityValid &&
      isPincodeValid &&
      isStateValid
    ) {
      // If all fields are valid:
      Swal.fire({
        icon: "success",
        title: "Order Placed!",
        text: "Your order has been placed successfully.",
        timer: 1800,
        showConfirmButton: false,
      }).then(() => {
        localStorage.removeItem("cart"); // Clear cart
        updateNavBadges();
        window.location.href = "index.html"; // Redirect to home
      });
    }
  });
});

function updateNavBadges() {
  // Get cart and wishlist from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  // Update cart badge
  let cartCount = cart.length;
  $("#cartBadge").text(cartCount);
  if (cartCount > 0) {
    $("#cartBadge").removeClass("d-none");
  } else {
    $("#cartBadge").addClass("d-none");
  }

  // Update wishlist badge
  let wishlistCount = wishlist.length;
  $("#wishlistBadge").text(wishlistCount);
  if (wishlistCount > 0) {
    $("#wishlistBadge").removeClass("d-none");
  } else {
    $("#wishlistBadge").addClass("d-none");
  }
}
