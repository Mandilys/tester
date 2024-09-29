const TransportFees = require('../../models/TransportFees');

exports.listDistrictsByYear = async (req, res) => {
  const { year } = req.params;

  try {
    const fees = await TransportFees.find({ year: parseInt(year) });
    const districts = [...new Set(fees.map(fee => fee.district))];
    res.render('admin/transportFees/districts', { year, districts });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving districts.');
  }
};

exports.redirectToCurrentYearTransportFees = (req, res) => {
  const currentYear = new Date().getFullYear();
  res.redirect(`/admin/transportFees/${currentYear}`);
};

exports.createTransportFeesForNewDistrict = async (req, res) => {
  const { year } = req.params;
  const { district } = req.body;

  try {
    const existingFee = await TransportFees.findOne({ year: parseInt(year), district });

    if (existingFee) {
      req.flash('error', 'District already exists for this year.');
      return res.redirect(`/admin/transportFees/${year}`);
    }

    const newFees = new TransportFees({
      year: parseInt(year),
      district,
      fees: { primary: 0, middle: 0, high: 0 },
    });

    await newFees.save();
    req.flash('success', 'New district fees created successfully.');
    res.redirect(`/admin/transportFees/${year}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating new district fees.');
  }
};

exports.getTransportFeesByYearAndDistrict = async (req, res) => {
  const { year, district } = req.params;

  try {
    let fees = await TransportFees.findOne({ year: parseInt(year), district });

    if (!fees) {
      fees = new TransportFees({
        year: parseInt(year),
        district,
        fees: { primary: 0, middle: 0, high: 0 }
      });
      await fees.save();
    }

    res.render('admin/transportFees/show', { fees, year, district });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving transportation fees.');
  }
};

exports.renderEditTransportFeesForm = async (req, res) => {
  const { year, district } = req.params;

  try {
    let fees = await TransportFees.findOne({ year: parseInt(year), district });

    if (!fees) {
      fees = new TransportFees({
        year: parseInt(year),
        district,
        fees: { primary: 0, middle: 0, high: 0 },
      });
      await fees.save();
    }

    res.render('admin/transportFees/edit', { fees, year, district });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving or creating transportation fees for editing.');
  }
};

exports.updateTransportFeesByYearAndDistrict = async (req, res) => {
  const { year, district } = req.params;
  const { fees } = req.body;

  try {
    let transportFees = await TransportFees.findOne({ year: parseInt(year), district });

    if (!transportFees) {
      transportFees = new TransportFees({
        year: parseInt(year),
        district,
      });
    }

    transportFees.fees = {
      primary: parseFloat(fees.primary),
      middle: parseFloat(fees.middle),
      high: parseFloat(fees.high),
    };
    transportFees.updatedAt = new Date();

    await transportFees.save();
    res.redirect(`/admin/transportFees/${year}/${district}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating transportation fees.');
  }
};

exports.deleteTransportFees = async (req, res) => {
  const { year, district } = req.params;

  try {
    await TransportFees.findOneAndDelete({ year: parseInt(year), district });
    req.flash('success', 'Transport fees deleted successfully.');
    
    const currentYear = new Date().getFullYear();
    res.redirect(`/admin/transportFees/${currentYear}`);
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error deleting transport fees.');
    res.status(500).send('Error deleting transport fees.');
  }
};