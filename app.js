require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

require("./models/connection");

const indexRouter = require("./routes/index");
const clientsRouter = require("./routes/clients");
const projectsRouter = require("../routes/projects");
const craftsmenRouter = require("../routes/craftsmen");
const constructorsRouter = require("../routes/constructors");

const app = express();

const cors = require("cors");
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/clients", clientsRouter);
app.use("/projects", projectsRouter);
app.use("/craftsmen", craftsmenRouter);
app.use("/constructors", constructorsRouter);

module.exports = app;
