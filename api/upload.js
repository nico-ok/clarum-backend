import axios from "axios";
import FormData from "form-data";

export const config = { api: { bodyParser: false } };   // deja el multipart intacto

export default async function handler(req, res) {
  // Solo aceptamos POST
  if (req.method !== "POST") return res.status(405).send("Use POST");

  // Vercel + edge-multipart: el PDF vendrá en req.files.pdf
  const file = req.files?.pdf;
  if (!file) return res.status(400).send("No PDF uploaded");

  try {
    /* 1. Preparamos form-data para Chatbase */
    const fd = new FormData();
    fd.append("file", file.buffer, file.filename);
    fd.append("websiteId", "LtBrQRopg1Blit4oMlT9p");           // ← tu Agent ID

    /* 2. Subimos el PDF */
    await axios.post("https://www.chatbase.co/api/files", fd, {
      headers: {
        ...fd.getHeaders(),
        "x-api-key": process.env.CHATBASE_KEY                // ← tu clave como env var
      }
    });

    /* 3. (Opcional) retrain inmediato para que esté disponible enseguida */
    await axios.post(
      "https://www.chatbase.co/api/retrain",
      { websiteId: "LtBrQRopg1Blit4oMlT9p" },
      { headers: { "x-api-key": process.env.CHATBASE_KEY } }
    );

    return res.status(200).send("OK");
  } catch (err) {
    console.error(err.response?.data || err);
    return res.status(500).send("Upload failed");
  }
}
