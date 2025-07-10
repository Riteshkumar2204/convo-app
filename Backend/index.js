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
const docxToPDF = require("docx-pdf");
const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");
const cors = require("cors");

// Load env vars
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ✅ CORS setup
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// ✅ Ensure directories exist
["uploads", "files"].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

// ✅ Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// ✅ Route
app.post("/convertFile", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const outputPath = path.join(__dirname, "files", `${req.file.originalname}.pdf`);

    docxToPDF(req.file.path, outputPath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error converting DOCX to PDF" });
      }

      res.download(outputPath, () => {
        console.log("File downloaded");
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
