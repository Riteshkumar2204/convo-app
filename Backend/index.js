// import dotenv from "dotenv";
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const docxToPDF = require("docx-pdf");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();



const app = express();
// const port = 3000;
const port = process.env.PORT;

// app.use(cors());
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
   
//   })
// );
app.use(cors({
//   origin: "http://localhost:5173",  // your React frontend
 origin:process.env.FRONTEND_URL,  
credentials: true                 // optional, for cookies
}));


// settting up the file storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads");
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });
app.post("/convertFile", upload.single("file"), (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file  uploaded",
            });
        }
        // Defining outout file path
        let outoutPath = path.join(
            __dirname,
            "files",
            `${req.file.originalname}.pdf`
        );
        docxToPDF(req.file.path, outoutPath, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Error converting docx to pdf",
                });
            }
            res.download(outoutPath, () => {
                console.log("file downloaded");
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});



// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const { exec } = require("child_process");
// const path = require("path");
// const dotenv = require("dotenv");
// const fs = require("fs");

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 3000;

// // ✅ CORS config
// app.use(cors({
//   origin: process.env.FRONTEND_URL,
//   credentials: true,
// }));

// // ✅ Directories (in /tmp for Render)
// const uploadDir = "/tmp/uploads";
// const outputDir = "/tmp/files";

// [uploadDir, outputDir].forEach(dir => {
//   if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
// });

// // ✅ Multer storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => cb(null, file.originalname),
// });
// const upload = multer({ storage });

// // ✅ Conversion endpoint
// app.post("/convertFile", upload.single("file"), (req, res) => {
//   if (!req.file) return res.status(400).json({ message: "No file uploaded" });

//   const inputPath = path.join(uploadDir, req.file.originalname);
//   const outputPath = path.join(outputDir, `${path.parse(req.file.originalname).name}.pdf`);

//   const command = `soffice --headless --convert-to pdf --outdir ${outputDir} ${inputPath}`;

//   exec(command, (err, stdout, stderr) => {
//     if (err) {
//       console.error("❌ Conversion failed:", stderr);
//       return res.status(500).json({ message: "Conversion failed" });
//     }

//     res.download(outputPath, () => {
//       console.log("✅ File sent:", outputPath);
//     });
//   });
// });

// // ✅ Start server
// app.listen(port, () => {
//   console.log(`🚀 Server running at http://localhost:${port}`);
// });
