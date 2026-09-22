const asyncHandler = require("./asyncHandler");
const ApiError = require("./ApiError");

/**
 * Reusable, "same-syntax" CRUD controller generator.
 *
 * Every resource (Book, User, etc.) gets identical create/getOne/getAll/
 * update/remove handlers generated from this one factory, so all
 * controllers share the same function signatures and behaviour instead of
 * each being hand-written differently. A resource-specific controller file
 * only needs to add the logic that ISN'T plain CRUD (auth, cart merge,
 * checkout, etc.) and can still call these for the boring parts.
 *
 * options:
 *  - allowedFilters: string[] of query-string keys that map 1:1 to an
 *    equality filter on the model (e.g. ["category", "format"])
 *  - searchFields: enables `?search=` using the model's text index
 *  - defaultLimit / maxLimit: pagination bounds
 *  - populate: mongoose populate path(s) for getAll/getOne
 */
function createCrudController(Model, options = {}) {
  const {
    allowedFilters = [],
    searchFields = null,
    defaultLimit = 10,
    maxLimit = 50,
    populate = null,
  } = options;

  const buildFilter = (query) => {
    const filter = {};
    for (const key of allowedFilters) {
      if (query[key] !== undefined && query[key] !== "" && query[key] !== "all") {
        filter[key] = query[key];
      }
    }
    if (searchFields && query.search) {
      filter.$text = { $search: query.search };
    }
    return filter;
  };

  const create = asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ success: true, data: doc });
  });

  const getAll = asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || defaultLimit, maxLimit);
    const filter = buildFilter(req.query);

    let q = Model.find(filter);
    if (populate) q = q.populate(populate);

    const [items, total] = await Promise.all([
      q
        .skip((page - 1) * limit)
        .limit(limit)
        .sort(req.query.sort || "-createdAt"),
      Model.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  });

  const getOne = asyncHandler(async (req, res) => {
    let q = Model.findById(req.params.id);
    if (populate) q = q.populate(populate);
    const doc = await q;
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
    res.json({ success: true, data: doc });
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
    res.json({ success: true, data: doc });
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(404, `${Model.modelName} not found`);
    res.json({ success: true, data: {} });
  });

  return { create, getAll, getOne, update, remove, buildFilter };
}

module.exports = createCrudController;
