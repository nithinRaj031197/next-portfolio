import { google } from "googleapis";
import { NextResponse } from "next/server";
import { join } from "path";
import { NextRequest } from "next/server";

const sheets = google.sheets("v4");
const spreadsheetId = "1IXvHEwo9hEzOJyWUHsUtixsZN6sjXOXCcsgjg6q570Q";

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.json();

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

    return NextResponse.json({
      message: "Form submitted successfully",
      response: response.data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error submitting form", error });
  }
};
