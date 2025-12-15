// backend/controllers/orderController.js
import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/Order.js";
import { reduceStockInternal, checkStockAvailability } from "./inventoryController.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    discountPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  // ✅ STEP 1: Check stock availability for ALL items BEFORE creating order
  const stockCheckResults = await Promise.all(
    orderItems.map(async (item) => {
      const result = await checkStockAvailability(
        item.product,
        item.variant || null,
        item.qty
      );
      return {
        ...result,
        productId: item.product,
        productName: item.name,
        variantId: item.variant,
      };
    })
  );

  // Find any items with insufficient stock
  const outOfStockItems = stockCheckResults.filter((item) => !item.available);

  if (outOfStockItems.length > 0) {
    // Return 400 Bad Request with details of which items are out of stock
    res.status(400);
    const itemsInfo = outOfStockItems
      .map((item) => `"${item.productName}" (Available: ${item.currentStock}, Requested: ${item.requested})`)
      .join(", ");
    throw new Error(`Insufficient stock for: ${itemsInfo}`);
  }

  // ✅ STEP 2: All items have stock - Create the Order
  const order = new Order({
    orderItems: orderItems.map((x) => ({
      ...x,
      product: x.product,
      variant: x.variant || null,
      _id: undefined,
    })),
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    discountPrice,
    totalPrice,
    isPaid: paymentMethod === "online",
    paidAt: paymentMethod === "online" ? Date.now() : null,
  });

  const createdOrder = await order.save();

  // ✅ STEP 3: Reduce Stock for each item (should succeed since we checked)
  try {
    await Promise.all(
      createdOrder.orderItems.map(async (item) => {
        await reduceStockInternal(
          item.product,
          item.variant,
          item.qty,
          createdOrder._id
        );
      })
    );
  } catch (error) {
    // Race condition - rollback order
    console.error("Stock reduction failed after order creation:", error.message);
    await Order.findByIdAndDelete(createdOrder._id);
    res.status(400);
    throw new Error("Failed to complete order: " + error.message);
  }

  res.status(201).json(createdOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});
