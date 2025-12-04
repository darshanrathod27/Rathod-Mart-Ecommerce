import mongoose from "mongoose";

const variantMasterSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    size: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductSizeMapping",
      required: true,
    },
    color: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductColorMapping",
      required: true,
    },
    price: { type: Number, required: true, min: 0 },
    // Warning Fix: 'sparse: true' yahan se hata diya, niche index me hai
    sku: { type: String, trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// SKU auto-generate logic
variantMasterSchema.pre("save", async function (next) {
  if (!this.sku && this.isNew) {
    const product = await mongoose.model("Product").findById(this.product);
    const prefix = product?.name?.substring(0, 3).toUpperCase() || "VAR";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000);
    this.sku = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Indexes
variantMasterSchema.index({ product: 1, size: 1, color: 1 }, { unique: true });
variantMasterSchema.index({ product: 1 });
variantMasterSchema.index({ status: 1 });
variantMasterSchema.index({ isDeleted: 1 });
// SKU index yahan define hai, isliye upar field me 'sparse' hata diya
variantMasterSchema.index({ sku: 1 }, { unique: true, sparse: true });

export default mongoose.model("VariantMaster", variantMasterSchema);
