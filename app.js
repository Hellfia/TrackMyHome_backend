require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const fileUpload = require("express-fileupload");

require("./models/connection");

const indexRouter = require("./routes/index");
const clientsRouter = require("./routes/clients");
const projectsRouter = require("./routes/projects");
const craftsmenRouter = require("./routes/craftsmen");
const constructorsRouter = require("./routes/constructors");
const uploadRouter = require("./routes/upload");

const app = express();

const cors = require("cors");
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(fileUpload());
app.use("/", indexRouter);
app.use("/clients", clientsRouter);
app.use("/projects", projectsRouter);
app.use("/craftsmen", craftsmenRouter);
app.use("/constructors", constructorsRouter);
app.use("/upload", uploadRouter);

module.exports = app;
