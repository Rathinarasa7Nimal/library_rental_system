const router = require("express").Router();
const books = require("../controllers/bookController");
const upload = require("../middleware/upload");
const { protect, restrictTo } = require("../middleware/auth");

// Public: browse catalog, view one book, view cover image
router.get("/", books.getAll);
router.get("/:id", books.getOne);
router.get("/:id/cover", books.getCover);

// Admin only: catalog management (same reusable protect+restrictTo pattern
// used everywhere admin-only mutation is needed)
router.post("/", protect, restrictTo("admin"), upload.single("cover"), books.create);
router.put("/:id", protect, restrictTo("admin"), upload.single("cover"), books.update);
router.delete("/:id", protect, restrictTo("admin"), books.remove);

module.exports = router;
