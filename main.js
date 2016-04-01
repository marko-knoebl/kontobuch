"use strict";

/* jshint -W117 */

var bankAccount;
bankAccount = new konto.BankAccount();

/**
 * Read the selected CSV file and pass its content to the callback
 */
var getCsvFileContent = function(bankName, callback) {
  var csvFile = document.querySelector('#file-input').files[0];
  var encoding = konto.csvImportConfig[bankName].encoding;
  var reader = new FileReader();
  reader.onload = function(event) {
    callback(event.target.result);
  };
  reader.readAsText(csvFile, encoding);
};

/**
 * Read the transaction data,
 * calculate daily balances,
 * categorize transactions,
 * then redraw charts
 * (and close the dialog)
 */
var updateCharts = function(callback) {
  bankAccount.calculateDailyBalances();
  categorizeTransactions();
  copyTransactionsToAngularScope();
  drawChart('dailyBalance');
  drawChart('expensesByCategory');
  callback();
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
  for (var i = 0; i < bankAccount.transactions.length; i ++) {
    var transaction = bankAccount.transactions[i];
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
