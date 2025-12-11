// backend/controllers/productController.js

import Product from "../models/Product.js";
import Category from "../models/Category.js";
import asyncHandler from "../middleware/asyncHandler.js";
import mongoose from "mongoose";
import { updateCategoryProductCount } from "./categoryController.js";
// नोट: deleteFromCloudinary, getPublicIdFromUrl को import करें
import { deleteFromCloudinary } from "../utils/cloudinary.js";

/* -------------------- Create Product -------------------- */
export const createProduct = asyncHandler(async (req, res) => {
  // अब हम images को req.body से JSON array के रूप में प्राप्त करते हैं
  // Frontend से images: [{ url: '...', filename: '...' }, ...] आ रहा है
  const {
    name,
    description,
    shortDescription,
    category,
    brand,
    basePrice,
    discountPrice,
    tags,
    features,
    status,
    featured,
    trending,
    isBestOffer,
    images, // JSON Array from Frontend
    variantId,
  } = req.body;

  const cat = await Category.findById(category);
  if (!cat) {
    const e = new Error("Invalid category");
    e.statusCode = 400;
    throw e;
  }

  const slugBase = (name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const slug = `${slugBase}-${Date.now().toString(36).slice(-6)}`;

  // Process Images provided by Frontend
  const processedImages = [];
  if (Array.isArray(images)) {
    images.forEach((img, index) => {
      processedImages.push({
        url: img.url,
        filename: img.filename, // Cloudinary Public ID
        alt: img.alt || `${name} - image ${index + 1}`,
        isPrimary: index === 0, // पहला इमेज प्राइमरी होगा
        sortOrder: index,
        variant: img.variant || variantId || null,
      });
    });
  }

  const product = new Product({
    name,
    description,
    shortDescription,
    category,
    brand,
    images: processedImages,
    basePrice: Number(basePrice || 0),
    discountPrice: discountPrice ? Number(discountPrice) : undefined,
    tags: Array.isArray(tags) ? tags : [],
    features: Array.isArray(features) ? features : [],
    status: status || "draft",
    slug,
    totalStock: 0,
    featured: Boolean(featured),
    trending: Boolean(trending),
    isBestOffer: Boolean(isBestOffer),
  });

  const saved = await product.save();
  await saved.populate("category", "name slug");

  try {
    if (saved.category) {
      await updateCategoryProductCount(saved.category._id || saved.category);
    }
  } catch (err) {
    console.warn("updateCategoryProductCount failed after create:", err);
  }

  res.status(201).json({ success: true, data: saved });
});

/* -------------------- List Products -------------------- */
export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    status,
    search,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    sortOrder = "desc",
    featured,
    trending,
    isBestOffer,
    brand,        // NEW: brand filter (comma-separated)
    minRating,    // NEW: minimum rating filter
    inStock,      // NEW: in stock only filter
  } = req.query;

  const q = { isDeleted: { $ne: true } };

  if (category) q.category = category;
  if (status) q.status = status;

  // String/Boolean conversion fix for query params
  if (featured !== undefined) q.featured = String(featured) === "true";
  if (trending !== undefined) q.trending = String(trending) === "true";
  if (isBestOffer !== undefined) q.isBestOffer = String(isBestOffer) === "true";

  // NEW: Brand filter (supports multiple brands comma-separated)
  if (brand) {
    const brands = brand.split(",").map(b => b.trim()).filter(Boolean);
    if (brands.length > 0) {
      q.brand = { $in: brands };
    }
  }

  // NEW: Rating filter (minimum rating)
  if (minRating) {
    q.rating = { $gte: Number(minRating) };
  }

  // NEW: In stock filter
  if (inStock === "true") {
    q.totalStock = { $gt: 0 };
  }

  if (minPrice || maxPrice) {
    q.basePrice = {};
    if (minPrice) q.basePrice.$gte = Number(minPrice);
    if (maxPrice) q.basePrice.$lte = Number(maxPrice);
  }

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    const priceAsNumber = parseFloat(search);

    q.$or = [
      { name: searchRegex },
      { brand: searchRegex },
      { description: searchRegex },
      { shortDescription: searchRegex },
      { tags: searchRegex },
    ];

    if (!isNaN(priceAsNumber)) {
      q.$or.push({ basePrice: priceAsNumber });
    }
  }

  const p = Math.max(Number(page) || 1, 1);
  const l = Math.min(Math.max(Number(limit) || 12, 1), 100);

  const sortObj = {};
  sortObj[sortBy] = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;

  const [items, total] = await Promise.all([
    Product.find(q)
      .populate("category", "name slug")
      .sort(sortObj)
      .skip((p - 1) * l)
      .limit(l)
      .lean(),
    Product.countDocuments(q),
  ]);

  // Fetch Variants Logic
  const VariantModel =
    mongoose.models.VariantMaster || mongoose.models.Variant || null;
  let variantsByProduct = {};

  if (VariantModel && items.length) {
    const productIds = items.map((it) => it._id);
    const allVariants = await VariantModel.find({
      product: { $in: productIds },
      isDeleted: false,
    })
      .populate("size", "sizeName value")
      .populate("color", "colorName value")
      .lean();

    for (const v of allVariants) {
      const pid = v.product?.toString();
      if (!variantsByProduct[pid]) variantsByProduct[pid] = [];
      variantsByProduct[pid].push(v);
    }
  }

  const rows = items.map((prod) => {
    const primary =
      (prod.images || []).find((i) => i.isPrimary) ||
      (prod.images && prod.images[0]) ||
      null;

    const pObj = {
      ...prod,
      primaryImage: primary ? primary.url : null,
      primaryImageFullUrl: primary ? primary.url : null,
    };
    pObj.variants = variantsByProduct[prod._id.toString()] || [];
    return pObj;
  });

  res.json({
    success: true,
    data: rows,
    pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) },
  });
});

/* -------------------- Get Single Product -------------------- */
export const getProduct = asyncHandler(async (req, res) => {
  const prod = await Product.findById(req.params.id)
    .populate("category", "name slug")
    .lean();

  if (!prod) {
    const e = new Error("Product not found");
    e.statusCode = 404;
    throw e;
  }

  prod.images = (prod.images || []).map((img) => ({
    ...img,
    fullUrl: img.url,
  }));

  const VariantModel =
    mongoose.models.VariantMaster || mongoose.models.Variant || null;
  if (VariantModel) {
    const variants = await VariantModel.find({
      product: req.params.id,
      isDeleted: false,
    })
      .populate("size", "sizeName value")
      .populate("color", "colorName value")
      .lean();
    prod.variants = variants;
  } else {
    prod.variants = [];
  }

  res.json({ success: true, data: prod });
});

/* -------------------- Update Product -------------------- */
export const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const existing = await Product.findById(id);

  if (!existing) {
    const e = new Error("Product not found");
    e.statusCode = 404;
    throw e;
  }

  const {
    images,
    deleteFilenames, // Array of public_ids to delete
    ...updateData
  } = req.body;

  // 1. Handle Cloudinary Deletion (Real Delete)
  if (deleteFilenames && Array.isArray(deleteFilenames)) {
    for (const publicId of deleteFilenames) {
      if (publicId) {
        await deleteFromCloudinary(publicId); // Cloudinary se delete
      }
    }
    // Remove from DB array
    existing.images = existing.images.filter(
      (img) => !deleteFilenames.includes(img.filename)
    );
  }

  // 2. Handle Adding New/Updating Images
  if (images && Array.isArray(images)) {
    // Frontend sends the COMPLETE new list of images.
    // We map them to the schema structure.
    existing.images = images.map((img, idx) => ({
      url: img.url,
      filename: img.filename,
      alt: img.alt || updateData.name || existing.name,
      isPrimary: idx === 0,
      sortOrder: idx,
      variant: img.variant || null,
    }));
  }

  // 3. Update other fields
  const allowed = [
    "name",
    "description",
    "shortDescription",
    "category",
    "brand",
    "basePrice",
    "discountPrice",
    "tags",
    "features",
    "status",
    "featured",
    "trending",
    "isBestOffer",
  ];

  for (const k of allowed) {
    if (updateData[k] !== undefined) {
      // Boolean conversion for specific fields
      if (["featured", "trending", "isBestOffer"].includes(k)) {
        existing[k] = updateData[k] === "true" || updateData[k] === true;
      } else {
        existing[k] = updateData[k];
      }
    }
  }

  if (updateData.name && updateData.name !== existing.name) {
    existing.slug = `${updateData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Date.now().toString(36).slice(-5)}`;
  }

  await existing.save();
  await existing.populate("category", "name slug");

  // Update Category Counts logic (same as before)
  try {
    if (existing.category) {
      await updateCategoryProductCount(
        existing.category._id || existing.category
      );
    }
  } catch (err) {
    console.warn("updateCategoryProductCount failed after update:", err);
  }

  res.json({ success: true, message: "Updated", data: existing });
});

/* -------------------- Delete Product -------------------- */
export const deleteProduct = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) {
    const e = new Error("Product not found");
    e.statusCode = 404;
    throw e;
  }

  // 1. Delete All Images from Cloudinary
  if (p.images && p.images.length > 0) {
    const deletePromises = p.images
      .map((img) => img.filename)
      .filter((id) => id) // Filter out invalid IDs
      .map((publicId) => deleteFromCloudinary(publicId));

    await Promise.all(deletePromises);
  }

  const categoryId = p.category ? p.category.toString() : null;

  await Product.findByIdAndDelete(req.params.id);

  try {
    if (categoryId) await updateCategoryProductCount(categoryId);
  } catch (err) {
    console.warn("updateCategoryProductCount failed after delete:", err);
  }

  res.json({ success: true, message: "Product and images deleted" });
});

/* -------------------- Reorder Images -------------------- */
export const reorderImages = asyncHandler(async (req, res) => {
  const { imageFilenames } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    const e = new Error("Product not found");
    e.statusCode = 404;
    throw e;
  }

  if (!Array.isArray(imageFilenames)) {
    const e = new Error("imageFilenames must be array");
    e.statusCode = 400;
    throw e;
  }

  const newImgs = [];
  imageFilenames.forEach((fname, idx) => {
    const img = product.images.find((x) => x.filename === fname);
    if (img) {
      img.sortOrder = idx;
      img.isPrimary = idx === 0;
      newImgs.push(img);
    }
  });

  product.images = newImgs;
  await product.save();

  res.json({
    success: true,
    message: "Images reordered",
    data: product.images,
  });
});

/* -------------------- Set Primary Image -------------------- */
export const setPrimaryImage = asyncHandler(async (req, res) => {
  const { filename } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    const e = new Error("Product not found");
    e.statusCode = 404;
    throw e;
  }

  let found = false;
  product.images.forEach((img) => {
    if (img.filename === filename) {
      img.isPrimary = true;
      found = true;
    } else img.isPrimary = false;
  });

  if (!found) {
    const e = new Error("filename not found in product images");
    e.statusCode = 400;
    throw e;
  }

  await product.save();
  res.json({ success: true, message: "Primary updated" });
});

/* -------------------- Get Variants -------------------- */
export const getProductVariants = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const VariantModel =
    mongoose.models.VariantMaster || mongoose.models.Variant || null;

  if (!VariantModel) {
    return res.json({ success: true, data: [] });
  }

  const variants = await VariantModel.find({ product: productId }).lean();
  res.json({ success: true, data: variants });
});

/* -------------------- Recalculate Stock -------------------- */
export const recalculateStock = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);

  if (!product) {
    const e = new Error("Product not found");
    e.statusCode = 404;
    throw e;
  }

  const VariantModel =
    mongoose.models.VariantMaster || mongoose.models.Variant || null;
  let total = 0;

  if (VariantModel) {
    const variants = await VariantModel.find({ product: productId }).lean();
    for (const v of variants) {
      if (typeof v.stock === "number") total += v.stock;
      else if (v.quantity && typeof v.quantity === "number")
        total += v.quantity;
    }
  } else {
    const InventoryModel = mongoose.models.Inventory || null;
    if (InventoryModel) {
      const inventories = await InventoryModel.find({
        product: productId,
      }).lean();
      for (const it of inventories) {
        if (typeof it.stock === "number") total += it.stock;
      }
    }
  }

  product.totalStock = total;
  await product.save();

  res.json({
    success: true,
    message: "Recalculated totalStock",
    totalStock: total,
  });
});
