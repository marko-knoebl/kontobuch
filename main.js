"use strict";

/* jshint -W117 */

var data = {
  currentBalance: 0,
  // format: {date: ..., amount: ..., details: ..., category: ...}
  transactions: null,
  // format: {date: ..., balance: ...}
  dailyBalances: null
};
var csvImportConfig = bankStatement.csvImportConfig;

var addDays = function(date, days) {
  /** add a number of days to a given date */
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Takes raw, bank-specific transaction data and returns a nicer format:
 *  [
 *    {date: 2011-03-07, amount: 107.5, details: 'gas station ...'},
 *    {date: 2011-03-10, amount: -23.05, details: 'LSR...'},...
 *  ]
 *  @param {Array} rawTransactionData - Transaction data in a bank-specific CSV form
 *  @param {object} config
 */
var prepareTransactionData = function(rawTransactionData, config) {
  var transactionData = [];
  if (config.reverse) {
    rawTransactionData.reverse();
  }
  for (var i = 0; i <= rawTransactionData.length-1; i ++) {
    var date = rawTransactionData[i][config.dateKey];
    if (config.dateNormalizer) {
      date = config.dateNormalizer(date);
    }
    if (!date.match('[0-9]{4}-[0-9]{2}-[0-9]{2}')) {
      throw 'invalid input: date'
    }
    date = new Date(date + 'T12:00:00');
    var amount = parseFloat(rawTransactionData[i][config.amountKey].replace('.', '').replace(',', '.'));
    var details = rawTransactionData[i][config.detailsKey];
    if (config.detailsNormalizer) {
      details = config.detailsNormalizer(details);
    }
    transactionData.push({date: date, amount: amount, details: details});
  }
  var invalid = (
    transactionData.length === 0 ||
    transactionData[0].date > transactionData[transactionData.length - 1].date
  );
  if (invalid) {
    throw 'invalid input'
  }
  return transactionData;
};

/**
 * Takes a list of transactions and a start balance and returns daily
 * account balances (up until today)
 * format: [{date:..., balance:...}, {date:..., balance:...}, ...]
 * @param {Array} transactions - Transactions (sorted by date)
 * @param {Number} startBalance - Account balance before the first transaction
 */
var transactionsToDailyBalances = function(transactions, startBalance) {
  var previousBalance = startBalance || 0;
  var dailyBalances = [];
  // index of the last unprocessed transaction
  var unprocessedTransactionIndex = 0;
  var today = new Date();
  today.setHours(1);
  var date = transactions[0].date;
  while (date <= today) {
    date = addDays(date, 1);
    // increase "date" and add all unprocessed transactions that occur before it
    while (unprocessedTransactionIndex < transactions.length && transactions[unprocessedTransactionIndex].date < date) {
      previousBalance += transactions[unprocessedTransactionIndex].amount;
      unprocessedTransactionIndex ++;
    }
    dailyBalances.push({date: date, balance: previousBalance});
  }
  return dailyBalances;
};

/**
 * Add/subtract a certain amount to/from all daily balances
 */
var correctDailyBalancesByAmount = function(dailyBalances, amount) {
  for (var i = 0; i < dailyBalances.length; i ++) {
    dailyBalances[i].balance += amount;
  }
  return dailyBalances;
};

/**
 * Based on data.transactions and data.currentBalance, update all
 * other data items.
 */
var updateData = function() {
  var dailyBalancesBaseZero = transactionsToDailyBalances(data.transactions);
  var correction = data.currentBalance - dailyBalancesBaseZero[dailyBalancesBaseZero.length-1].balance;
  data.dailyBalances = correctDailyBalancesByAmount(dailyBalancesBaseZero, correction);
  categorizeTransactions();
};

/**
 * Read CSV data and update charts accordingly
 */
var readCSVandUpdateChart = function(bankName, callback) {
  var onComplete = function(results) {
    var transactions;
    console.log('removed last entry:', results.data.pop());
    try {
      transactions = prepareTransactionData(results.data, csvImportConfig[bankName]);
    } catch (err) {
      console.log(err);
      alert('Unable to import data.');
    }
    data.transactions = transactions;
    updateData();
    copyTransactionsToAngularScope();
    drawChart('dailyBalance');
    drawChart('expensesByCategory');
    callback();
  };
  var csvFile = document.querySelector('#file-input').files[0];
  bankStatement.readCsv(csvFile, bankName, onComplete);
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
