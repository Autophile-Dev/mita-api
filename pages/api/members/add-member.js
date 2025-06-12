import connectDB from "@/lib/mongodb";
import CompanyRegistration from "@/models/CompanyRegistration";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const {
      userId,
      companyName,
      licenseNo,
      regNo,
      address,
      postalCode,
      city,
      state,
      email,
      fax,
      website,
      officeTel,
      entityType,
      dateIncorp,
      assocMembership,
      businessOther,
      namePIC,
      proposer,
      seconder,
      directors,
      ssmDocuments,
      file_sign_proposer,
      file_sign_seconder,
    } = req.body;

    // Basic validation
    if (!userId || !companyName || !licenseNo || !regNo) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    const newCompany = new CompanyRegistration({
      userId,
      companyName,
      licenseNo,
      regNo,
      address,
      postalCode,
      city,
      state,
      email,
      fax,
      website,
      officeTel,
      entityType,
      dateIncorp,
      assocMembership,
      businessOther,
      namePIC,
      proposer,
      seconder,
      directors,
      ssmDocuments,
      file_sign_proposer,
      file_sign_seconder,
    });

    const savedCompany = await newCompany.save();

    res.status(201).json({
      message: "Company member added successfully",
      company: savedCompany,
    });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
