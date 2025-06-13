
import formidable from "formidable";
import * as xlsx from "xlsx";
import fs from "fs";
import path from "path";
import connectDB from "@/lib/mongodb";
import CompanyRegistration from "@/models/CompanyRegistration";
import User from "@/models/User";

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseDate(value) {
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err)
      return res
        .status(500)
        .json({ message: "File upload error", error: err.message });

    try {
      const file = files.file;
      const workbook = xlsx.readFile(file.filepath);
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      let inserted = 0;
      for (let row of data) {
        const email =
          row["Email"]?.toString().trim() || `dummy${Date.now()}@mita.com.my`;
        const phone = row["Office Tel"]?.toString().trim() || "0000000000";
        const name = row["Name PIC (for whatsapp)"] || "Unknown";

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({ name, email, phone });
        }

        const company = new CompanyRegistration({
          userId: user._id,
          companyName: row["Name of Company"] || "",
          licenseNo: row["KPK / LICENSE NO"] || "",
          regNo:
            row[
              "Co. Registration / Business Regisration/Association Registration No"
            ] || "",
          address: row["Address"] || "",
          postalCode: row["Postal Code"]?.toString() || "",
          city: row["City"] || "",
          state: row["State"] || "",
          email,
          fax: row["Fax"] || "",
          website: row["Website"] || "",
          officeTel: phone,
          entityType: row["Type of Business entity"] || "",
          dateIncorp: parseDate(row["Date Incorporated on"]),
          assocMembership: row["Other Association Membership"] || "",
          businessOther: "",
          namePIC: row["Name PIC (for whatsapp)"] || "",
          proposer: row["Helpline No (for whatsapp)"] || "",
          seconder: "",
          directors: row["Names of Directors /Principal Partners"] || "",
          ssmDocuments: [
            {
              name: "SSM Document",
              url: row["FORM9 SSM, 24,49,MOTAC License"] || "",
            },
          ],
        });

        await company.save();
        inserted++;
      }

      res
        .status(200)
        .json({ message: `Imported ${inserted} records successfully.` });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
}
