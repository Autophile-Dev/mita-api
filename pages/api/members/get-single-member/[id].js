import connectDB from "@/lib/mongodb";
import CompanyRegistration from "@/models/CompanyRegistration";

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const company = await CompanyRegistration.findById(id).populate(
      "userId",
      "name email phone"
    );

    if (!company) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json(company);
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
