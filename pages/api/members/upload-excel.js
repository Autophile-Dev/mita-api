import connectDB from "@/lib/mongodb";
import CompanyRegistration from "@/models/CompanyRegistration";
import User from "@/models/User";
import multer from "multer";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({ dest: "/tmp" });

const handler = async (req, res) => {
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  return new Promise((resolve, reject) => {
    upload.single("file")(req, res, async (err) => {
      if (err) {
        return reject(res.status(500).json({ message: "File upload error" }));
      }

      const filePath = req.file.path;
      try {
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        for (const row of data) {
          const email = row["Email"]?.toLowerCase()?.trim();
          const phone = row["Office Tel"]?.toString()?.trim();
          const name = row["Name PIC (for whatsapp)"]?.trim() || "Unknown";

          if (!email || !phone) continue;

          // Create/find user
          let user = await User.findOne({ email });
          if (!user) {
            user = await User.create({ name, phone, email });
          }

          // Prepare company data
          const companyData = {
            userId: user._id,
            companyName: row["Name of Company"],
            licenseNo: row["KPK / LICENSE NO"],
            regNo:
              row[
                "Co. Registration / Business Regisration/Association Registration No"
              ],
            address: row["Address"],
            postalCode: row["Postal Code"]?.toString(),
            city: row["City"],
            state: row["State"],
            email,
            fax: row["Fax"],
            website: row["Website"],
            officeTel: phone,
            entityType: row["Type of Business entity"],
            dateIncorp: row["Date Incorporated on"]
              ? new Date(row["Date Incorporated on"])
              : null,
            assocMembership: row["Other Association Membership"],
            businessOther: "",
            namePIC: name,
            proposer: "",
            seconder: "",
            directors: row["Names of Directors /Principal Partners"],
            ssmDocuments: row["FORM9 SSM, 24,49,MOTAC License"]
              ? [{ name: "FORM9", url: row["FORM9 SSM, 24,49,MOTAC License"] }]
              : [],
            file_sign_proposer: { name: "", url: "" },
            file_sign_seconder: { name: "", url: "" },
          };

          await CompanyRegistration.create(companyData);
        }

        fs.unlinkSync(filePath); // Clean up
        res.status(200).json({ message: "Data imported successfully" });
        resolve();
      } catch (error) {
        console.error("Import error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
        reject();
      }
    });
  });
};

export default handler;
