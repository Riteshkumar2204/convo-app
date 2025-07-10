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
const cors = require("cors");
const multer = require("multer");
const docxToPDF = require("docx-pdf");
const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ✅ Enable CORS for frontend
app.use(cors({
  origin: process.env.FRONTEND_URL,  // e.g., https://convo-app-nu.vercel.app
  credentials: true,
}));

// ✅ Use /tmp (safe for Render)
const uploadDir = "/tmp/uploads";
const outputDir = "/tmp/files";

// Ensure temp folders exist
[uploadDir, outputDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ✅ Multer config (save in /tmp/uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// ✅ POST Route: Convert DOCX to PDF
app.post("/convertFile", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const inputPath = req.file.path;
    const outputPath = path.join(outputDir, `${req.file.originalname}.pdf`);

    console.log("📂 Input:", inputPath);
    console.log("📄 Output:", outputPath);

    docxToPDF(inputPath, outputPath, (err) => {
      if (err) {
        console.error("❌ Conversion error:", err);
        return res.status(500).json({ message: "Failed to convert DOCX to PDF" });
      }

      res.download(outputPath, () => {
        console.log("✅ File downloaded successfully");
      });
    });
  } catch (error) {
    console.error("🔥 Server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
