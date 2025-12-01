import EmployerDetails from "../models/Employeer.js";

// CREATE employer details
export const createEmployerDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const existing = await EmployerDetails.findOne({ userId });
    if (existing) {
      return res.status(400).json({ message: "Employer profile already exists" });
    }
    const employerData = {
      userId,
      companyName: req.body.companyName,
      companyAddress: req.body.companyAddress,
      companyPhone: req.body.companyPhone,
      companyWebsite: req.body.companyWebsite,
      companyLogo: req.body.companyLogo,
      companyProfile: req.body.companyProfile
    };

    const newEmployer = await EmployerDetails.create(employerData);

    res.status(201).json({
      message: "Employer profile created successfully",
      employer: newEmployer
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating employer profile", error: err });
  }
};

// GET employer details by userId
export const getEmployerDetails = async (req, res) => {
  try {
    const employer = await EmployerDetails.findOne({
      userId: req.params.userId
    });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    res.json(employer);
  } catch (err) {
    res.status(500).json({ message: "Error fetching employer details", error: err });
  }
};

// UPDATE employer details
export const updateEmployerDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const updated = await EmployerDetails.findOneAndUpdate(
      { userId },
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    res.json({
      message: "Employer profile updated successfully",
      employer: updated
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating employer details", error: err });
  }
};

// DELETE employer details
export const deleteEmployerDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const deleted = await EmployerDetails.findOneAndDelete({ userId });

    if (!deleted) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    res.json({ message: "Employer profile deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting employer details", error: err });
  }
};


export const getMyEmployerDetails = async (req, res) => {
  try {
    const userId = req.user.id; // from token

    const employer = await EmployerDetails.findOne({ userId });

    if (!employer) {
      return res.status(404).json({ message: "Employer profile not found" });
    }

    res.json({
      message: "Employer details fetched successfully",
      employer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
