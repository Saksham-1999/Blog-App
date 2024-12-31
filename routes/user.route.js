const express = require("express");
const User = require("../models/user.model");

const router = express.Router();

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

router.get("/signout", (req, res) => {
  res.clearCookie("token").redirect("/");
});

module.exports = router;
