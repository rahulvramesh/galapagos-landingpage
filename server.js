const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const Joi = require("joi");
const cache = {};

// Validation schema
const schema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  whatsapp: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(15)
    .required(),
  house: Joi.string().min(1).max(50).required(),
  city: Joi.string().min(1).max(50).required(),
  post: Joi.string().min(1).max(50).required(),
  landmark: Joi.string().min(1).max(50).required(),
  currentCourse: Joi.string().min(1).max(100).required(),
  collage: Joi.string().min(1).max(100).required(),
  lastCourseCompleted: Joi.string().min(1).max(100).required(),
  yearOfJoining: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required(),
  yearOfCompletion: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required(),
  researchAreaOfInterest: Joi.string().min(1).max(100).required(),
});

const app = express();
const port = 3000;

// Middleware to parse JSON data
app.use(express.json());

app.post("/submit", (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  // Here you can handle the data (e.g., save it to a database)
  res.send("Data successfully submitted!");
});

// Middleware to serve static assets
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Submit API

// Serve robots.txt
app.get("/robots.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "robots.txt"));
});

// Serve sitemap.xml
app.get("/sitemap.xml", (req, res) => {
  res.sendFile(path.join(__dirname, "sitemap.xml"));
});

// Google Analytics script
const googleAnalyticsScript = `
  <script
      async
      src="https://www.googletagmanager.com/gtag/js?id=G-3T3V52Z0FQ"
  ></script>
  <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
          dataLayer.push(arguments);
      }
      gtag("js", new Date());

      gtag("config", "G-3T3V52Z0FQ");
  </script>

`;

// Function to generate OG tags
const generateOgTags = (page) => {
  const ogTags = `
    <meta property="og:title" content=""GALAPAGOS" The Life Science Island" />
    <meta property="og:description" content=""GALAPAGOS" The Life Science Island" />
    <meta property="og:url" content="https://galapagosedu.org" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://galapagosedu.org/assets/images/logo.png" />
  `;
  return ogTags;
};

// Function to inject Google Analytics and OG tags into HTML
const injectTags = (htmlContent, page) => {
  const ogTags = generateOgTags(page);
  return htmlContent.replace(
    "</head>",
    `${googleAnalyticsScript}${ogTags}</head>`,
  );
};

// Function to read and cache the HTML file
const getHtmlContent = async (filePath, page) => {
  if (cache[filePath]) {
    return cache[filePath];
  }
  const htmlContent = await fs.readFile(filePath, "utf8");
  const modifiedContent = injectTags(htmlContent, page);
  cache[filePath] = modifiedContent;
  return modifiedContent;
};

// Route to serve HTML files with or without .html extension
app.get("/:page?", async (req, res) => {
  const page = req.params.page || "index";
  let filePath = path.join(__dirname, "html", `${page}.html`);

  try {
    let htmlContent = await getHtmlContent(filePath, page);
    res.send(htmlContent);
  } catch (err) {
    // Check if the file exists without .html extension
    filePath = path.join(__dirname, "html", page);
    try {
      let htmlContent = await getHtmlContent(filePath, page);
      res.send(htmlContent);
    } catch (err) {
      res.status(404).send("Page not found");
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
