const Student = require('../../models/Student');

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ lastName: 1, firstName: 1 });
    res.render('admin/students/index', { students });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.getStudentDetails = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('siblings', 'studentId firstName lastName');
    if (!student) return res.status(404).send('Student not found.');
    res.render('admin/students/show', { student });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving student details.');
  }
};

exports.renderNewStudentForm = async (req, res) => {
  try {
    const allStudents = await Student.find({}, 'studentId firstName lastName').sort({ lastName: 1, firstName: 1 });
    res.render('admin/students/new', { allStudents });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving students list.');
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { studentId, firstName, middleName, lastName, level, district, siblings } = req.body;
    const newStudent = new Student({
      studentId,
      firstName,
      middleName,
      lastName,
      level,
      district
    });

    if (siblings && Array.isArray(siblings)) {
      const validSiblings = await Student.find({ studentId: { $in: siblings } });
      newStudent.siblings = validSiblings.map(sibling => sibling._id);
    }

    await newStudent.save();

    // Update siblings to include this new student
    if (newStudent.siblings.length > 0) {
      await Student.updateMany(
        { _id: { $in: newStudent.siblings } },
        { $addToSet: { siblings: newStudent._id } }
      );
    }

    res.redirect('/admin/students');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating student.');
  }
};

exports.renderEditStudentForm = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('siblings', 'studentId firstName lastName');
    if (!student) return res.status(404).send('Student not found.');
    const allStudents = await Student.find({}, 'studentId firstName lastName').sort({ lastName: 1, firstName: 1 });
    res.render('admin/students/edit', { student, allStudents });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving student.');
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { firstName, middleName, lastName, level, district, siblings } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).send('Student not found.');
    }

    student.firstName = firstName;
    student.middleName = middleName;
    student.lastName = lastName;
    student.level = level;
    student.district = district;

    // Handle siblings
    let newSiblings = [];
    if (siblings && Array.isArray(siblings)) {
      newSiblings = siblings.filter(id => id !== ''); // Remove empty selections
    }

    if (newSiblings.length > 0) {
      const validSiblings = await Student.find({ 
        studentId: { $in: newSiblings, $ne: student.studentId } 
      });
      
      // Remove this student from old siblings that are not in the new list
      await Student.updateMany(
        { _id: { $in: student.siblings, $nin: validSiblings.map(s => s._id) } },
        { $pull: { siblings: student._id } }
      );

      // Add this student to new siblings
      await Student.updateMany(
        { _id: { $in: validSiblings.map(s => s._id), $nin: student.siblings } },
        { $addToSet: { siblings: student._id } }
      );

      student.siblings = validSiblings.map(sibling => sibling._id);
    } else {
      // If siblings field is empty, remove all sibling connections
      await Student.updateMany(
        { _id: { $in: student.siblings } },
        { $pull: { siblings: student._id } }
      );
      student.siblings = [];
    }

    await student.save();
    res.redirect('/admin/students');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating student.');
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).send('Student not found.');
    }

    // Remove this student from siblings' lists
    await Student.updateMany(
      { _id: { $in: student.siblings } },
      { $pull: { siblings: student._id } }
    );

    await Student.findByIdAndDelete(req.params.id);
    res.redirect('/admin/students');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting student.');
  }
};

exports.getStudentManagement = async (req, res) => {
  res.render('admin/students/index', { student: null, searchPerformed: false });
};

exports.searchStudent = async (req, res) => {
  try {
    const { studentId } = req.query;
    const student = await Student.findOne({ studentId }).populate('siblings', 'studentId firstName lastName');
    res.render('admin/students/index', { student, searchPerformed: true });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error searching for student.');
  }
};