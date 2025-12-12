/**
 * 🚀 ADVANCED PRODUCT IMAGE & VARIANT UPDATER
 * Production-ready script for Rathod Mart
 * 
 * Features:
 * - Upload multiple images per product
 * - Update variant images (max 3 per variant)
 * - Set proper stock levels (some in stock, some out)
 * - Set variant prices
 * - Remove old placeholder images
 * - Full Cloudinary integration
 * 
 * Run: node updateProductsAdvanced.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './models/Product.js';
import VariantMaster from './models/VariantMaster.js';
import ProductColorMapping from './models/ProductColorMapping.js';
import InventoryLedger from './models/InventoryLedger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ============================================
// 📦 PRODUCT CONFIGURATIONS
// ============================================
const PRODUCT_CONFIGS = [
    {
        productName: 'iPhone 15 Pro Max 256GB',
        images: [
            { file: 'iphone_lifestyle1', isPrimary: true },
            { file: 'iphone_lifestyle2', isPrimary: false },
            { file: 'iphone_15_pro_max', isPrimary: false },
        ],
        stock: 25,
        hasVariants: false,
    },
    {
        productName: 'Premium Cotton Formal Shirt',
        images: [
            { file: 'shirt_navy_lifestyle', isPrimary: true },
            { file: 'shirt_navy_closeup', isPrimary: false },
        ],
        hasVariants: true,
        variants: [
            {
                colorName: 'Navy',
                images: ['shirt_navy_lifestyle', 'shirt_navy_closeup', 'premium_cotton_shirt_blue'],
                stock: 35,
                priceModifier: 0,
            },
            {
                colorName: 'White',
                images: ['shirt_white_lifestyle', 'shirt_white_folded', 'premium_cotton_shirt_white'],
                stock: 28,
                priceModifier: 50,
            },
            {
                colorName: 'Black',
                images: ['shirt_black_lifestyle', 'shirt_black_folded', 'premium_cotton_shirt_black'],
                stock: 0, // Out of stock
                priceModifier: 100,
            },
        ],
    },
    {
        productName: 'Sony WH-1000XM5 Headphones',
        images: [
            { file: 'headphones_lifestyle1', isPrimary: true },
            { file: 'headphones_lifestyle2', isPrimary: false },
            { file: 'sony_headphones_xm5', isPrimary: false },
        ],
        stock: 15,
        hasVariants: false,
    },
    {
        productName: 'Anti-Slip Yoga Mat 6mm',
        images: [
            { file: 'yoga_mat_lifestyle1', isPrimary: true },
            { file: 'yoga_mat_lifestyle2', isPrimary: false },
            { file: 'yoga_mat_green', isPrimary: false },
        ],
        stock: 42,
        hasVariants: false,
    },
    {
        productName: 'Italian Leather Formal Shoes',
        images: [
            { file: 'shoes_black_lifestyle1', isPrimary: true },
            { file: 'leather_formal_shoes', isPrimary: false },
        ],
        hasVariants: true,
        variants: [
            {
                colorName: 'Black',
                images: ['shoes_black_lifestyle1', 'leather_formal_shoes'],
                stock: 20,
                priceModifier: 0,
            },
            {
                colorName: 'White',
                images: ['leather_formal_shoes_brown'],
                stock: 0, // Out of stock
                priceModifier: 200,
            },
            {
                colorName: 'Red',
                images: ['leather_formal_shoes_brown'],
                stock: 12,
                priceModifier: 150,
            },
        ],
    },
];

// ============================================
// 🔧 UTILITY FUNCTIONS
// ============================================

async function uploadToCloudinary(filePath, folder = 'rathod-mart/products') {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: 'image',
            transformation: [
                { width: 1000, height: 1000, crop: 'limit' },
                { quality: 'auto:best' },
                { fetch_format: 'auto' },
            ],
        });
        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    } catch (error) {
        console.error(`  ❌ Cloudinary upload failed:`, error.message);
        return null;
    }
}

function findImageFile(imagesDir, pattern) {
    const files = fs.readdirSync(imagesDir);
    return files.find(f => f.includes(pattern) && f.endsWith('.png'));
}

async function uploadMultipleImages(imagesDir, filePatterns) {
    const uploadedUrls = [];
    for (const pattern of filePatterns) {
        const fileName = findImageFile(imagesDir, pattern);
        if (fileName) {
            const filePath = path.join(imagesDir, fileName);
            const result = await uploadToCloudinary(filePath);
            if (result) {
                uploadedUrls.push(result.url);
                console.log(`    ☁️ Uploaded: ${pattern}`);
            }
        } else {
            console.log(`    ⚠️ Not found: ${pattern}`);
        }
    }
    return uploadedUrls;
}

// ============================================
// 📦 PRODUCT UPDATE FUNCTIONS
// ============================================

async function updateProductImages(product, imageUrls, clearOld = true) {
    if (clearOld) {
        product.images = [];
    }

    imageUrls.forEach((url, index) => {
        // Extract filename from URL
        const urlParts = url.split('/');
        const fileNameFromUrl = urlParts[urlParts.length - 1] || `product-img-${Date.now()}-${index}`;

        product.images.push({
            url: url,
            filename: fileNameFromUrl,
            isPrimary: index === 0,
            sortOrder: index,
        });
    });

    await product.save();
}

async function updateProductStock(product, stock) {
    product.stock = stock;
    product.totalStock = stock;
    await product.save();

    // Add inventory ledger entry
    if (stock > 0) {
        const existingLedger = await InventoryLedger.findOne({
            product: product._id,
            variant: null
        });

        if (existingLedger) {
            existingLedger.quantity = stock;
            existingLedger.balanceStock = stock;
            await existingLedger.save();
        } else {
            await InventoryLedger.create({
                product: product._id,
                referenceType: 'Purchase',
                quantity: stock,
                type: 'IN',
                balanceStock: stock,
                remarks: 'Stock updated via AI script',
            });
        }
    }
}

async function updateVariantData(product, variantConfigs, imagesDir) {
    console.log(`  📊 Updating ${variantConfigs.length} variant configurations...`);

    for (const variantConfig of variantConfigs) {
        // Find color mapping
        const colorMapping = await ProductColorMapping.findOne({
            product: product._id,
            colorName: variantConfig.colorName,
        });

        if (!colorMapping) {
            console.log(`    ⚠️ Color not found: ${variantConfig.colorName}`);
            continue;
        }

        // Find all variants with this color
        const variants = await VariantMaster.find({
            product: product._id,
            color: colorMapping._id,
        });

        if (variants.length === 0) {
            console.log(`    ⚠️ No variants for color: ${variantConfig.colorName}`);
            continue;
        }

        // Upload variant images (max 3)
        const variantImagePatterns = variantConfig.images.slice(0, 3);
        const variantImageUrls = await uploadMultipleImages(imagesDir, variantImagePatterns);

        // Update each variant (different sizes)
        let totalVariantStock = 0;
        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];

            // Set images
            variant.images = variantImageUrls.map((url, idx) => ({
                url: url,
                isDefault: idx === 0,
            }));

            // Set price modifier
            if (variantConfig.priceModifier) {
                variant.price = product.basePrice + variantConfig.priceModifier;
            }

            await variant.save();

            // Update inventory for this variant
            // Distribute stock across sizes (some sizes get 0)
            let variantStock = 0;
            if (variantConfig.stock > 0) {
                // First 2 sizes get stock, rest are out of stock
                if (i < 2) {
                    variantStock = Math.floor(variantConfig.stock / 2);
                } else {
                    variantStock = 0;
                }
            }

            const existingLedger = await InventoryLedger.findOne({
                product: product._id,
                variant: variant._id,
            });

            if (existingLedger) {
                existingLedger.quantity = variantStock;
                existingLedger.balanceStock = variantStock;
                await existingLedger.save();
            } else if (variantStock > 0) {
                await InventoryLedger.create({
                    product: product._id,
                    variant: variant._id,
                    referenceType: 'Purchase',
                    quantity: variantStock,
                    type: 'IN',
                    balanceStock: variantStock,
                    remarks: 'Variant stock from AI script',
                });
            }

            totalVariantStock += variantStock;
        }

        console.log(`    ✅ ${variantConfig.colorName}: ${variants.length} sizes, Stock: ${totalVariantStock}`);
    }

    // Update total product stock
    const allInventory = await InventoryLedger.find({ product: product._id });
    const totalStock = allInventory.reduce((sum, inv) => sum + (inv.balanceStock || 0), 0);
    product.totalStock = totalStock;
    await product.save();
}

// ============================================
// 🚀 MAIN EXECUTION
// ============================================

async function main() {
    console.log("🚀 ADVANCED PRODUCT IMAGE & VARIANT UPDATER");
    console.log("=".repeat(55) + "\n");

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB\n");

        const imagesDir = path.join(__dirname, 'uploads', 'ai-generated-images');

        if (!fs.existsSync(imagesDir)) {
            console.log("❌ Images directory not found!");
            return;
        }

        const files = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png'));
        console.log(`📁 Found ${files.length} images available\n`);

        let productsUpdated = 0;
        let imagesUploaded = 0;
        let variantsUpdated = 0;

        for (const config of PRODUCT_CONFIGS) {
            console.log(`\n📦 Processing: ${config.productName}`);
            console.log("-".repeat(50));

            // Find product
            const product = await Product.findOne({ name: config.productName });
            if (!product) {
                console.log(`  ⚠️ Product not found, skipping...`);
                continue;
            }

            // Upload and set product images
            console.log(`  🖼️ Uploading product images...`);
            const imagePatterns = config.images.map(img => img.file);
            const productImageUrls = await uploadMultipleImages(imagesDir, imagePatterns);

            if (productImageUrls.length > 0) {
                await updateProductImages(product, productImageUrls, true);
                imagesUploaded += productImageUrls.length;
                console.log(`  ✅ ${productImageUrls.length} images set for product`);
            }

            // Handle variants or simple stock
            if (config.hasVariants && config.variants) {
                await updateVariantData(product, config.variants, imagesDir);
                variantsUpdated += config.variants.length;
            } else if (config.stock !== undefined) {
                await updateProductStock(product, config.stock);
                console.log(`  📊 Stock set to: ${config.stock}`);
            }

            productsUpdated++;
        }

        console.log("\n" + "=".repeat(55));
        console.log("🎉 UPDATE COMPLETE!");
        console.log("=".repeat(55));
        console.log(`📦 Products Updated: ${productsUpdated}`);
        console.log(`🖼️ Images Uploaded: ${imagesUploaded}`);
        console.log(`🎨 Variant Configs: ${variantsUpdated}`);

    } catch (error) {
        console.error("❌ Error:", error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Disconnected from MongoDB");
        process.exit(0);
    }
}

main();
