// // import dotenv from "dotenv";
// const express = require("express");
// const multer = require("multer");
// const cors = require("cors");
// const docxToPDF = require("docx-pdf");
// const path = require("path");
// const dotenv = require("dotenv");
// dotenv.config();



// const app = express();
// // const port = 3000;
// const port = process.env.PORT;

// // app.use(cors());
// // app.use(
// //   cors({
// //     origin: process.env.FRONTEND_URL,
// //     credentials: true,
// //     methods: ["GET", "POST", "PUT", "DELETE"],
   
// //   })
// // );
// app.use(cors({
// //   origin: "http://localhost:5173",  // your React frontend
//  origin:process.env.FRONTEND_URL,  
// credentials: true                 // optional, for cookies
// }));


// // settting up the file storage
// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, "uploads");
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.originalname);
//     },
// });

// const upload = multer({ storage: storage });
// app.post("/convertFile", upload.single("file"), (req, res, next) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 message: "No file  uploaded",
//             });
//         }
//         // Defining outout file path
//         let outoutPath = path.join(
//             __dirname,
//             "files",
//             `${req.file.originalname}.pdf`
//         );
//         docxToPDF(req.file.path, outoutPath, (err, result) => {
//             if (err) {
//                 console.log(err);
//                 return res.status(500).json({
//                     message: "Error converting docx to pdf",
//                 });
//             }
//             res.download(outoutPath, () => {
//                 console.log("file downloaded");
//             });
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             message: "Internal server error",
//         });
//     }
// });

// app.listen(port, () => {
//     console.log(`Server is listening on port ${port}`);
// });




const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const puppeteer = require("puppeteer");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
// app.use(cors({
//   origin: process.env.FRONTEND_URL || "http://localhost:5173",
//   credentials: true
// }));
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "https://convo-app-nu.vercel.app/",
  "https://convo-app-zv10.onrender.com", // if you need self-calling APIs
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("CORS Error: Origin not allowed -> " + origin));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })

);

// File storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post("/convertFile", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const inputPath = req.file.path;

    // Convert .docx to HTML
    const result = await mammoth.convertToHtml({ path: inputPath });
    const htmlContent = result.value;

    // Convert HTML to PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent);
    
    const outputPDFPath = path.join("uploads", `${req.file.filename}.pdf`);
    await page.pdf({ path: outputPDFPath, format: "A4" });
    
    await browser.close();

    // Send PDF file as download
    res.download(outputPDFPath, () => {
      fs.unlinkSync(inputPath);       // remove .docx
      fs.unlinkSync(outputPDFPath);   // remove .pdf after sending
    });

  } catch (err) {
    console.error("Conversion failed:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is listening on port ${port}`);
});
