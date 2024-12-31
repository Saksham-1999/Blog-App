const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const colors = require("colors");

dotenv.config();

const connectDB = require("./database/db.connection");
const userRoute = require("./routes/user.route");
const blogRoute = require("./routes/blog.route");
const {
  checkForAuthentication,
} = require("./middlewares/authentication.middleware");

const Blog = require("./models/blog.model");

connectDB();

const app = express();

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkForAuthentication("token"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search;

    // Build search query
    let query = {};
    if (searchQuery) {
      query = {
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { content: { $regex: searchQuery, $options: "i" } },
        ],
      };
    }

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit);

    const allBlogs = await Blog.find(query)
      .populate("createdBy")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.render("home", {
      user: req.user,
      blogs: allBlogs,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      searchQuery
    });
  } catch (error) {
    console.log("Error fetching blogs:", error);
    return res.status(500).render("home", {
      user: req.user,
      blogs: [],
      error: "Failed to fetch blogs",
    });
  }
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(process.env.PORT || 8765, () => {
  console.log(`Server is running on port ${process.env.PORT}`.bgBlue);
});
