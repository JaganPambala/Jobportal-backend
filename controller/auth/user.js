import User from "../../models/user.js";

export const setRole = async (req, res) => {
  const { role } = req.body;

  if (!["employee", "employer"].includes(role))
    return res.status(400).json({ message: "Invalid role" });

  const user = await User.findById(req.user.id);
  user.role = role;
  await user.save();

  res.json({ message: "Role updated", user });
};
