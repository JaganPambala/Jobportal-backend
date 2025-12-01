import EmployeeDetails from "../models/Employee.js";
import User from "../models/user.js";
import fs from "fs";
import path from "path";

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
    const userObj = await User.findById(req.user.id).select('fullName email');

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    // Combine user fields and employee profile into one response
    res.json({
      id: req.user.id,
      fullName: userObj?.fullName,
      email: userObj?.email,
      avatar: employee?.photoUrl || null,
      phone: employee?.phone || null,
      address: employee?.address || null,
      gender: employee?.gender || null,
      experience: employee?.experience || null,
      skills: employee?.skills || [],
      education: employee?.education || [],
      resumeUrl: employee?.resumeUrl || null,
      jobPreferences: employee?.jobPreferences || {},
      selectedCategories: employee?.selectedCategories || [],
    });
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
      { new: true, upsert: true }
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

// PATCH /employee/me - partial update for user + employee profile
export const patchEmployeeMe = async (req, res) => {
  try {
    const updates = req.body;
    // if user fields are provided (fullName), update user
    if (updates.fullName || updates.email) {
      const userUpdates = {};
      if (updates.fullName) userUpdates.fullName = updates.fullName;
      if (updates.email) userUpdates.email = updates.email;
      await User.findByIdAndUpdate(req.user.id, { $set: userUpdates });
    }

    // Update employee profile
    const employeeUpdates = { ...updates };
    delete employeeUpdates.fullName;
    delete employeeUpdates.email;

    const updated = await EmployeeDetails.findOneAndUpdate({ userId: req.user.id }, { $set: employeeUpdates }, { new: true, upsert: true });

    res.json({ message: "Profile updated", user: { id: req.user.id, fullName: updates.fullName || undefined, email: updates.email || undefined }, employee: updated });
  } catch (err) {
    res.status(500).json({ message: "Error patching profile", error: err });
  }
};

// POST /employee/me/avatar - upload avatar file
export const uploadEmployeeAvatar = async (req, res) => {
  try {
    // multer will provide req.file
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const updated = await EmployeeDetails.findOneAndUpdate({ userId: req.user.id }, { $set: { photoUrl: avatarUrl } }, { new: true, upsert: true });

    res.json({ message: 'Avatar uploaded', avatarUrl, employee: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error uploading avatar', error: err.message });
  }
};

// POST /employee/me/resume - upload resume
export const uploadEmployeeResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;
    const updated = await EmployeeDetails.findOneAndUpdate({ userId: req.user.id }, { $set: { resumeUrl } }, { new: true, upsert: true });
    res.json({ message: 'Resume uploaded', resumeUrl, employee: updated });
  } catch (err) {
    res.status(500).json({ message: 'Error uploading resume', error: err.message });
  }
};

// DELETE /employee/me/resume - delete resume
export const deleteEmployeeResume = async (req, res) => {
  try {
    const employee = await EmployeeDetails.findOne({ userId: req.user.id });
    if (!employee || !employee.resumeUrl) return res.status(404).json({ message: 'No resume found' });
    // Remove file from disk if exists
    try {
      // resumeUrl stored as '/uploads/resumes/<filename>'
      const filename = employee.resumeUrl.split('/').pop();
      const absPath = path.join(process.cwd(), 'uploads', 'resumes', filename);
      if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
    } catch (e) {
      // don't fail
      console.error('Failed to delete resume file', e);
    }
    employee.resumeUrl = null;
    await employee.save();
    res.json({ message: 'Resume deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting resume', error: err.message });
  }
};

// Education CRUD endpoints
export const addEducation = async (req, res) => {
  try {
    const { degree, specialization, institution, passedOutYear } = req.body;
    const employee = await EmployeeDetails.findOne({ userId: req.user.id });
    if (!employee) {
      // Create an employee doc if not exist
      const newEmp = await EmployeeDetails.create({ userId: req.user.id, education: [{ degree, specialization, institution, passedOutYear }] });
      return res.status(201).json({ message: 'Education added', education: newEmp.education });
    }
    employee.education.push({ degree, specialization, institution, passedOutYear });
    await employee.save();
    res.status(201).json({ message: 'Education added', education: employee.education });
  } catch (err) {
    res.status(500).json({ message: 'Error adding education', error: err.message });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const { eduId } = req.params;
    const updates = req.body;
    const employee = await EmployeeDetails.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });
    const edu = employee.education.id(eduId);
    if (!edu) return res.status(404).json({ message: 'Education entry not found' });
    Object.assign(edu, updates);
    await employee.save();
    res.json({ message: 'Education updated', education: edu });
  } catch (err) {
    res.status(500).json({ message: 'Error updating education', error: err.message });
  }
};

export const deleteEducation = async (req, res) => {
  try {
    const { eduId } = req.params;
    const employee = await EmployeeDetails.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ message: 'Employee profile not found' });
    employee.education.id(eduId).remove();
    await employee.save();
    res.json({ message: 'Education deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting education', error: err.message });
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


export const saveJobPreferences = async (req, res) => {
  try {
    const userId = req.user.id; // from token
    const { selectedRoles, selectedLocation, jobType, officeType } = req.body;

    let employee = await EmployeeDetails.findOne({ userId });

    if (!employee) {
      // Create a new employee profile if not exists
      employee = new EmployeeDetails({ userId });
    }

    employee.jobPreferences = {
      selectedRoles,
      selectedLocation,
      jobType,
      officeType,
    };

    await employee.save();

    res.json({
      message: "Job preferences saved successfully",
      jobPreferences: employee.jobPreferences,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// fetch employee preferences
export const getEmployeePreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const employee = await EmployeeDetails.findOne({ userId });

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    res.json(employee.jobPreferences || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};