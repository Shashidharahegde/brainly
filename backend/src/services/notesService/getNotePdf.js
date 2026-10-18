import Note from "../../../models/Note.js";
import { getPdfPath } from "../../utils/pdfFiles.js";

export async function getNotePdf(req, res) {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      ownerId: req.user.userId,
    }).select("pdf.filename");

    if (!note?.pdf?.filename) {
      return res.status(404).json({ message: "PDF not found" });
    }

    return res.sendFile(getPdfPath(note.pdf.filename), (error) => {
      if (error && !res.headersSent) {
        res.status(404).json({ message: "PDF not found" });
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
