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
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(checkForAuthentication("token"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({}).populate("createdBy");
  return res.render("home", { user: req.user, blogs: allBlogs });
});
app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(process.env.PORT || 8765, () => {
  console.log(`Server is running on port ${process.env.PORT}`.bgBlue);
});
