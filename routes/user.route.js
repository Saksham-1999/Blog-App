const express = require("express");
const User = require("../models/user.model");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Set up multer storage configuration
const uploadDir = path.resolve(`./public/uploads/profiles`);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.get("/profile", (req, res) => {
  return res.render("profile", { user: req.user });
});

router.get("/profile/edit", (req, res) => {
  return res.render("editProfile", { user: req.user });
});

router.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    await User.create({ fullname, email, password });
    return res.redirect("/user/signin");
  } catch (error) {
    return res.render("signup", {
      error: "Email already exists",
    });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect Email or Password",
    });
  }
});

router.post(
  "/profile/edit",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const { fullname, email, bio } = req.body;
      const userId = req.user.id;

      // First check if email already exists for another user
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.render("editProfile", {
          error: "Email already in use",
          user: req.user,
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.redirect("/user/signin");
      }

      // Update user fields
      user.fullname = fullname;
      user.email = email;
      user.bio = bio;

      if (req.file) {
        // Delete old profile image if it exists and is not the default
        if (
          user.profileImage &&
          user.profileImage !== "/uploads/profiles/default.jpg"
        ) {
          const oldImagePath = path.join(
            __dirname,
            "../public",
            user.profileImage
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        user.profileImage = `/uploads/profiles/${req.file.filename}`;
      }

      await user.save();
      return res.redirect("/user/profile");
    } catch (error) {
      console.log(error);
      return res.render("editProfile", {
        error: "Error updating profile",
        user: req.user,
      });
    }
  }
);

router.get("/signout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

module.exports = router;
