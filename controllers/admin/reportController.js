const Student = require('../../models/Student');
const Payment = require('../../models/Payment');

exports.getMonthlyReport = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    // Fetch all students
    const students = await Student.find();

    // Generate report data
    const reportData = {
      paid: [],
      unpaid: []
    };

    for (const student of students) {
      const educationPayment = await Payment.findOne({
        student: student._id,
        type: 'education',
        year,
        month,
        status: 'paid'
      });

      const transportPayment = await Payment.findOne({
        student: student._id,
        type: 'transport',
        year,
        month,
        status: 'paid'
      });

      const paymentData = {
        student: {
          studentId: student.studentId,
          firstName: student.firstName,
          middleName: student.middleName,
          lastName: student.lastName
        },
        educationPaid: !!educationPayment,
        transportPaid: !!transportPayment
      };

      if (educationPayment && transportPayment) {
        reportData.paid.push(paymentData);
      } else {
        reportData.unpaid.push(paymentData);
      }
    }

    res.render('admin/reports/monthly', {
      reportData,
      year,
      month
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating report.');
  }
};