import connectDB from "@/lib/mongodb";
import CompanyRegistration from "@/models/CompanyRegistration";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { regNo, companyName, state, licenseNo } = req.query;

  // Build dynamic filter
  const filter = {};
  if (regNo) filter.regNo = { $regex: regNo, $options: "i" };
  if (companyName) filter.companyName = { $regex: companyName, $options: "i" };
  if (state) filter.state = { $regex: state, $options: "i" };
  if (licenseNo) filter.licenseNo = { $regex: licenseNo, $options: "i" };

  try {
    const companies = await CompanyRegistration.find(filter)
      .sort({ createdAt: -1 }) // Show latest first
      .populate("userId", "name email phone"); // Optional: populate user info

    res.status(200).json(companies);
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
