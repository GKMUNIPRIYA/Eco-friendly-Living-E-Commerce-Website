import Disease from '../models/mysql/Disease.js';
import { Op } from 'sequelize';

// @desc    Get all diseases with sorting & searching
// @route   GET /api/diseases
// @access  Authenticated
export const getDiseases = async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let where = {};
    if (search) {
      where = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { symptoms: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    const diseases = await Disease.findAll({
      where,
      order: [[sortBy, sortOrder]]
    });

    res.json({ success: true, count: diseases.length, data: diseases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single disease record
// @route   GET /api/diseases/:id
// @access  Authenticated
export const getDisease = async (req, res) => {
  try {
    const disease = await Disease.findByPk(req.params.id);
    if (!disease) {
      return res.status(404).json({ success: false, message: 'Disease not found' });
    }
    res.json({ success: true, data: disease });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add new disease record
// @route   POST /api/diseases
// @access  Admin
export const createDisease = async (req, res) => {
  try {
    const { name, description, symptoms, image_url } = req.body;

    const disease = await Disease.create({
      name,
      description,
      symptoms,
      image_url
    });

    res.status(201).json({ success: true, data: disease });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update disease record
// @route   PUT /api/diseases/:id
// @access  Admin
export const updateDisease = async (req, res) => {
  try {
    const disease = await Disease.findByPk(req.params.id);
    if (!disease) {
      return res.status(404).json({ success: false, message: 'Disease not found' });
    }

    await disease.update(req.body);
    res.json({ success: true, data: disease });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete disease record
// @route   DELETE /api/diseases/:id
// @access  Admin
export const deleteDisease = async (req, res) => {
  try {
    const disease = await Disease.findByPk(req.params.id);
    if (!disease) {
      return res.status(404).json({ success: false, message: 'Disease not found' });
    }

    await disease.destroy();
    res.json({ success: true, message: 'Disease record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
