// pages/api/upload-excel.js

import formidable from "formidable";
import * as xlsx from "xlsx";
import fs from "fs";
import connectDB from "@/lib/mongodb";
import CompanyRegistration from "@/models/CompanyRegistration";
import User from "@/models/User";
// export things
export const config = {
  api: {
    bodyParser: false,
  },
};

// Safely parse a date string or Excel date value
function parseDate(value) {
  try {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  console.log("Upload Excel API Hit with method:", req.method);

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
      let failedRows = [];

      for (let row of data) {
        try {
          const email =
            row["Email"]?.toString().trim() || `dummy${Date.now()}@mita.com.my`;
          const phone = row["Office Tel"]?.toString().trim() || "0000000000";
          const name = row["Name PIC (for whatsapp)"] || "Unknown";

          // Create or reuse user (skip strict validation)
          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({ name, email, phone });
          }

          // Create company record
          await CompanyRegistration.create({
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

          inserted++;
        } catch (rowErr) {
          failedRows.push({ row, error: rowErr.message });
        }
      }

      res.status(200).json({
        message: `Imported ${inserted} records.`,
        failed: failedRows.length,
        failedRows,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
}
