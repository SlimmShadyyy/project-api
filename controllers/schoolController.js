const db = require('../db');
const getDistance = require('../utils/distanceCalc');

exports.addSchool = async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ message: 'All fields are required and must be valid.' });
  }

  try {
    await db.execute(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    );
    res.status(201).json({ message: 'School added successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add school.' });
  }
};

exports.listSchools = async (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({ message: 'Latitude and longitude must be valid numbers.' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM schools');

    const schoolsWithDistance = rows.map((school) => ({
      ...school,
      distance: getDistance(userLat, userLon, school.latitude, school.longitude),
    }));

    const sorted = schoolsWithDistance.sort((a, b) => a.distance - b.distance);

    res.status(200).json(sorted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch schools.' });
  }
};
