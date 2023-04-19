const mongoose = require('mongoose');
const convertObjectId = (id) => {
    return new mongoose.Types.ObjectId(id);
};
module.exports = convertObjectId;