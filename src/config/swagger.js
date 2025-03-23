const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
require("dotenv").config();

const swaggerDocument = YAML.load(path.join(__dirname, "../../swagger.yaml"));

const swaggerDocs = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log(`Swagger is running at: ${process.env.BACKEND_URL}/api-docs`);
};

module.exports = swaggerDocs;
