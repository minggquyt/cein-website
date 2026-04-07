import { getCartData } from "../../../services/getData.js";
import deleteProductsInCart from "../../../services/deleteData.js";
import renderNumberProductsInCart from "../../../services/cart-services.js";
import renderNumberProductsInWishlist from "../../../services/wishlist-services.js"
import { initEventPopUpWishlistModal } from "../../../services/wishlist-services.js";

const token = JSON.parse(localStorage.getItem("userInfo")).usertoken;

const cartState = {
  items: {
    "productId_schema": {
      quantity: -1,
      priceOfOneItem: -1,
      timeoutId: null
    }
  }
}

function handleClickOnQuantityControl(e) {
  e.preventDefault();
  e.stopPropagation();

  const rootEl = e.currentTarget.closest(".card-shopping-cart-page");

  const variantId = rootEl.dataset.variantid;

  if (e.target.classList.contains("decrease") && variantId) {
    updateQuantityOfCartState(rootEl, -1);
  }
  else if (e.target.classList.contains("increase") && variantId) {
    updateQuantityOfCartState(rootEl, 1);
  }
}

function initClickEventOnQuantityControl() {
  const quantityControlboxes = document.querySelectorAll(".quantity-control");

  quantityControlboxes.forEach(box => {
    box.addEventListener("click", handleClickOnQuantityControl)

  });
}

function initData() {
  getCartData(token)
    .then((products) => {
      if (products.success == true) {
        const container = document.querySelector(".cart-section-1-content-left");

        let html = "";
        products.data.forEach(item => {
          if (item.quantity > 1) {
            html += `
            <div data-variantid="${item.product._id}_${item.size}_${item.color}" class="card-shopping-cart-page">
              <div class="card-shopping-cart-page-section-1 roboto-400">
                <p>${item.product.name}</p>
                <span class="material-symbols-outlined remove-item" data-id="${item.product._id}">
                  close
                </span>
              </div>

              <div class="card-shopping-cart-page-section-2">
                <p>Size: ${item.size} - Color: ${item.color}</p>
                <img src="${item.product.image[0].url}" alt="">
                
                <div class="quantity-control">
                  <span class="material-symbols-outlined decrease" data-id="${item._id}">
                    remove
                  </span>
                  <span  class="quantity-control-number">${item.quantity}</span>
                  <span class="material-symbols-outlined increase" data-id="${item._id}">
                    add
                  </span>
                </div>
              </div>

              <div class="card-shopping-cart-page-section-3">
                <span>Subtotal</span>
                <span class="card-shopping-cart-page-section-3-cost" >$ ${item.product.price * item.quantity}</span>
              </div>
            </div>`
          }
          else{
            html += `
            <div data-variantid="${item.product._id}_${item.size}_${item.color}" class="card-shopping-cart-page">
              <div class="card-shopping-cart-page-section-1 roboto-400">
                <p>${item.product.name}</p>
                <span class="material-symbols-outlined remove-item" data-id="${item.product._id}">
                  close
                </span>
              </div>

              <div class="card-shopping-cart-page-section-2">
                <p>Size: ${item.size} - Color: ${item.color}</p>
                <img src="${item.product.image[0].url}" alt="">
                
                <div class="quantity-control">
                  <span class="material-symbols-outlined decrease unactive-remove-item" data-id="${item._id}">
                    remove
                  </span>
                  <span  class="quantity-control-number">${item.quantity}</span>
                  <span class="material-symbols-outlined increase" data-id="${item._id}">
                    add
                  </span>
                </div>
              </div>

              <div class="card-shopping-cart-page-section-3">
                <span>Subtotal</span>
                <span class="card-shopping-cart-page-section-3-cost">$ ${item.product.price * item.quantity}</span>
              </div>
            </div>`
          }

          const variant_id = `${item.product._id}_${item.size}_${item.color}`;

          // init cart state
          cartState.items[variant_id] = {
            quantity: item.quantity,
            priceOfOneItem: item.product.price,
            timeoutId: null
          };

        });

        if (html != "")
          container.innerHTML = html;
        else
          container.innerHTML = "<p>Giỏ hàng trống</p>";

        initClickEventOnRemoveProduct();

        initClickEventOnQuantityControl();

        initTotalCost(products.data);
      }
      else {
        console.warn("Lõi trong quá trình fetch user-cart-data");
      }
    })
    .catch(error => {
      console.log(error);
    })
}

initData();

function initValidateNumberProductsOnQuantityContol(item) {
  const numberProducts = item.querySelector(".quantity-control-number").innerText;
  if (numberProducts <= 1) {
    const removeIcon = item.querySelector(".decrease");
    removeIcon.classList.add("unactive-remove-item");
  }
  else {
    const removeIcon = item.querySelector(".decrease");
    if (removeIcon.classList.contains("unactive-remove-item"))
      removeIcon.classList.remove("unactive-remove-item");
  }
}

function handleClickOnRemoveItem(e) {
  const productId = e.currentTarget.dataset.id;
  deleteProductsInCart(productId, token)
    .then(data => {
      if (data){
        initData();
        renderNumberProductsInCart();
      }
      else
        console.warn("Lỗi hệ thống, không thể xóa sản phẩm trong giỏ hàng");
    })
}

function initClickEventOnRemoveProduct() {
  const deleteItems = document.querySelectorAll(".remove-item");
  deleteItems.forEach(item => {
    item.addEventListener('click', handleClickOnRemoveItem)
  })
}

function updateQuantityOfCartState(rootEl, delta) {
  const variant_id = rootEl.dataset.variantid;
  const item = cartState.items[variant_id];

  // 1. Update UI ngay
  item.quantity += delta;
  renderQuantityOfCartState(rootEl, item.quantity);

  // 2. Clear debounce cũ
  clearTimeout(item.timeoutId);

  // 3. Set debounce mới
  item.timeoutId = setTimeout(() => {
    // define function sync to server
    updateNumberProductsVariant(variant_id, item.quantity, token);
  }, 500);

  // khởi tạo validate số lượng sản phẩm tối thiểu là 1
  initValidateNumberProductsOnQuantityContol(rootEl);

  // update giá cho item được thay đổi
  syncCostOfProduct(rootEl,item);

  // update tổng tiền 
  updateTotalCost();
}

function initTotalCost(productsData){
  const subTotal = document.querySelector(".cart-order-sumary-subtotal-cost");
  
  let total = 0;

  productsData.forEach(item => {
    total += item.quantity * item.product.price;
  })

  subTotal.innerHTML = `$ ${total}`
} 

function updateTotalCost(){
  const subTotal = document.querySelector(".cart-order-sumary-subtotal-cost");

  const cartStateValues = Object.values(cartState.items);

  let totalCost = 0;

  cartStateValues.forEach(state => {

    // lọc field objectSchema của state 
    if(state.quantity != -1) {
        totalCost += state.quantity * state.priceOfOneItem;
    }
  })

  subTotal.innerHTML = `$ ${totalCost}`
}

function syncCostOfProduct(rootEl,currentItem){
  const cost = rootEl.querySelector(".card-shopping-cart-page-section-3-cost");
  cost.innerText = `$ ${currentItem.quantity * currentItem.priceOfOneItem}`
}

function renderQuantityOfCartState(rootEl, quantity) {
  const quantityNumberBoxOfRootEl = rootEl.querySelector(".quantity-control-number");
  quantityNumberBoxOfRootEl.textContent = quantity;
}

renderNumberProductsInCart();

renderNumberProductsInWishlist();

initEventPopUpWishlistModal();