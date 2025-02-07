const mongoose = require("mongoose");

const user = process.env.USERNAME;
const password = process.env.PASSWORD;

const connectionString = `mongodb+srv://${user}:${password}@myfirstdatabase.nc8ad.mongodb.net/trackmyhome`;

mongoose
  .connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log("Database connected"))
  .catch((error) => console.error(error));
