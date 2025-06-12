const mongoose = require("mongoose");

const CompanyRegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Stage 1: Basic Info
  companyName: String,
  licenseNo: String,
  regNo: String,
  address: String,
  postalCode: String,
  city: String,
  state: String,
  email: String,
  fax: String,
  website: String,
  officeTel: String,
  entityType: String,
  dateIncorp: Date,
  assocMembership: String,
  businessOther: String,

  // Stage 2: Directors & Signatures
  namePIC: String,
  proposer: String,
  seconder: String,
  directors: String, // Or an array if multiple

  ssmDocuments: [
    {
      name: String,
      url: String,
    },
  ],
  file_sign_proposer: {
    name: String,
    url: String,
  },
  file_sign_seconder: {
    name: String,
    url: String,
  },

  // Stage 3: Acknowledgement
  acknowledged: {
    type: Boolean,
    enum: [true, false],
    default: false,
  },

  // System Fields
  registrationStage: {
    type: Number,
    enum: [0, 1, 2, 3],
    default: 0,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "rejected"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Automatically update updatedAt on save
CompanyRegistrationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model(
  "CompanyRegistration",
  CompanyRegistrationSchema
);
