const EducationFees = require('../../models/EducationFees');

exports.redirectToCurrentYearEducationFees = (req, res) => {
  const currentYear = new Date().getFullYear();
  res.redirect(`/admin/educationFees/${currentYear}`);
};

exports.getEducationFeesByYear = async (req, res) => {
  const { year } = req.params;

  try {
    let fees = await EducationFees.findOne({ year: parseInt(year) });

    if (!fees) {
      fees = new EducationFees({
        year: parseInt(year),
        fees: { primary: 0, middle: 0, high: 0 }
      });
      await fees.save();
    }

    res.render('admin/educationFees/show', { fees, year });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving or creating education fees.');
  }
};

exports.renderEditEducationFeesForm = async (req, res) => {
  const { year } = req.params;

  try {
    let fees = await EducationFees.findOne({ year: parseInt(year) });

    if (!fees) {
      fees = new EducationFees({
        year: parseInt(year),
        fees: { primary: 0, middle: 0, high: 0 }
      });
      await fees.save();
    }

    res.render('admin/educationFees/edit', { fees, year });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving or creating education fees for editing.');
  }
};

exports.updateEducationFeesByYear = async (req, res) => {
  const { year } = req.params;
  const { fees } = req.body;

  try {
    let educationFees = await EducationFees.findOne({ year: parseInt(year) });

    if (!educationFees) {
      educationFees = new EducationFees({
        year: parseInt(year)
      });
    }

    educationFees.fees = {
      primary: parseFloat(fees.primary),
      middle: parseFloat(fees.middle),
      high: parseFloat(fees.high)
    };
    educationFees.updatedAt = new Date();

    await educationFees.save();
    res.redirect(`/admin/educationFees/${year}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating education fees.');
  }
};