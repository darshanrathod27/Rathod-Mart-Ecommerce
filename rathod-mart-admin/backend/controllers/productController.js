// backend/controllers/productController.js

import Product from "../models/Product.js";
import Category from "../models/Category.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { updateCategoryProductCount } from "./categoryController.js";
import { uploadToCloudinary } from "../utils/cloudinary.js"; // Cloudinary Helper

/* -------------------- Create Product -------------------- */
export const createProduct = asyncHandler(async (req, res) => {
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

  const images = [];
  const variantIdForUploads = req.body.variantId || null;

  // --- CLOUDINARY UPLOAD LOGIC ---
  if (req.files && req.files.length) {
    for (let i = 0; i < req.files.length; i++) {
      const f = req.files[i];
      // Upload buffer to Cloudinary
      const result = await uploadToCloudinary(f.buffer);

      images.push({
        url: result.secure_url, // Cloudinary URL (Always accessible)
        filename: result.public_id, // Cloudinary ID (Used for deletion if needed)
        alt: `${name} - image ${i + 1}`,
        isPrimary: i === 0,
        sortOrder: i,
        variant: variantIdForUploads || null,
      });
    }
  }

  const product = new Product({
    name,
    description,
    shortDescription,
    category,
    brand,
    images,
    basePrice: Number(basePrice || 0),
    discountPrice: discountPrice ? Number(discountPrice) : undefined,
    tags: Array.isArray(tags)
      ? tags
      : typeof tags === "string" && tags
      ? tags.split(",").map((t) => t.trim())
      : [],
    features: Array.isArray(features)
      ? features
      : typeof features === "string" && features
      ? features.split(",").map((t) => t.trim())
      : [],
    status: status || "draft",
    slug,
    totalStock: 0,
    featured: featured === "true" || featured === true,
    trending: trending === "true" || trending === true,
    isBestOffer: isBestOffer === "true" || isBestOffer === true,
  });

  const saved = await product.save();
  await saved.populate("category", "name slug");

  try {
    if (saved.category) {
      await updateCategoryProductCount(
        saved.category._id ? saved.category._id : saved.category
      );
    }
  } catch (err) {
    console.warn("updateCategoryProductCount failed after create:", err);
  }

  // Cloudinary URLs are absolute, no need for buildFullUrl logic
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
  } = req.query;

  const q = { isDeleted: { $ne: true } };

  if (category) q.category = category;
  if (status) q.status = status;

  if (typeof featured !== "undefined") q.featured = featured === "true";
  if (typeof trending !== "undefined") q.trending = trending === "true";
  if (typeof isBestOffer !== "undefined")
    q.isBestOffer = isBestOffer === "true";

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
    ];

    if (!isNaN(priceAsNumber)) {
      q.$or.push({ basePrice: priceAsNumber });
      q.$or.push({ discountPrice: priceAsNumber });
    }
  }

  const p = Math.max(Number(page) || 1, 1);
  const l = Math.min(Math.max(Number(limit) || 12, 1), 100);

  const sortObj = {};
  sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

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

    // Using Cloudinary URL directly
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

  // Ensure fullUrl is just the Cloudinary URL
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

  const oldCategoryId = existing.category ? existing.category.toString() : null;
  const update = { ...req.body };

  if (typeof update.tags === "string") {
    try {
      update.tags = JSON.parse(update.tags);
    } catch {
      update.tags = update.tags.split(",").map((s) => s.trim());
    }
  }

  if (typeof update.features === "string") {
    try {
      update.features = JSON.parse(update.features);
    } catch {
      update.features = update.features.split(",").map((s) => s.trim());
    }
  }

  // Handle Deleted Filenames (Remove from Array)
  if (update.deleteFilenames) {
    try {
      const delList =
        typeof update.deleteFilenames === "string"
          ? JSON.parse(update.deleteFilenames)
          : update.deleteFilenames;

      if (Array.isArray(delList) && delList.length) {
        // Just remove from DB array. Cloudinary deletion is optional for free tier.
        existing.images = (existing.images || []).filter(
          (img) => !delList.includes(img.filename)
        );
      }
    } catch (e) {
      console.warn("deleteFilenames parse error", e);
    }
  }

  // Handle New Image Uploads via Cloudinary
  if (req.files && req.files.length) {
    const startIndex = (existing.images || []).length;
    const variantIdForUploads = req.body.variantId || update.variantId || null;

    for (let i = 0; i < req.files.length; i++) {
      const f = req.files[i];
      // Upload to Cloudinary
      const result = await uploadToCloudinary(f.buffer);

      existing.images.push({
        url: result.secure_url,
        filename: result.public_id,
        alt: `${existing.name || update.name || ""} - image ${
          startIndex + i + 1
        }`,
        isPrimary: (existing.images || []).length === 0 && i === 0,
        sortOrder: startIndex + i,
        variant: variantIdForUploads || null,
      });
    }
  }

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
    if (update[k] !== undefined) {
      if (["featured", "trending", "isBestOffer"].includes(k)) {
        existing[k] = update[k] === "true" || update[k] === true;
      } else {
        existing[k] = update[k];
      }
    }
  }

  if (update.name && update.name !== existing.name) {
    existing.slug = `${update.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Date.now().toString(36).slice(-5)}`;
  }

  await existing.save();
  await existing.populate("category", "name slug");

  try {
    const newCategoryId = existing.category
      ? (existing.category._id || existing.category).toString()
      : null;

    if (newCategoryId) {
      await updateCategoryProductCount(newCategoryId);
    }
    if (oldCategoryId && oldCategoryId !== newCategoryId) {
      await updateCategoryProductCount(oldCategoryId);
    }
  } catch (err) {
    console.warn("updateCategoryProductCount failed after update:", err);
  }

  const out = existing.toObject();
  out.images = (out.images || []).map((img) => ({
    ...img,
    fullUrl: img.url, // Cloudinary URL is full
  }));

  res.json({ success: true, message: "Updated", data: out });
});

/* -------------------- Delete Product -------------------- */
export const deleteProduct = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) {
    const e = new Error("Product not found");
    e.statusCode = 404;
    throw e;
  }

  const categoryId = p.category ? p.category.toString() : null;

  // No need to delete local files. Cloudinary auto-manages or we can ignore.
  await Product.findByIdAndDelete(req.params.id);

  try {
    if (categoryId) await updateCategoryProductCount(categoryId);
  } catch (err) {
    console.warn("updateCategoryProductCount failed after delete:", err);
  }

  res.json({ success: true, message: "Product deleted" });
});

/* -------------------- Reorder Images -------------------- */
export const reorderImages = asyncHandler(async (req, res) => {
  const { imageFilenames } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product)
    throw Object.assign(new Error("Product not found"), { statusCode: 404 });

  if (!Array.isArray(imageFilenames)) {
    const err = new Error("imageFilenames must be array");
    err.statusCode = 400;
    throw err;
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

  if (!product)
    throw Object.assign(new Error("Product not found"), { statusCode: 404 });

  let found = false;
  product.images.forEach((img) => {
    if (img.filename === filename) {
      img.isPrimary = true;
      found = true;
    } else img.isPrimary = false;
  });

  if (!found) {
    const err = new Error("filename not found in product images");
    err.statusCode = 400;
    throw err;
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
