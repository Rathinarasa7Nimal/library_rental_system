const router = require("express").Router();
const cart = require("../controllers/cartController");
const { identify, protect } = require("../middleware/auth");

// `identify` allows guests (via x-guest-id header) as well as logged-in users
router.get("/", identify, cart.getCart);
router.post("/", identify, cart.addToCart);
router.put("/:id", identify, cart.updateCartItem);
router.delete("/:id", identify, cart.removeCartItem);

// Requires login: merges a guest cart into the now-authenticated user's cart
router.post("/merge", protect, cart.mergeGuestCart);

module.exports = router;
