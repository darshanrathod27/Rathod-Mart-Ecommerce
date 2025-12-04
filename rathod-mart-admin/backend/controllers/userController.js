// backend/controllers/userController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import {
  deleteFromCloudinary,
  getPublicIdFromUrl,
} from "../utils/cloudinary.js";

const ah = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const SORT_ALLOW = new Set([
  "name",
  "email",
  "role",
  "status",
  "createdAt",
  "updatedAt",
]);

// --- AUTH ---
export const loginAdminUser = ah(async (req, res) => {
  const { email, password } = req.body;
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    generateToken(res, "SUPER_ADMIN_ID", "admin_jwt");
    return res.json({
      _id: "SUPER_ADMIN_ID",
      name: "Super Admin",
      email: process.env.ADMIN_EMAIL,
      role: "admin",
      status: "active",
    });
  }
  const user = await User.findOne({ email }).select("+password");
  if (user && (await bcrypt.compare(password, user.password))) {
    if (["admin", "manager", "staff"].includes(user.role)) {
      if (user.status !== "active") {
        res.status(401);
        throw new Error("Account inactive");
      }
      generateToken(res, user._id, "admin_jwt");
      const userObj = user.toObject();
      delete userObj.password;
      return res.json(userObj);
    } else {
      res.status(401);
      throw new Error("Not authorized");
    }
  }
  res.status(401);
  throw new Error("Invalid email or password");
});

export const loginUser = ah(async (req, res) => {
  const { email, password } = req.body;
  const dbUser = await User.findOne({ email }).select("+password");
  if (dbUser && (await bcrypt.compare(password, dbUser.password))) {
    if (dbUser.status !== "active") {
      res.status(401);
      throw new Error("Account inactive");
    }
    generateToken(res, dbUser._id, "jwt");
    const user = dbUser.toObject();
    delete user.password;
    res.json(user);
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});

export const logoutAdmin = ah(async (req, res) => {
  res.cookie("admin_jwt", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logged out" });
});

export const logoutUser = ah(async (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logged out" });
});

// --- CRUD ---
export const registerUser = ah(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) {
    res.status(400);
    throw new Error("User exists");
  }
  const user = await User.create({
    name,
    email,
    password,
    role: "customer",
    status: "active",
  });
  if (user) {
    generateToken(res, user._id, "jwt");
    res
      .status(201)
      .json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
  } else {
    res.status(400);
    throw new Error("Invalid data");
  }
});

export const getUserProfile = ah(async (req, res) => {
  if (req.user) res.json(req.user);
  else {
    res.status(404);
    throw new Error("User not found");
  }
});

export const updateUserProfile = ah(async (req, res) => {
  if (req.user._id === "SUPER_ADMIN_ID") {
    res.status(403);
    throw new Error("Super Admin cannot be modified");
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, username, phone, birthday, password, address, profileImage } =
    req.body;

  // Handle Image Update (Delete Old)
  if (profileImage && profileImage !== user.profileImage) {
    if (user.profileImage) {
      const pid = getPublicIdFromUrl(user.profileImage);
      if (pid) await deleteFromCloudinary(pid);
    }
    user.profileImage = profileImage;
  }

  if (username && username !== user.username) {
    if (await User.findOne({ username, _id: { $ne: user._id } })) {
      res.status(409);
      throw new Error("Username taken");
    }
    user.username = username;
  }
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (birthday) user.birthday = birthday;
  if (address) user.address = { ...user.address, ...address };
  if (password) user.password = password;

  const updated = await user.save();
  res.json(updated);
});

export const createUser = ah(async (req, res) => {
  const { email, username, ...rest } = req.body;
  if (await User.findOne({ email })) {
    res.status(409);
    throw new Error("Email exists");
  }
  if (username && (await User.findOne({ username }))) {
    res.status(409);
    throw new Error("Username exists");
  }

  // Direct Create from JSON (Image URL is in req.body)
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

export const getUsers = ah(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    role,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
    dateFrom,
    dateTo,
  } = req.query;
  const p = Math.max(parseInt(page) || 1, 1);
  const l = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
  const filter = {};

  if (search) {
    const r = { $regex: search, $options: "i" };
    filter.$or = [{ name: r }, { email: r }, { phone: r }, { username: r }];
  }
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  const sort = {
    [SORT_ALLOW.has(sortBy) ? sortBy : "createdAt"]:
      String(sortOrder) === "asc" ? 1 : -1,
  };
  const [items, total] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .skip((p - 1) * l)
      .limit(l),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) },
  });
});

export const getUserById = ah(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, data: user });
});

export const updateUser = ah(async (req, res) => {
  const { id } = req.params;
  const update = { ...req.body };

  if (
    update.email &&
    (await User.findOne({ email: update.email, _id: { $ne: id } }))
  ) {
    res.status(409);
    throw new Error("Email in use");
  }
  if (
    update.username &&
    (await User.findOne({ username: update.username, _id: { $ne: id } }))
  ) {
    res.status(409);
    throw new Error("Username in use");
  }

  if (update.password) {
    const salt = await bcrypt.genSalt(12);
    update.password = await bcrypt.hash(update.password, salt);
  } else {
    delete update.password;
  }

  // Delete Old Image if Updated
  if (update.profileImage) {
    const curr = await User.findById(id);
    if (
      curr &&
      curr.profileImage &&
      curr.profileImage !== update.profileImage
    ) {
      const pid = getPublicIdFromUrl(curr.profileImage);
      if (pid) await deleteFromCloudinary(pid);
    }
  }

  const user = await User.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ success: true, data: user });
});

export const deleteUser = ah(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.profileImage) {
    const pid = getPublicIdFromUrl(user.profileImage);
    if (pid) await deleteFromCloudinary(pid);
  }

  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "User deleted" });
});
