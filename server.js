const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const cache = {};

const app = express();
const port = 3000;

// Middleware to serve static assets
app.use("/assets", express.static(path.join(__dirname, "assets")));

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
