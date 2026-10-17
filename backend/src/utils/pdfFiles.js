import { mkdir, open, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";
import { randomUUID } from "node:crypto";

export const PDF_UPLOAD_DIR = fileURLToPath(
  new URL("../../uploads/", import.meta.url),
);

export function getPdfPath(filename) {
  return path.join(PDF_UPLOAD_DIR, path.basename(filename));
}

export async function removePdfFile(filename) {
  if (!filename) return;

  try {
    await unlink(getPdfPath(filename));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

const upload = multer({
  storage: multer.diskStorage({
    destination(_req, _file, callback) {
      mkdir(PDF_UPLOAD_DIR, { recursive: true })
        .then(() => callback(null, PDF_UPLOAD_DIR))
        .catch(callback);
    },
    filename(_req, _file, callback) {
      callback(null, `${randomUUID()}.pdf`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    const hasPdfExtension = path.extname(file.originalname).toLowerCase() === ".pdf";
    const hasPdfMime = ["application/pdf", "application/octet-stream"].includes(
      file.mimetype,
    );

    if (!hasPdfExtension || !hasPdfMime) {
      callback(new Error("Upload a PDF file."));
      return;
    }

    callback(null, true);
  },
});

export function receivePdf(req, res, next) {
  upload.single("pdf")(req, res, async (error) => {
    if (error) {
      const isSizeError = error.code === "LIMIT_FILE_SIZE";
      return res.status(isSizeError ? 413 : 400).json({
        message: isSizeError ? "PDF must be 10 MB or smaller." : error.message,
      });
    }

    if (!req.file) return next();

    let fileHandle;
    try {
      fileHandle = await open(req.file.path, "r");
      const header = Buffer.alloc(5);
      const { bytesRead } = await fileHandle.read(header, 0, header.length, 0);
      if (bytesRead !== 5 || header.toString("ascii") !== "%PDF-") {
        await fileHandle.close();
        fileHandle = null;
        await removePdfFile(req.file.filename);
        return res.status(400).json({ message: "The uploaded file is not a valid PDF." });
      }
    } catch (validationError) {
      if (fileHandle) await fileHandle.close();
      await removePdfFile(req.file.filename).catch(() => {});
      return next(validationError);
    }

    await fileHandle.close();
    next();
  });
}

export function makePdfMetadata(file) {
  if (!file) return null;

  return {
    filename: file.filename,
    originalName: path.basename(file.originalname),
    size: file.size,
    url: `/uploads/${file.filename}`,
  };
}
