const mongoose = require('mongoose');

var expensesSchema = new mongoose.Schema({
    expenseType: {
        type: String,
        required: 'This field is required.'
    },
    userID: {
        type: Number
    },
    expenseAmount: {
        type: Number
    }
});



mongoose.model('Expenses', expensesSchema);