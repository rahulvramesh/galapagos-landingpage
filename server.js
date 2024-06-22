const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const Joi = require("joi");
const resendObj = require("resend");
const cache = {};

const resend = new resendObj.Resend("re_fyBF61Wg_8Ygf4VUPtftjHcj6xRTgo1bt");

// Validation schema
const schema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  whatsapp: Joi.string()
    .pattern(/^[0-9]+$/)
    .min(10)
    .max(15)
    .required(),
  house: Joi.string().min(1).required(),
  city: Joi.string().min(1).required(),
  post: Joi.string().min(1).required(),
  landmark: Joi.string().min(1).required(),
  currentCourse: Joi.string().min(1).required(),
  collage: Joi.string().min(1).required(),
  // lastCourseCompleted: Joi.string().min(1).max(100).required(),
  // yearOfJoining: Joi.number()
  //   .integer()
  //   .min(1900)
  //   .max(new Date().getFullYear())
  //   .required(),
  yearOfCompletion: Joi.number().integer().required(),
  researchAreaOfInterest: Joi.string().min(1).required(),
});

const app = express();
const port = 3000;

// Middleware to parse JSON data
app.use(express.json());

app.post("/submit", async (req, res) => {
  const { error } = schema.validate(req.body);
  if (error) {
    console.log(error);
    return res.status(400).json({ message: error.details[0].message });
  }

  const {
    name,
    email,
    whatsapp,
    house,
    city,
    post,
    landmark,
    currentCourse,
    collage,
    lastCourseCompleted,
    yearOfJoining,
    yearOfCompletion,
    researchAreaOfInterest,
  } = req.body;

  const emailContent = `
      <table border="1">
        <tr><th>Name</th><td>${name}</td></tr>
        <tr><th>Email</th><td>${email}</td></tr>
        <tr><th>WhatsApp</th><td>${whatsapp}</td></tr>
        <tr><th>House</th><td>${house}</td></tr>
        <tr><th>City</th><td>${city}</td></tr>
        <tr><th>Post</th><td>${post}</td></tr>
        <tr><th>Landmark</th><td>${landmark}</td></tr>
        <tr><th>Current Course / Last Course Completed</th><td>${currentCourse}</td></tr>
        <tr><th>Collage</th><td>${collage}</td></tr>
        <tr><th>Year of Joining</th><td>${yearOfJoining}</td></tr>
        <tr><th>Year of Completion / Expected Compltion</th><td>${yearOfCompletion}</td></tr>
        <tr><th>Research Area of Interest</th><td>${researchAreaOfInterest}</td></tr>
      </table>
    `;

  try {
    const { data } = await resend.emails.send({
      from: "Galapagose Lead <new-lead@mails.galapagosedu.org>",
      to: ["academics@galapagosedu.org"],
      subject: "New Lead On Site",
      html: emailContent,
    });

    console.log({ data });

    // Here you can handle the data (e.g., save it to a database)
    return res.send({ status: "success" });
  } catch (err) {
    console.error("Error sending email:", err);
    return res.status(500).send("Internal Server Error");
  }
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
    <meta property="og:title" content="GALAPAGOS - The Life Science Island" />
    <meta property="og:site_name" content="GALAPAGOS.org - The Life Science Island">
    <meta property="og:description" content="The best online coaching for CSIR/GATE/PhD interviews both India and abroad. We are the only team with mentors trained in National Premier Institutes and International Institutes." />
    <meta property="og:url" content="https://galapagosedu.org" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://galapagosedu.org/assets/images/logo.png" />
    <meta property="twitter:image" content="https://galapagosedu.org/assets/images/logo.png">
    <meta property="twitter:title" content="GALAPAGOS | The best online coaching for CSIR/GATE/PhD interviews both India and abroad. We are the only team with mentors trained in National Premier Institutes and International Institutes
    <meta property="twitter:description" content="The best online coaching for CSIR/GATE/PhD interviews both India and abroad. We are the only team with mentors trained in National Premier Institutes and International Institutes.">
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
  // if (cache[filePath]) {
  //   return cache[filePath];
  // }
  const htmlContent = await fs.readFile(filePath, "utf8");
  const modifiedContent = injectTags(htmlContent, page);
  cache[filePath] = modifiedContent;
  return modifiedContent;
};

// Route to serve HTML files with or without .html extension
app.get("/*?", async (req, res) => {
  const pagePath = req.params[0] || "index";
  let filePath = path.join(__dirname, "html", `${pagePath}.html`);

  try {
    let htmlContent = await getHtmlContent(filePath, pagePath);
    res.send(htmlContent);
  } catch (err) {
    // Check if the file exists without .html extension
    filePath = path.join(__dirname, "html", pagePath);
    try {
      let htmlContent = await getHtmlContent(filePath, pagePath);
      res.send(htmlContent);
    } catch (err) {
      res.status(404).send("Page not found");
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
