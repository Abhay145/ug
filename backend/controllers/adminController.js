const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.js');
const Student = require('../models/Student.js');
const Professor = require('../models/Professor.js');
const Subject = require('../models/Subject');
const mongoose = require('mongoose');
const fs = require('fs')

// Make sure you have bcryptjs installed

exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({
      name,
      email: email.toLowerCase(), // Lowercase to avoid case-sensitivity issues
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Error during admin registration:', error); // Log the error for debugging
    res.status(500).json({ message: 'Something went wrong' });
  }
};


exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() }); // Make email lowercase to match registration
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Compare the password with the stored hash
    const isPasswordCorrect =  bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a token
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET);

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error during admin login:', error); // Log error for debugging
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.getAllProfessors = async (req, res) => {
  try {
    const professors = await Professor.find().select('-password');
    res.status(200).json(professors);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

exports.getstudents = async (req, res) => {
  const { studentIds } = req.body; // Extract the array of student IDs
  try {
    
    // Use Mongoose `find` to fetch students with IDs in the array
    const students = await Student.find({ _id: { $in: studentIds } });
    res.json(students); // Send the matching students back to the frontend
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send('Error fetching students');
  }
};


exports.assignElectives = async (req, res) => {
  try {
    // Fetch students, sorted by CG in descending order, and populate their choices
    const students = await Student.find().populate('choices'); // Fetch students and populate choices

    // Sort students: prioritize those with choices and then by CG
    students.sort((a, b) => {
      const aHasChoices = a.choices && a.choices.length > 0 ? 1 : 0;
      const bHasChoices = b.choices && b.choices.length > 0 ? 1 : 0;
    
      // Prioritize students with choices
      if (bHasChoices - aHasChoices !== 0) {
        return bHasChoices - aHasChoices;
      }
    
      // If both have or don't have choices, sort by CG in descending order
      return b.CG - a.CG;
    });
    


    // Get all subjects in one query
    const allSubjects = await Subject.find();
    const subjectMap = new Map();
    allSubjects.forEach(subject => {
      subjectMap.set(subject._id.toString(), subject); // Map subjects by their _id for quick lookup
    });

    const studentUpdates = []; // Store updates for students
    const subjectUpdates = []; // Store updates for subjects

    for (const student of students) {
      let subjectAssigned = false;

      // First, try to assign subjects from the student's choices
      if (student.choices && student.choices.length > 0) {
        for (const elective of student.choices) {
          const subject = subjectMap.get(elective._id.toString());

          if (!subject) {
            console.error(`Subject with ID ${elective._id} not found.`);
            continue;
          }

          if (subject.seats > 0) {
            // Assign the subject to the student's subjects field (single subject now)
            student.subjects = subject._id;

            // Add the student to the subject's students array
            subject.students.push(student._id);
            subject.seats -= 1;

            // Prepare updates for student and subject
            studentUpdates.push(Student.updateOne({ _id: student._id }, { $set: { subjects: subject._id } }));
            subjectUpdates.push(Subject.updateOne({ _id: subject._id }, { $set: { seats: subject.seats }, $push: { students: student._id } }));

            subjectAssigned = true;
            break; // Once a subject is assigned, break out of the loop
          }
        }
      }

      // If no subject was assigned from choices, allocate from eligible subjects
      if (!subjectAssigned) {
        const eligibleSubjects = allSubjects.filter(subject => 
          subject.eligibility.includes(student.dept) && subject.sem === student.sem && subject.seats > 0
        );

        if (eligibleSubjects.length > 0) {
          const fallbackSubject = eligibleSubjects[0];

          // Assign the fallback subject to the student's subjects field (single subject now)
          student.subjects = fallbackSubject._id;

          // Add the student to the fallback subject's students array
          fallbackSubject.students.push(student._id);
          fallbackSubject.seats -= 1;

          // Prepare updates for student and fallback subject
          studentUpdates.push(Student.updateOne({ _id: student._id }, { $set: { subjects: fallbackSubject._id } }));
          subjectUpdates.push(Subject.updateOne({ _id: fallbackSubject._id }, { $set: { seats: fallbackSubject.seats }, $push: { students: student._id } }));
        } else {
          console.error(`No eligible subjects available for student ${student._id}`);
        }
      }
    }

    // Execute bulk updates for students and subjects in parallel
    await Promise.all([
      ...studentUpdates,
      ...subjectUpdates,
    ]);
   

    res.status(200).json({ message: 'Electives assigned successfully' });
  } catch (error) {
    console.error('Error assigning electives:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};





exports.clearSubjectsForAllStudents = async (req, res) => {
  try {
    // Fetch all subjects, ensuring it returns the documents with the appropriate ObjectId
    const subjects = await Subject.find().lean();

    // Prepare bulk write operations for subjects
    const subjectUpdates = subjects.map((subject) => ({
      updateOne: {
        filter: { _id: subject._id },
        update: {
          $set: {
            seats: subject.default_seats, // Reset seats to the default value
            students: [], // Clear students array
          },
        },
      },
    }));

    // Execute bulk write for subjects, ensuring proper updates
    if (subjectUpdates.length > 0) {
      await Subject.bulkWrite(subjectUpdates);
    }

    // Empty the `subject` field for all students (set it to null)
    await Student.updateMany({}, { $set: { subjects: null } });

    res.status(200).json({
      message: 'Subjects cleared for all students, and seats reset successfully.',
    });
  } catch (error) {
    console.error('Error clearing subjects and resetting seats:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};
