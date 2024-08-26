import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";

const sheets = google.sheets("v4");
const spreadsheetId = "1IXvHEwo9hEzOJyWUHsUtixsZN6sjXOXCcsgjg6q570Q";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const formData = req.body;

      const auth = new google.auth.GoogleAuth({
        keyFile: join(process.cwd(), "app", "utils", "credentials.json"),
        scopes: "https://www.googleapis.com/auth/spreadsheets",
      });

      const sheetsAPI = google.sheets({ version: "v4", auth });

      const response = await sheetsAPI.spreadsheets.values.append({
        spreadsheetId,
        range: "Sheet1",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [[formData.name, formData.email, formData.message]],
        },
      });

      res.status(200).json({
        message: "Form submitted successfully",
        response: response.data,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error submitting form", error });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
