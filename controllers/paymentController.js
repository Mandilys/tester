// controllers/paymentController.js

const Payment = require('../models/Payment');
const EducationFees = require('../models/EducationFees');
const Student = require('../models/Student');
const User = require('../models/User');
const TransportFees = require('../models/TransportFees');

// Helper function to convert student level to fee level
function getFeeLevel(studentLevel) {
  if (studentLevel >= 1 && studentLevel <= 5) {
    return 'primary';
  } else if (studentLevel >= 6 && studentLevel <= 8) {
    return 'middle';
  } else if (studentLevel >= 9 && studentLevel <= 12) {
    return 'high';
  }
  throw new Error('Invalid student level');
}

// Refactored getEducationPayments to use query parameters
exports.getEducationPayments = async (req, res) => {
  const { studentId, year } = req.query;
  let error = null;

  if (!studentId || !year) {
    error = 'Please provide both Student ID and Year.';
    return res.render('payments/education', { payments: null, student: null, year: null, error, isAdmin: false, studentsList: [] });
  }

  try {
    const student = await Student.findOne({ studentId });
    if (!student) {
      error = 'Student not found.';
      return res.render('payments/education', { payments: null, student: null, year, error, isAdmin: false, studentsList: [] });
    }

    const educationFees = await EducationFees.findOne({ year: parseInt(year) });
    if (!educationFees) {
      // Create default education fees if not found
      const feeLevel = getFeeLevel(student.level);
      const newEducationFees = new EducationFees({
        year: parseInt(year),
        fees: {
          [feeLevel]: 0
        }
      });
      await newEducationFees.save();
      return res.redirect(`/payments/education?studentId=${studentId}&year=${year}`);
    }

    const feeLevel = getFeeLevel(student.level);
    const educationFee = educationFees.fees[feeLevel] / 12;

    // Retrieve or create payments for all months
    const payments = [];
    for (let month = 1; month <= 12; month++) {
      let payment = await Payment.findOne({
        student: student._id,
        type: 'education',
        month,
        year: parseInt(year)
      });

      if (!payment) {
        payment = new Payment({
          student: student._id,
          type: 'education',
          month,
          year: parseInt(year),
          status: 'pending',
          discount: 0,
          statusChanges: []
        });
        await payment.save();
      }

      // Calculate amount after discount
      const amountAfterDiscount = educationFee - payment.discount;

      payments.push({
        _id: payment._id,
        month,
        status: payment.status,
        discount: payment.discount,
        amountBeforeDiscount: educationFee,
        amountAfterDiscount,
        statusChanges: payment.statusChanges.sort((a, b) => a.updatedAt - b.updatedAt)
      });
    }

    // Retrieve list of students for the dropdown
    const studentsList = await Student.find().sort({ lastName: 1, firstName: 1 });

    // Determine if the current user is admin
    const user = await User.findById(req.session.userId);
    const isAdmin = user && user.role === 'admin';

    res.render('payments/education', {
      student,
      payments,
      year,
      educationFee,
      studentsList,
      isAdmin,
      error // Always pass error, even if it's null
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('payments/education', {
      payments: null,
      student: null,
      year: null,
      error: 'Error retrieving education payments.',
      isAdmin: false,
      studentsList: []
    });
  }
};

// Refactored getPaymentStatusHistory to use query parameters
exports.getPaymentStatusHistory = async (req, res) => {
  const { studentId, year, paymentId } = req.query;

  if (!studentId || !year || !paymentId) {
    return res.status(400).send('Missing required query parameters.');
  }

  try {
    const payment = await Payment.findById(paymentId).populate('statusChanges.updatedBy', 'username');
    if (!payment) {
      return res.status(404).send('Payment not found.');
    }

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).send('Student not found.');
    }

    // Check if the user is admin
    const user = await User.findById(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).send('Access denied.');
    }

    res.render('payments/statusHistory', {
      payment,
      student,
      year
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving payment status history.');
  }
};

// New Function: Update Individual Payment
exports.updateIndividualPayment = async (req, res) => {
  const { paymentId } = req.params;
  const { discount, status } = req.body;

  try {
    const userId = req.session.userId;

    const payment = await Payment.findById(paymentId).populate('student');
    if (!payment) {
      return res.status(404).send('Payment record not found.');
    }

    const student = payment.student;
    if (!student) {
      return res.status(404).send('Associated student not found.');
    }

    const educationFees = await EducationFees.findOne({ year: payment.year });
    if (!educationFees) {
      return res.status(404).send('Education fees not found for the specified year.');
    }

    const feeLevel = getFeeLevel(student.level);
    const educationFee = educationFees.fees[feeLevel];

    // Retrieve the last status change
    const lastStatusChange = payment.statusChanges[payment.statusChanges.length - 1];

    if (lastStatusChange) {
    // Determine if current input differs from the last status change
    const isDifferent =
      (discount !== undefined && parseFloat(discount) !== lastStatusChange.discount) ||
      (status !== undefined && status !== lastStatusChange.status);

    if (!isDifferent) {
      // No changes detected; no action needed
      return res.redirect(`/payments/education/${student.studentId}/${payment.year}`);
      }
    }

    // Calculate amounts
    const amountBeforeDiscount = educationFee;
    const amountAfterDiscount = amountBeforeDiscount - (parseFloat(discount) || 0);

    // Update payment record
    payment.status = status;
    payment.discount = discount;

    // Add a new status change entry
    payment.statusChanges.push({
      updatedBy: userId,
      status,
      discount: parseFloat(discount) || 0,
      amountBeforeDiscount,
      amountAfterDiscount
    });

    await payment.save();

    res.redirect(`/payments/education/${student.studentId}/${payment.year}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating payment.');
  }
};

// Refactored getTransportPayments to use query parameters
exports.getTransportPayments = async (req, res) => {
  const { studentId, year } = req.query;
  let error = null;

  if (!studentId || !year) {
    error = 'Please provide both Student ID and Year.';
    return res.render('payments/transport', { payments: null, student: null, year: null, error, isAdmin: false, studentsList: [] });
  }

  try {
    const student = await Student.findOne({ studentId });
    if (!student) {
      error = 'Student not found.';
      return res.render('payments/transport', { payments: null, student: null, year, error, isAdmin: false, studentsList: [] });
    }

    const transportFees = await TransportFees.findOne({ year: parseInt(year) });
    if (!transportFees) {
      // Create default transport fees if not found
      const feeLevel = getFeeLevel(student.level);
      const newTransportFees = new TransportFees({
        year: parseInt(year),
        fees: {
          [feeLevel]: 0
        }
      });
      await newTransportFees.save();
      return res.redirect(`/payments/transport?studentId=${studentId}&year=${year}`);
    }

    const feeLevel = getFeeLevel(student.level);
    const transportFee = transportFees.fees[feeLevel] / 12;

    // Retrieve or create payments for all months
    const payments = [];
    for (let month = 1; month <= 12; month++) {
      let payment = await Payment.findOne({
        student: student._id,
        type: 'transport',
        month,
        year: parseInt(year)
      });

      if (!payment) {
        payment = new Payment({
          student: student._id,
          type: 'transport',
          month,
          year: parseInt(year),
          status: 'pending',
          discount: 0,
          statusChanges: []
        });
        await payment.save();
      }

      // Calculate amount after discount
      const amountAfterDiscount = transportFee - payment.discount;

      payments.push({
        _id: payment._id,
        month,
        status: payment.status,
        discount: payment.discount,
        amountBeforeDiscount: transportFee,
        amountAfterDiscount,
        statusChanges: payment.statusChanges.sort((a, b) => a.updatedAt - b.updatedAt)
      });
    }

    // Retrieve list of students for the dropdown
    const studentsList = await Student.find().sort({ lastName: 1, firstName: 1 });

    // Determine if the current user is admin
    const user = await User.findById(req.session.userId);
    const isAdmin = user && user.role === 'admin';

    res.render('payments/transport', {
      student,
      payments,
      year,
      transportFee,
      studentsList,
      isAdmin,
      error // Always pass error, even if it's null
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('payments/transport', {
      payments: null,
      student: null,
      year: null,
      error: 'Error retrieving transport payments.',
      isAdmin: false,
      studentsList: []
    });
  }
};