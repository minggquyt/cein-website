import renderNumberProductsInCart from "../../../services/cart-services.js";
import { renderNumberProductsInWishlist } from "../../../services/wishlist-services.js";
import { initEventPopUpWishlistModal } from "../../../services/wishlist-services.js";

renderNumberProductsInCart();

renderNumberProductsInWishlist();

initEventPopUpWishlistModal();