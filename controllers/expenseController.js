const express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const Expenses = mongoose.model('Expenses');
const Income = mongoose.model('Income');
const User = mongoose.model('User');
var totalExp = 0;
var totalInc = 0;
var totalBal = 0;
var expen = [],
    inco = [];
var ID, dispName;
var isLoggedIn = 0;
var userDetails;
/// Home page
router.get('/', (req, res) => {
    isLoggedIn = 0;
    res.render('login/login', {
        viewTitle: 'Login'
    });
});
router.get('/list', (req, res) => {
    User.find((err, docs) => {
        if (isLoggedIn == 1) {
            expen = [];
            inco = [];
            totalExpenses(req, res);
            totalIncome(req, res);
            getData(req, res);
            /// Rendring list
            renderList(req, res);
        } else
            res.render('login/login', {
                viewTitle: 'Login',
                error: 'Not logged in'
            });
    });
});

/* USER */
router.get('/signup', (req, res) => {
    res.render('login/signup', {
        viewTitle: 'Sign Up'
    });
})
router.post('/signup', (req, res) => {
    newUser(req, res);
});

router.post('/', (req, res) => {
    login(req, res);
});

function newUser(req, res) {
    var u = new User();
    u.name = req.body.name;
    u.Email = req.body.Email;
    u.password = req.body.password;
    u.userID = Math.floor((Math.random() * 1000) + 1);
    ID = u.userID;
    isLoggedIn = 1;
    u.save((err, doc) => {
        if (!err) {
            res.redirect('/login');
            /*isLoggedIn = 1;
            totalExpenses(req, res);
            getData(req, res);
            renderList(req, res);*/
            //res.redirect('/expenses/list');
        } else
            console.log('Error ' + err);
    });
}

function login(req, res) {
    User.find((err, docs) => {
        var k = 0;
        if (isLoggedIn == 0)
            while (docs[k]) {
                if (docs[k].Email == req.body.Email) {
                    if (docs[k].password == req.body.password) {
                        /// Load User Data
                        isLoggedIn = 1;
                        ID = docs[k].userID;
                        dispName = docs[k].name;
                        getData(req, res);
                        res.redirect('/expenses/list');
                        //renderList(req, res);
                        break;
                    }
                } else
                    res.render('login/login', {
                        viewTitle: 'Login',
                        error: 'Not logged in'
                    });
                k++;
            }
        else {
            isLoggedIn = 0;
            //console.log('1');
            //res.render('/login');
        }
    });
    //res.redirect('/expenses/list');
}

function getData(req, res) {
    Expenses.find((err, docs) => {
        totalBal = totalInc - totalExp;
        if (!err) {
            var k = 0;
            var i = 0;
            while (docs[k]) {
                if (docs[k].userID == ID) {
                    expen[i] = docs[k];
                    i++;
                }
                k++;
            }
        } else
            console.log("Error " + err);
    });
    Income.find((err, docs) => {
        totalBal = totalInc - totalExp;
        if (!err) {
            var k = 0;
            var i = 0;
            while (docs[k]) {
                if (docs[k].userID == ID) {
                    inco[i] = docs[k];
                    i++;
                }
                k++;
            }
        } else
            console.log("Error " + err);
    });
}

function renderList(req, res) {
    Income.find((err, docs) => {
        totalBal = totalInc - totalExp;
        if (!err) {
            res.render("expenses/expenseList", {
                incList: inco,
                income: totalInc,
                expList: expen,
                expense: totalExp,
                balance: totalBal,
                id: ID,
                name: dispName
            });
        } else
            console.log("Error " + err);
    });
}

/* Expense */
/// Posting Form
router.get('/add', (req, res) => {
    res.render("expenses/addOrEditExpense", {
        viewTitle: "Add Expense"
    });
});
router.post('/addOrEditExpense', (req, res) => {
    if (req.body._id == '')
        insertExpense(req, res);
    else
        updateExpenseRecord(req, res);
});

/* Income */
/// Posting Form
router.get('/addIncome', (req, res) => {
    res.render("incomes/addOrEditIncome", {
        viewTitle: "Add Income"
    });
});
router.post('/addOrEditIncome', (req, res) => {
    if (req.body._id == '')
        insertIncome(req, res);
    else
        updateIncomeRecord(req, res);
});

/********** EXPENSES ************/

/// Putting data to mongoDB
function insertExpense(req, res) {
    var e = new Expenses();
    e.expenseType = req.body.expenseType;
    e.expenseAmount = req.body.expenseAmount;
    e.expenseDate = req.body.expenseDate;
    e.userID = ID;
    e.save((err, doc) => {
        if (!err) {
            totalExpenses(req, res);
            res.redirect('/expenses/list');
        } else
            console.log('Error ' + err);
    });
}
/// Edit Record
router.get('/editexp/:id', (req, res) => { /// TODO
    Expenses.findById(req.params.id, (err, docs) => {
        if (!err) {
            totalExpenses(req, res);
            res.render('expenses/addOrEditExpense', {
                viewTitle: "Edit Expense",
                expenses: docs
            });
        }
    })
});

/// Delete Record
router.get('/deleteexp/:id', (req, res) => {
    Expenses.findByIdAndRemove(req.params.id, (err, docs) => {
        if (!err) {
            res.redirect("/expenses/list");
            totalExpenses(req, res);
        } else
            console.log('Error in deletion: ' + err);

    });
});

function totalExpenses(req, res) {
    totalExp = 0;
    var k = 0;
    Expenses.find((err, docs) => {
        while (docs[k])
            k++;
        for (var i = 0; i < k; i++) {
            if (docs[i].userID == ID)
                totalExp += docs[i].expenseAmount;
        }
    });
}

function updateExpenseRecord(req, res) {
    Expenses.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, docs) => {
        if (!err)
            res.redirect('/expenses/list');
        else
            console.log('Error Editing');
    });
}
/************ INCOME ***************/

/// Putting data to mongoDB
function insertIncome(req, res) {
    var i = new Income();
    i.incomeType = req.body.incomeType;
    i.incomeAmount = req.body.incomeAmount;
    i.expenseDate = req.body.expenseDate;
    i.userID = ID;
    i.save((err, doc) => {
        if (!err)
            res.redirect('/expenses/list');
        else
            console.log('Error ' + err);
    });
}

/// Edit Record
router.get('/editinc/:id', (req, res) => { /// TODO
    Income.findById(req.params.id, (err, docs) => {
        if (!err) {
            res.render('incomes/addOrEditIncome', {
                viewTitle: "Edit Income",
                incomes: docs
            });
        }
    })
});

/// Delete Record
router.get('/deleteinc/:id', (req, res) => {
    Income.findByIdAndRemove(req.params.id, (err, docs) => {
        if (!err)
            res.redirect("/expenses/list");
        else
            console.log('Error in deletion: ' + err);

    });
});

function totalIncome(req, res) {
    totalInc = 0;
    var k = 0;
    Income.find((err, docs) => {
        while (docs[k])
            k++;
        for (var i = 0; i < k; i++) {
            if (docs[i].userID == ID)
                totalInc += docs[i].incomeAmount;
        }
    });
}

function updateIncomeRecord(req, res) {
    Income.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }, (err, docs) => {
        if (!err)
            res.redirect('/expenses/list');
        else
            console.log('Error Editing');
    });
}
/*********** Profile ************/
router.get('/profile', (req, res) => {
    User.find((err, docs) => {
        if (isLoggedIn == 1) {
            expen = [];
            inco = [];
            getUserData(req, res);
            /// Rendring list
            renderUserList(req, res);
        } else
            res.render('login/login', {
                viewTitle: 'Login',
                error: 'Not logged in'
            });
    });
});

function getUserData(req, res) {
    User.find((err, docs) => {
        if (!err) {
            var k = 0;
            var i = 0;
            while (docs[k]) {
                if (docs[k].userID == ID) {
                    userDetails = docs[k];
                    i++;
                }
                k++;
            }
        } else
            console.log("Error " + err);
    });
}

function renderUserList(req, res) {
    Income.find((err, docs) => {
        totalBal = totalInc - totalExp;
        if (!err) {
            res.render("profile/profile", {
                profileList: userDetails,
                viewTitle: "Profile"
            });
        } else
            console.log("Error " + err);
    });
}
module.exports = router;