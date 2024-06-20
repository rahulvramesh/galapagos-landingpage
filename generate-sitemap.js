const fs = require("fs-extra");
const path = require("path");

const baseUrl = "https://galapagosedu.org";
const htmlDir = path.join(__dirname, "html");
const outputDir = path.join(__dirname);
const outputPath = path.join(outputDir, "sitemap.xml");

// Function to recursively get all HTML files
const getHtmlFiles = async (dir) => {
  let files = await fs.readdir(dir);
  let htmlFiles = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      htmlFiles = htmlFiles.concat(await getHtmlFiles(filePath));
    } else if (file.endsWith(".html")) {
      htmlFiles.push(filePath);
    }
  }

  return htmlFiles;
};

// Function to generate the sitemap
const generateSitemap = async () => {
  try {
    const htmlFiles = await getHtmlFiles(htmlDir);
    const urls = htmlFiles
      .map((file) => {
        const relativePath = path.relative(htmlDir, file);
        const urlPath = relativePath.replace(/\\/g, "/").replace(".html", "");
        return `
        <url>
          <loc>${baseUrl}/${urlPath === "index" ? "" : urlPath}</loc>
          <changefreq>daily</changefreq>
          <priority>0.8</priority>
        </url>
      `;
      })
      .join("\n");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls}
      </urlset>
    `;

    await fs.writeFile(outputPath, sitemap.trim());
    console.log("Sitemap generated successfully!");
  } catch (err) {
    console.error("Error generating sitemap:", err);
  }
};

generateSitemap();
