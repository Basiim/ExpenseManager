const mongoose = require('mongoose');

var incomeSchema = new mongoose.Schema({
    incomeType: {
        type: String,
        required: 'This field is required.'
    },
    userID: {
        type: Number
    },
    incomeAmount: {
        type: Number
    },
    incomeDate: {
        type: Date
    }
});



mongoose.model('Income', incomeSchema);