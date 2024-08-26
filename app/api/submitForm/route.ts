import { NextApiResponse } from "next";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import { join } from "path";

const sheets = google.sheets("v4");
const spreadsheetId = "1IXvHEwo9hEzOJyWUHsUtixsZN6sjXOXCcsgjg6q570Q";
export const POST = async (req: any, res: NextApiResponse) => {
  console.log(req.body);
  if (req.method === "POST") {
    const formData = req.body;

    try {
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
      return NextResponse.json({ message: "Form submitted successfully" });
      res.status(200).json({ message: "Form submitted successfully", response: response.data });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: "Error submitting form", error });
      res.status(500).json({ message: "Error submitting form" });
    }
  } else {
    return NextResponse.json({ message: "Method Not Allowed" });
    res.status(405).json({ message: "Method Not Allowed" });
  }
};
