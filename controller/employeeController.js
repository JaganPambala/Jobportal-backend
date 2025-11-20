import EmployeeDetails from "../models/EmployeeDetails.js";

// CREATE employee profile
export const createEmployeeDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const existing = await EmployeeDetails.findOne({ userId });
    if (existing) {
      return res.status(400).json({ message: "Employee profile already exists" });
    }

    const employeeData = {
      userId,
      phone: req.body.phone,
      address: req.body.address,
      gender: req.body.gender,
      education: req.body.education,
      experience: req.body.experience,
      skills: req.body.skills,
      pastWork: req.body.pastWork,
      resumeUrl: req.body.resumeUrl,
      photoUrl: req.body.photoUrl
    };

    const newEmployee = await EmployeeDetails.create(employeeData);

    res.status(201).json({
      message: "Employee profile created successfully",
      employee: newEmployee
    });
  } catch (err) {
    res.status(500).json({ message: "Error creating employee profile", error: err });
  }
};

// PUBLIC - GET employee details by userId
export const getEmployeeDetails = async (req, res) => {
  try {
    const employee = await EmployeeDetails.findOne({ userId: req.params.userId });

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: "Error fetching employee details", error: err });
  }
};

// PRIVATE - GET own profile
export const getMyEmployeeDetails = async (req, res) => {
  try {
    const employee = await EmployeeDetails.findOne({ userId: req.user.id });

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: "Error fetching employee profile", error: err });
  }
};

// UPDATE employee details
export const updateEmployeeDetails = async (req, res) => {
  try {
    const updated = await EmployeeDetails.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    res.json({
      message: "Employee profile updated successfully",
      employee: updated
    });
  } catch (err) {
    res.status(500).json({ message: "Error updating employee profile", error: err });
  }
};

// DELETE employee profile
export const deleteEmployeeDetails = async (req, res) => {
  try {
    const deleted = await EmployeeDetails.findOneAndDelete({ userId: req.user.id });

    if (!deleted) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    res.json({ message: "Employee profile deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting employee profile", error: err });
  }
};
