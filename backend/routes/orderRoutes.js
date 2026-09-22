const router = require("express").Router();
const orders = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

router.post("/checkout", protect, orders.checkout);
router.get("/", protect, orders.getMyOrders);
router.get("/:id", protect, orders.getOrder);

module.exports = router;
