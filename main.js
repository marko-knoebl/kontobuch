"use strict";

/* jshint -W117 */

var bankAccount;

var data = {
  currentBalance: 0,
  // format: {date: ..., amount: ..., details: ..., category: ...}
  transactions: null,
  // format: {date: ..., balance: ...}
  dailyBalances: null
};

/**
 * Based on data.transactions and data.currentBalance, update all
 * other data items.
 */
var updateData = function() {
  bankAccount.setCurrentBalance(data.currentBalance);
  bankAccount.calculateDailyBalances();
  data.dailyBalances = bankAccount.dailyBalances;
  categorizeTransactions();
};

/**
 * Read CSV data and update charts accordingly
 */
var readCSVandUpdateChart = function(bankName, callback) {
  var onComplete = function(bankAccount) {
    data.transactions = bankAccount.transactions;
    updateData();
    copyTransactionsToAngularScope();
    drawChart('dailyBalance');
    drawChart('expensesByCategory');
    callback();
  };
  var csvFile = document.querySelector('#file-input').files[0];
  var encoding = konto.csvImportConfig[bankName].encoding;
  var reader = new FileReader();
  reader.onload = function(event) {
    bankAccount = new konto.BankAccount();
    bankAccount.importCsv(event.target.result, bankName)
    onComplete(bankAccount);
  };
  reader.readAsText(csvFile, encoding);
};

/**
 * Create a lookup table to associate keywords with a category
 */
var getCategoryLookupTable = function(categories) {
  var lookupTable = {};
  categories.forEach(function(category) {
    category.keywords.forEach(function(keyword) {
      lookupTable[keyword] = category.name;
    });
  });
  return lookupTable;
};

/**
 * Add a "category" attribute to all transactions
 */
var categorizeTransactions = function() {
  var lookupTable = getCategoryLookupTable(categories);
  for (var i = 0; i < data.transactions.length; i ++) {
    var transaction = data.transactions[i];
    for (var keyword in lookupTable) {
      var regex = new RegExp(keyword, 'i');
      if (transaction.details.search(regex) > -1) {
        transaction.category = lookupTable[keyword];
        break;
      }
    }
    if (transaction.category === undefined) {
      transaction.category = transaction.amount > 0 ? 'income' : 'expenses';
    }
  }
};

/**
 * Given a list of transactions and a list of categories,
 * get the total expenses / revenues for each category.
 */
var getCategoryTotals = function(transactions, categories) {
  var categoryTotals = {};
  // initialize all values to 0
  categories.forEach(function(category) {
    categoryTotals[category.name] = 0;
  });
  categoryTotals['income'] = 0;
  categoryTotals['expenses'] = 0;
  transactions.forEach(function(transaction) {
    categoryTotals[transaction.category] += transaction.amount;
  });
  return categoryTotals;
};
