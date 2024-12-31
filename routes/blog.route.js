const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Blog = require("../models/blog.model");
const Comment = require("../models/comment.model");

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.resolve(`./public/uploads/blogs`);

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

// GET Add Blog Page
router.get("/add-new-blog", (req, res) => {
  if (!req.user) return res.redirect("/user/signin"); // Ensure user is logged in
  return res.render("addBlog", { user: req.user });
});

// POST Create Blog
router.post("/", upload.single("coverImage"), async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!req.user)
      return res
        .status(401)
        .render("error", { message: "Unauthorized", user: null });

    await Blog.create({
      title,
      content,
      createdBy: req.user.id, // Reference the logged-in user
      coverImage: req.file ? `/uploads/blogs/${req.file.filename}` : null,
    });

    return res.redirect(`/`);
  } catch (error) {
    console.error(error);
    res.render("error", {
      message: "Error creating blog post",
      user: req.user,
    });
  }
});

// GET Blog Details (with populated user details)
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({ blogId: req.params.id }).populate(
      "createdBy"
    );

    if (!blog)
      return res
        .status(404)
        .render("error", { message: "Blog not found", user: req.user });

    return res.render("blog", { blog, comments, user: req.user });
  } catch (error) {
    console.error(error);
    return res.status(500).render("error", {
      message: "Error fetching blog details",
      user: req.user,
    });
  }
});

// POST comment on blog
router.post("/:blogId/comment", async (req, res) => {
  try {
    await Comment.create({
      blogId: req.params.blogId,
      content: req.body.content,
      createdBy: req.user.id, // Reference the logged-in user
    });
    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (error) {
    console.error(error);
    return res.status(500).render("error", {
      message: "Error commenting on blog",
      user: req.user,
    });
  }
});

module.exports = router;
