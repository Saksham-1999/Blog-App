const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB".bgMagenta);
  } catch (error) {
    console.log("Error connecting to MongoDB".bgRed, error);
  }
};

module.exports = connectDB;
