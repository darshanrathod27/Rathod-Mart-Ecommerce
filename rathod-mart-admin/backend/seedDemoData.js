/**
 * 🚀 RATHOD MART DEMO DATA SEEDER
 * Creates: 20 Categories, 100 Products (5 per category), Variants, Inventory
 * Run: node seedDemoData.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Product from './models/Product.js';
import ProductColorMapping from './models/ProductColorMapping.js';
import ProductSizeMapping from './models/ProductSizeMapping.js';
import VariantMaster from './models/VariantMaster.js';
import InventoryLedger from './models/InventoryLedger.js';

dotenv.config();
const MONGODB_URI = process.env.MONGO_URI;

const CATEGORIES = [
    { name: "Electronics", icon: "📱", description: "Phones, Laptops & Gadgets" },
    { name: "Fashion Men", icon: "👔", description: "Men's Clothing & Accessories" },
    { name: "Fashion Women", icon: "👗", description: "Women's Clothing & Accessories" },
    { name: "Home & Kitchen", icon: "🏠", description: "Home Decor & Kitchen Items" },
    { name: "Beauty & Health", icon: "💄", description: "Skincare, Makeup & Health" },
    { name: "Sports & Fitness", icon: "⚽", description: "Sports Equipment & Fitness" },
    { name: "Books & Stationery", icon: "📚", description: "Books, Pens & Office Supplies" },
    { name: "Toys & Games", icon: "🎮", description: "Kids Toys & Video Games" },
    { name: "Footwear", icon: "👟", description: "Shoes, Sandals & Boots" },
    { name: "Watches", icon: "⌚", description: "Smart Watches & Analog" },
    { name: "Jewelry", icon: "💍", description: "Gold, Silver & Fashion Jewelry" },
    { name: "Bags & Luggage", icon: "🎒", description: "Backpacks, Handbags & Travel" },
    { name: "Furniture", icon: "🛋️", description: "Tables, Chairs & Beds" },
    { name: "Grocery", icon: "🛒", description: "Food & Daily Essentials" },
    { name: "Baby & Kids", icon: "👶", description: "Baby Products & Kids Items" },
    { name: "Automotive", icon: "🚗", description: "Car Accessories & Parts" },
    { name: "Garden & Outdoor", icon: "🌿", description: "Plants, Tools & Outdoor Furniture" },
    { name: "Pet Supplies", icon: "🐕", description: "Pet Food, Toys & Accessories" },
    { name: "Musical Instruments", icon: "🎸", description: "Guitars, Keyboards & More" },
    { name: "Office & Business", icon: "💼", description: "Office Furniture & Supplies" },
];

const COLORS = [
    { colorName: "Black", value: "#000000" },
    { colorName: "White", value: "#FFFFFF" },
    { colorName: "Red", value: "#FF0000" },
    { colorName: "Blue", value: "#0000FF" },
    { colorName: "Navy", value: "#000080" },
];

const SIZES = [
    { sizeName: "S", value: "S" },
    { sizeName: "M", value: "M" },
    { sizeName: "L", value: "L" },
    { sizeName: "XL", value: "XL" },
];

const getImg = (id) => `https://picsum.photos/seed/${id}/800/800`;

// Generate description HTML
function genDesc(title, tagline, features) {
    return `<h3>${title}</h3>
<p><strong>${tagline}</strong></p>
<h4>✨ Key Features:</h4>
<ul>
${features.map(f => `<li>✅ ${f}</li>`).join('\n')}
</ul>
<h4>📦 Package Contents:</h4>
<ul>
<li>• Product as shown</li>
<li>• User Manual</li>
<li>• Warranty Card</li>
</ul>
<h4>🛡️ Warranty:</h4>
<p>Brand warranty included</p>`;
}

// All products organized by category
const PRODUCTS = {
    "Electronics": [
        { name: "iPhone 15 Pro Max 256GB", price: 139900, discount: 10, brand: "Apple", features: ["A17 Pro Chip", "48MP Camera", "Titanium Body", "USB-C", "6.7\" Display"] },
        { name: "Samsung Galaxy S24 Ultra", price: 129999, discount: 15, brand: "Samsung", features: ["Galaxy AI", "200MP Camera", "S Pen", "Snapdragon 8 Gen 3", "5000mAh Battery"] },
        { name: "MacBook Air M3 13-inch", price: 114900, discount: 5, brand: "Apple", features: ["M3 Chip", "18hr Battery", "Fanless Design", "8GB RAM", "256GB SSD"] },
        { name: "Sony WH-1000XM5 Headphones", price: 29990, discount: 20, brand: "Sony", features: ["Active Noise Cancellation", "30hr Battery", "Hi-Res Audio", "Multipoint Connection", "Touch Controls"] },
        { name: "iPad Pro 12.9 M2 Chip", price: 112900, discount: 8, brand: "Apple", features: ["M2 Chip", "Liquid Retina XDR", "Face ID", "Thunderbolt", "Apple Pencil Support"] },
    ],
    "Fashion Men": [
        { name: "Premium Cotton Formal Shirt", price: 1499, discount: 20, brand: "Peter England", features: ["100% Cotton", "Slim Fit", "Full Sleeves", "Wrinkle-Free", "Machine Washable"], hasVariants: true },
        { name: "Classic Denim Jeans 501", price: 2299, discount: 25, brand: "Levis", features: ["501 Original Fit", "100% Cotton Denim", "Button Fly", "5 Pocket Styling", "Vintage Wash"], hasVariants: true },
        { name: "Casual Round Neck T-Shirt", price: 699, discount: 30, brand: "H&M", features: ["Organic Cotton", "Regular Fit", "Soft Feel", "Ribbed Collar", "Multiple Colors"], hasVariants: true },
        { name: "Formal Blazer Slim Fit", price: 4999, discount: 35, brand: "Raymond", features: ["Wool Blend", "Slim Fit", "Single Breasted", "Notch Lapel", "Two Button"], hasVariants: true },
        { name: "Chino Pants Regular Fit", price: 1799, discount: 20, brand: "Allen Solly", features: ["Cotton Stretch", "Regular Fit", "Flat Front", "Belt Loops", "Multiple Colors"], hasVariants: true },
    ],
    "Fashion Women": [
        { name: "Floral Print Anarkali Kurti", price: 1199, discount: 35, brand: "Biba", features: ["Floral Print", "Anarkali Style", "3/4 Sleeves", "Rayon Fabric", "Festive Wear"], hasVariants: true },
        { name: "Banarasi Silk Saree", price: 4999, discount: 20, brand: "Fabindia", features: ["Pure Silk", "Zari Work", "5.5m Length", "Blouse Piece", "Handwoven"], hasVariants: true },
        { name: "Western Bodycon Dress", price: 1899, discount: 40, brand: "Zara", features: ["Stretch Fabric", "Bodycon Fit", "Sleeveless", "Back Zip", "Party Wear"], hasVariants: true },
        { name: "Cotton Palazzo Pants", price: 899, discount: 25, brand: "W", features: ["Pure Cotton", "Wide Leg", "Elastic Waist", "Breathable", "Casual Wear"], hasVariants: true },
        { name: "Embroidered Lehenga Set", price: 8999, discount: 30, brand: "Meena Bazaar", features: ["Heavy Embroidery", "Semi-Stitched", "Net Dupatta", "Silk Blend", "Wedding Wear"], hasVariants: true },
    ],
    "Home & Kitchen": [
        { name: "Non-Stick Cookware Set 5Pcs", price: 3999, discount: 30, brand: "Prestige", features: ["3-Layer Coating", "Induction Ready", "Cool Touch Handle", "Glass Lids", "Scratch Resistant"] },
        { name: "Mixer Grinder 750W", price: 5499, discount: 25, brand: "Philips", features: ["750W Motor", "3 Jars", "Overload Protection", "SS Blades", "5 Year Warranty"] },
        { name: "Air Fryer 4.5L Digital", price: 7999, discount: 35, brand: "Philips", features: ["4.5L Capacity", "Digital Display", "8 Presets", "Rapid Air Tech", "Dishwasher Safe"] },
        { name: "Microwave Oven 25L Convection", price: 12999, discount: 20, brand: "Samsung", features: ["25L Capacity", "Convection", "Auto Cook", "Child Lock", "Ceramic Interior"] },
        { name: "Water Purifier RO+UV", price: 15999, discount: 25, brand: "Kent", features: ["RO+UV+UF", "8L Storage", "TDS Controller", "Mineral Retention", "Digital Display"] },
    ],
    "Beauty & Health": [
        { name: "Vitamin C Face Serum 30ml", price: 999, discount: 15, brand: "Mamaearth", features: ["15% Vitamin C", "Brightening", "Natural Ingredients", "Derma Tested", "For All Skin Types"] },
        { name: "Bhringraj Hair Oil 200ml", price: 449, discount: 20, brand: "Biotique", features: ["Ayurvedic Formula", "Anti Hair Fall", "Promotes Growth", "Coconut Base", "Chemical Free"] },
        { name: "Retinol Night Cream 50g", price: 1299, discount: 25, brand: "Olay", features: ["Retinol 24", "Anti-Aging", "Hydrating", "Fragrance Free", "Dermatologist Tested"] },
        { name: "Sunscreen SPF 50+ 100ml", price: 599, discount: 10, brand: "Neutrogena", features: ["SPF 50+ PA+++", "Water Resistant", "Non-Greasy", "Broad Spectrum", "Daily Use"] },
        { name: "Hair Straightener Ceramic", price: 2499, discount: 30, brand: "Philips", features: ["Ceramic Plates", "5 Temp Settings", "Ionic Care", "Auto Shut Off", "Swivel Cord"] },
    ],
    "Sports & Fitness": [
        { name: "Anti-Slip Yoga Mat 6mm", price: 1299, discount: 10, brand: "Nike", features: ["6mm Thick", "Anti-Slip", "Alignment Lines", "Eco-Friendly TPE", "Carrying Strap"] },
        { name: "Running Shoes UltraBoost", price: 12999, discount: 35, brand: "Adidas", features: ["Boost Midsole", "Primeknit Upper", "Continental Rubber", "Torsion System", "Lightweight"], hasVariants: true },
        { name: "Adjustable Dumbbells 20Kg", price: 4999, discount: 20, brand: "Decathlon", features: ["2.5-20Kg Range", "Quick Lock", "Rubber Coated", "Space Saving", "Home Gym"] },
        { name: "Fitness Tracker Band", price: 3999, discount: 25, brand: "Fitbit", features: ["Heart Rate Monitor", "Sleep Tracking", "Water Resistant", "7 Day Battery", "GPS Connected"] },
        { name: "Resistance Bands Set", price: 999, discount: 15, brand: "Decathlon", features: ["5 Resistance Levels", "Latex Free", "Handles Included", "Door Anchor", "Carry Bag"] },
    ],
    "Books & Stationery": [
        { name: "Atomic Habits Book", price: 499, discount: 20, brand: "Penguin", features: ["Bestseller", "Self Help", "Paperback", "320 Pages", "James Clear"] },
        { name: "Premium Notebook A5 Set", price: 599, discount: 15, brand: "Classmate", features: ["A5 Size", "200 Pages Each", "Ruled", "Hard Cover", "Pack of 3"] },
        { name: "Parker Pen Gift Set", price: 1999, discount: 25, brand: "Parker", features: ["Parker Jotter", "Ballpoint + Rollerball", "SS Body", "Gift Box", "Lifetime Warranty"] },
        { name: "Art Supplies Kit Complete", price: 2499, discount: 30, brand: "Faber-Castell", features: ["72 Colors", "Pencils + Pastels", "Sketch Pads", "Blending Tools", "Carry Case"] },
        { name: "Scientific Calculator", price: 899, discount: 10, brand: "Casio", features: ["252 Functions", "Natural Display", "10+2 Digits", "Solar + Battery", "Slide Cover"] },
    ],
    "Toys & Games": [
        { name: "LEGO City Building Set 500pc", price: 2999, discount: 15, brand: "LEGO", features: ["500+ Pieces", "6 Minifigures", "2 Vehicles", "Age 6+", "Compatible Sets"] },
        { name: "RC Racing Car 2.4GHz", price: 2499, discount: 20, brand: "Hot Wheels", features: ["25 km/h Speed", "2.4GHz Remote", "LED Lights", "Rechargeable", "All Terrain"] },
        { name: "Board Game Monopoly Classic", price: 1499, discount: 10, brand: "Hasbro", features: ["2-8 Players", "Classic Edition", "Property Trading", "Family Game", "Ages 8+"] },
        { name: "Puzzle 1000 Pieces", price: 799, discount: 15, brand: "Ravensburger", features: ["1000 Pieces", "Premium Quality", "Landscape Theme", "Anti-Glare", "Perfect Fit"] },
        { name: "Action Figure Collection", price: 1999, discount: 25, brand: "Marvel", features: ["6-inch Figures", "Set of 5", "Poseable", "Collectible", "Gift Box"] },
    ],
    "Footwear": [
        { name: "Italian Leather Formal Shoes", price: 3499, discount: 25, brand: "Bata", features: ["Italian Leather", "Memory Foam", "Hand Stitched", "Rubber Sole", "Oxford Style"], hasVariants: true },
        { name: "RS-X Sports Sneakers", price: 5999, discount: 30, brand: "Puma", features: ["RS Cushioning", "Chunky Design", "Mixed Materials", "Street Style", "Comfortable"], hasVariants: true },
        { name: "Canvas Casual Sneakers", price: 1999, discount: 20, brand: "Converse", features: ["Canvas Upper", "Rubber Sole", "Classic Design", "Ankle High", "Lace Up"], hasVariants: true },
        { name: "Leather Sandals Men", price: 1499, discount: 15, brand: "Woodland", features: ["Genuine Leather", "Cushioned Footbed", "Velcro Strap", "Anti-Slip", "Outdoor Use"], hasVariants: true },
        { name: "Running Shoes Gel-Kayano", price: 8999, discount: 35, brand: "ASICS", features: ["GEL Technology", "FlyteFoam", "Dynamic DuoMax", "Guidance Line", "Breathable"], hasVariants: true },
    ],
    "Watches": [
        { name: "Apple Watch Ultra 2", price: 89999, discount: 10, brand: "Apple", features: ["49mm Titanium", "100m Water Resistant", "Dual GPS", "36hr Battery", "Action Button"] },
        { name: "Classic Analog Watch", price: 3499, discount: 15, brand: "Titan", features: ["Japanese Movement", "Leather Strap", "30m Water Resist", "2 Year Warranty", "Gift Box"] },
        { name: "G-Shock Digital Watch", price: 7999, discount: 20, brand: "Casio", features: ["Shock Resistant", "200m Water Proof", "World Time", "Stopwatch", "LED Light"] },
        { name: "Chronograph Steel Watch", price: 12999, discount: 25, brand: "Fossil", features: ["Quartz Movement", "SS Case", "Chronograph", "Date Display", "Mineral Crystal"] },
        { name: "Smart Watch Pro Series", price: 24999, discount: 30, brand: "Samsung", features: ["AMOLED Display", "Health Monitoring", "GPS Built-in", "5 Day Battery", "Water Proof"] },
    ],
    "Jewelry": [
        { name: "Gold Plated Necklace Set", price: 2999, discount: 20, brand: "Tanishq", features: ["Gold Plated", "Kundan Work", "Earrings Included", "Adjustable", "Traditional Design"] },
        { name: "Silver Anklet Pair", price: 1499, discount: 15, brand: "Malabar", features: ["925 Sterling Silver", "Ghungroo Design", "Adjustable Size", "Hallmarked", "Anti-Tarnish"] },
        { name: "Diamond Stud Earrings", price: 15999, discount: 10, brand: "Kalyan", features: ["Real Diamonds", "14K Gold", "Certified", "Push Back", "Gift Box"] },
        { name: "Pearl Bracelet String", price: 999, discount: 25, brand: "Zaveri", features: ["Freshwater Pearls", "Elastic String", "One Size", "White Color", "Daily Wear"] },
        { name: "Men's Silver Chain", price: 3999, discount: 20, brand: "Malabar", features: ["925 Silver", "20 inch Length", "Curb Link", "Lobster Clasp", "Hallmarked"] },
    ],
    "Bags & Luggage": [
        { name: "Laptop Backpack 30L", price: 1799, discount: 25, brand: "Wildcraft", features: ["30L Capacity", "Water Resistant", "USB Port", "Padded Straps", "15.6 inch Laptop"] },
        { name: "Hard Shell Trolley 24inch", price: 4999, discount: 30, brand: "American Tourister", features: ["Polycarbonate", "TSA Lock", "4 Spinner Wheels", "Expandable", "Scratch Proof"] },
        { name: "Leather Messenger Bag", price: 2999, discount: 20, brand: "Hidesign", features: ["Genuine Leather", "Laptop Sleeve", "Adjustable Strap", "Multiple Pockets", "Brown Color"] },
        { name: "Duffle Bag Gym 35L", price: 1299, discount: 15, brand: "Nike", features: ["35L Capacity", "Shoe Compartment", "Waterproof", "Shoulder Strap", "Zip Closure"] },
        { name: "Ladies Handbag Tote", price: 2499, discount: 25, brand: "Lavie", features: ["Faux Leather", "Spacious", "Zip Closure", "Inner Pockets", "Matching Pouch"] },
    ],
    "Furniture": [
        { name: "Ergonomic Office Chair", price: 12999, discount: 30, brand: "Featherlite", features: ["Lumbar Support", "Adjustable Height", "Mesh Back", "Armrests", "360° Swivel"] },
        { name: "Wooden Study Table", price: 8999, discount: 25, brand: "Urban Ladder", features: ["Engineered Wood", "Drawer Storage", "Cable Management", "Scratch Resistant", "Easy Assembly"] },
        { name: "L-Shape Sofa Set", price: 45999, discount: 20, brand: "Godrej", features: ["5 Seater", "Fabric Upholstery", "High Density Foam", "Solid Wood Frame", "10 Year Warranty"] },
        { name: "King Size Bed with Storage", price: 28999, discount: 15, brand: "Durian", features: ["Hydraulic Storage", "Engineered Wood", "King Size", "Headboard", "5 Year Warranty"] },
        { name: "Bookshelf 5 Tier", price: 4999, discount: 20, brand: "Nilkamal", features: ["5 Shelves", "MDF Board", "Open Design", "Wall Mountable", "150kg Capacity"] },
    ],
    "Grocery": [
        { name: "Organic Honey 500g", price: 499, discount: 10, brand: "Dabur", features: ["100% Organic", "NMR Tested", "FSSAI Certified", "Himalayan Source", "No Added Sugar"] },
        { name: "Basmati Rice 5Kg Premium", price: 899, discount: 15, brand: "India Gate", features: ["Extra Long Grain", "Aged 2 Years", "Aromatic", "1121 Variety", "No Additives"] },
        { name: "Cold Pressed Coconut Oil 1L", price: 599, discount: 20, brand: "Parachute", features: ["Cold Pressed", "100% Pure", "Cooking + Hair", "No Chemicals", "FSSAI Certified"] },
        { name: "Mixed Dry Fruits 1Kg", price: 1299, discount: 25, brand: "Happilo", features: ["Premium Quality", "No Added Sugar", "Vacuum Packed", "Rich in Nutrients", "Gift Pack"] },
        { name: "Green Tea 100 Bags", price: 399, discount: 15, brand: "Lipton", features: ["100 Tea Bags", "Antioxidant Rich", "Zero Calories", "Natural Flavor", "Individually Packed"] },
    ],
    "Baby & Kids": [
        { name: "Premium Diapers XL 50pcs", price: 1299, discount: 20, brand: "Pampers", features: ["12hr Dryness", "Cotton Soft", "Wetness Indicator", "Hypoallergenic", "XL Size"] },
        { name: "Baby Stroller Foldable", price: 8999, discount: 25, brand: "LuvLap", features: ["Foldable", "5-Point Harness", "Canopy", "Storage Basket", "Reversible Handle"] },
        { name: "Kids Learning Tablet", price: 3999, discount: 30, brand: "LeapFrog", features: ["Educational Games", "WiFi Enabled", "Parental Controls", "Durable Design", "Ages 3-9"] },
        { name: "Baby Feeding Set 6pcs", price: 899, discount: 15, brand: "Chicco", features: ["BPA Free", "Microwave Safe", "Easy Grip", "Colorful", "Dishwasher Safe"] },
        { name: "Kids Bicycle 16 inch", price: 5999, discount: 20, brand: "Hero", features: ["16 inch Wheels", "Training Wheels", "Bell Included", "Steel Frame", "Ages 4-8"] },
    ],
    "Automotive": [
        { name: "Car Dash Camera 4K", price: 4999, discount: 25, brand: "70mai", features: ["4K Recording", "Night Vision", "Wide Angle", "Parking Mode", "Loop Recording"] },
        { name: "Car Seat Cover Set", price: 2999, discount: 20, brand: "AutoFurnish", features: ["Universal Fit", "Faux Leather", "Waterproof", "Easy Install", "Full Set"], hasVariants: true },
        { name: "Tyre Inflator Portable", price: 1999, discount: 15, brand: "Michelin", features: ["Digital Display", "Auto Stop", "LED Light", "12V Power", "Compact Size"] },
        { name: "Car Vacuum Cleaner", price: 1499, discount: 20, brand: "Eureka Forbes", features: ["Corded", "Wet & Dry", "Strong Suction", "Accessories", "Compact"] },
        { name: "GPS Navigation 7inch", price: 6999, discount: 30, brand: "Garmin", features: ["7 inch Screen", "Lifetime Maps", "Voice Guide", "Traffic Alerts", "Bluetooth"] },
    ],
    "Garden & Outdoor": [
        { name: "Garden Tool Set 10pcs", price: 1999, discount: 20, brand: "Kraft Seeds", features: ["10 Tools", "Ergonomic Handles", "Rust Proof", "Carry Bag", "Complete Set"] },
        { name: "Solar Garden Lights 8pc", price: 1499, discount: 25, brand: "Hardoll", features: ["Solar Powered", "Auto On/Off", "Waterproof", "8 Pack", "Path Lights"] },
        { name: "Outdoor Hammock Cotton", price: 2499, discount: 15, brand: "Hangit", features: ["Cotton Rope", "250kg Capacity", "Weather Resistant", "Stand Not Included", "Relaxing"] },
        { name: "Plant Pots Ceramic Set", price: 999, discount: 20, brand: "Ugaoo", features: ["Set of 4", "Ceramic", "Drainage Holes", "Modern Design", "Indoor Use"] },
        { name: "Lawn Mower Electric", price: 12999, discount: 30, brand: "Bosch", features: ["1300W Motor", "32cm Cut Width", "Grass Box 31L", "Ergonomic Handle", "Safety Switch"] },
    ],
    "Pet Supplies": [
        { name: "Dog Food Premium 10Kg", price: 3999, discount: 15, brand: "Pedigree", features: ["Chicken + Veg", "All Breeds", "Balanced Nutrition", "Omega 3", "No Artificial Colors"] },
        { name: "Cat Litter Sand 10Kg", price: 999, discount: 20, brand: "Catsan", features: ["Clumping", "Odor Control", "Low Dust", "Natural Clay", "Biodegradable"] },
        { name: "Pet Bed Orthopedic", price: 2499, discount: 25, brand: "Petmate", features: ["Memory Foam", "Washable Cover", "Non-Slip Base", "Joint Support", "All Sizes"] },
        { name: "Dog Leash + Collar Set", price: 799, discount: 15, brand: "Heads Up", features: ["Nylon Material", "Adjustable Collar", "5ft Leash", "Metal Clips", "Reflective"], hasVariants: true },
        { name: "Aquarium Tank 20L", price: 1999, discount: 20, brand: "Sobo", features: ["20L Capacity", "LED Light", "Filter Included", "Glass Tank", "Complete Setup"] },
    ],
    "Musical Instruments": [
        { name: "Acoustic Guitar Beginner", price: 4999, discount: 25, brand: "Yamaha", features: ["Spruce Top", "38 inch Size", "Steel Strings", "Tuner Included", "Carry Bag"] },
        { name: "Digital Keyboard 61 Keys", price: 8999, discount: 20, brand: "Casio", features: ["61 Keys", "200 Tones", "Built-in Speakers", "USB MIDI", "Dance Music Mode"] },
        { name: "Cajon Drum Box", price: 3999, discount: 15, brand: "Meinl", features: ["Baltic Birch", "Snare Wires", "Portable", "Deep Bass", "Traditional Sound"] },
        { name: "Ukulele Soprano 21inch", price: 1999, discount: 20, brand: "Kadence", features: ["21 inch Soprano", "Basswood Body", "Nylon Strings", "Beginner Friendly", "Case Included"] },
        { name: "Microphone Condenser USB", price: 2999, discount: 30, brand: "Blue", features: ["USB Connection", "Cardioid Pattern", "Plug & Play", "Studio Quality", "Desk Stand"] },
    ],
    "Office & Business": [
        { name: "Laser Printer Wireless", price: 15999, discount: 25, brand: "HP", features: ["Wireless", "Duplex Printing", "25 ppm", "Mobile Print", "Toner Included"] },
        { name: "Shredder Cross Cut", price: 4999, discount: 20, brand: "Kores", features: ["Cross Cut", "10 Sheets", "18L Bin", "Credit Cards", "Auto Reverse"] },
        { name: "Projector Full HD", price: 45999, discount: 30, brand: "BenQ", features: ["1080p Full HD", "3600 Lumens", "HDMI", "Low Noise", "Keystone Correction"] },
        { name: "Whiteboard Magnetic 4x3ft", price: 2999, discount: 15, brand: "Luxor", features: ["Magnetic Surface", "4x3 Feet", "Aluminum Frame", "Markers Included", "Wall Mount"] },
        { name: "Document Scanner Portable", price: 8999, discount: 25, brand: "Canon", features: ["Portable", "WiFi Enabled", "Duplex Scan", "Sheet Fed", "Cloud Upload"] },
    ],
};

// Seed functions
async function seedCategories() {
    console.log("📁 Creating 20 Categories...");
    const cats = [];
    for (const cat of CATEGORIES) {
        const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let existing = await Category.findOne({ slug });
        if (!existing) {
            existing = await Category.create({ name: cat.name, slug, icon: cat.icon, description: cat.description, status: 'Active', productsCount: 0 });
            console.log(`  ✅ ${cat.name}`);
        } else {
            console.log(`  ⏭️  ${cat.name} exists`);
        }
        cats.push(existing);
    }
    return cats;
}

async function seedProducts(categories) {
    console.log("\n📦 Creating Products with Variants & Inventory...");
    let totalProducts = 0, totalVariants = 0, totalInventory = 0;

    for (const cat of categories) {
        const prods = PRODUCTS[cat.name];
        if (!prods) continue;

        for (const p of prods) {
            const existing = await Product.findOne({ name: p.name });
            if (existing) {
                console.log(`  ⏭️  ${p.name} exists`);
                continue;
            }

            const discountPrice = Math.round(p.price * (1 - p.discount / 100));
            const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36).slice(-4);
            const desc = genDesc(`${p.brand} ${p.name}`, `Premium quality ${p.name.toLowerCase()} from ${p.brand}`, p.features);

            const product = await Product.create({
                name: p.name, slug, category: cat._id, brand: p.brand,
                description: desc, shortDescription: `${p.brand} - ${p.features.slice(0, 2).join(', ')}`,
                basePrice: p.price, discountPrice, status: 'active',
                featured: totalProducts % 5 === 0, trending: totalProducts % 3 === 0, isBestOffer: totalProducts % 7 === 0,
                tags: p.features, features: p.features,
                images: [{ url: getImg(p.name.replace(/\s/g, '_')), filename: `demo-${slug}`, isPrimary: true, sortOrder: 0 }],
                totalStock: 0,
            });
            console.log(`  ✅ ${p.name}`);
            totalProducts++;

            if (p.hasVariants) {
                // Create colors + sizes for this product
                const colors = [], sizes = [];
                for (const c of COLORS.slice(0, 3)) {
                    const nc = await ProductColorMapping.create({ product: product._id, colorName: c.colorName, value: c.value, status: 'Active' });
                    colors.push(nc);
                }
                for (const s of SIZES) {
                    const ns = await ProductSizeMapping.create({ product: product._id, sizeName: s.sizeName, value: s.value, status: 'Active' });
                    sizes.push(ns);
                }
                // Create variants
                for (const c of colors) {
                    for (const s of sizes) {
                        const v = await VariantMaster.create({ product: product._id, color: c._id, size: s._id, price: p.price + Math.floor(Math.random() * 100), status: 'Active' });
                        // Add inventory
                        const stock = Math.floor(Math.random() * 50) + 10;
                        await InventoryLedger.create({ product: product._id, variant: v._id, referenceType: 'Purchase', quantity: stock, type: 'IN', balanceStock: stock, remarks: 'Initial stock' });
                        totalVariants++; totalInventory++;
                    }
                }
                console.log(`    📊 12 variants + inventory`);
            } else {
                // Add inventory for base product
                const stock = Math.floor(Math.random() * 100) + 20;
                await InventoryLedger.create({ product: product._id, referenceType: 'Purchase', quantity: stock, type: 'IN', balanceStock: stock, remarks: 'Initial stock' });
                await Product.findByIdAndUpdate(product._id, { stock, totalStock: stock });
                totalInventory++;
            }
            await Category.findByIdAndUpdate(cat._id, { $inc: { productsCount: 1 } });
        }
    }
    return { totalProducts, totalVariants, totalInventory };
}

async function main() {
    console.log("🚀 RATHOD MART DEMO DATA SEEDER v2.0");
    console.log("=====================================\n");
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB!\n");

        const cats = await seedCategories();
        const { totalProducts, totalVariants, totalInventory } = await seedProducts(cats);

        console.log("\n=====================================");
        console.log("🎉 SEEDING COMPLETE!");
        console.log("=====================================");
        console.log(`📊 Categories: ${cats.length}`);
        console.log(`📦 Products: ${totalProducts}`);
        console.log(`🎨 Variants: ${totalVariants}`);
        console.log(`📋 Inventory Records: ${totalInventory}`);
    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Disconnected");
        process.exit(0);
    }
}

main();
