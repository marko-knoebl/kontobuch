// a library that can parse and read CSV bank statements.
// supports Austrian banks Bawag PSK, Raiffeisen, Hellobank and PayPal
// out of the box.
// Other banks need configuration.

var konto = {};

(function () {
  "use strict";
  konto.csvImportConfig = {
    bawagpsk: {
      name: 'Bawag PSK',
      encoding: 'ISO-8859-1',
      delimiter: ';',
      header: false,
      dateKey: 2,
      dateNormalizer: function (date) {return date.split('.').reverse().join('-');},
      amountKey: 4,
      detailsKey: 1,
      // replace repeated spaces with just one space
      detailsNormalizer: function(details) {return details.replace(/  +/g, ' ');},
      reverse: true
    },
    raiffeisen: {
      name: 'Raiffeisen',
      encoding: 'ISO-8859-1',
      delimiter: ';',
      header: false,
      dateKey: 0,
      dateNormalizer: function(date) {return date.split('.').reverse().join('-');},
      amountKey: 3,
      detailsKey: 1
    },
    hellobank: {
      name: 'Hello Bank',
      encoding: 'ISO-8859-1',
      delimiter: ';',
      header: true,
      dateKey: 'Valutadatum',
      amountKey: 'Betrag',
      detailsKey: 'Umsatztext',
      reverse: true
    },
    paypal: {
      name: 'PayPal',
      encoding: 'ISO-8859-1',
      delimiter: ',',
      header: true,
      dateKey: 'Datum',
      dateNormalizer: function(date) {return date.split('.').reverse().join('-');},
      amountKey: ' Brutto',
      detailsKey: ' Name',
      //otherParty: 3,
      reverse: true
    },
    easybank: {
      name: 'easybank',
      encoding: 'ISO-8859-1',
      delimiter: ';',
      header: false,
      dateKey: 2,
      dateNormalizer: function(date) {return date.split('.').reverse().join('-');},
      amountKey: 4,
      detailsKey: 1,
      reverse: true
    }
  };

  /**
   * Takes raw, bank-specific transaction data and returns a nicer format:
   *  [
   *    {id: 0, date: 2011-03-07, amount: 107.5, details: 'gas station ...'},
   *    {id: 1, date: 2011-03-10, amount: -23.05, details: 'LSR...'},...
   *  ]
   *  @param {Array} rawTransactionData - Transaction data in a bank-specific CSV form
   *  @param {object} config
   */
  var prepareTransactionData = function(rawTransactionData, config) {
    var transactionData = [];
    if (config.reverse) {
      rawTransactionData.reverse();
    }
    rawTransactionData.forEach(function(item, index) {
      var date = item[config.dateKey];
      if (config.dateNormalizer) {
        date = config.dateNormalizer(date);
      }
      if (!date.match('[0-9]{4}-[0-9]{2}-[0-9]{2}')) {
        throw 'invalid input: date'
      }
      date = new Date(date + 'T00:00:00');
      var amount = parseFloat(item[config.amountKey].replace('.', '').replace(',', '.'));
      var details = item[config.detailsKey];
      if (config.detailsNormalizer) {
        details = config.detailsNormalizer(details);
      }
      transactionData.push({date: date, amount: amount, details: details, id: index});
    });
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
   * An object representing a bank account
   * method importCsv:
   *   csv string: content of a csv file
   *   config: configuration object or bankname string
   *     encoding: encoding of the csv file
   *     delimiter: delimiter used in the csv file
   *     header: boolean: whether a header row is present
   *     dateKey: index or heading of the date column
   *     amountKey: index or heading of the amount column
   *     detailsKey: index or heading of the details column
   *     dateNormalizer (optional): a function that takes the date and
   *       returns an ISO date string
   *     detailsNormalizer (optional): processes the details attribute
   *     reverse: whether the csv data is in reverse chronological order
   *
   * The .transactions attribute is an array consisting of
   *   chronological entries with these attributes:
   *     date: JavaScript Date object
   *     amount: transaction amount
   *     description: description as provided in the statement
   * example:
   *   new AccountData(csvString, 'bawagpsk');
   *   new AccountData(
   *     csvString,
   *     {encoding: 'utf-8', delimiter: ',', header: false},
   *   );
   */
  konto.BankAccount = function() {};

  konto.BankAccount.prototype.importCsv = function(csvString, config) {
    // if 'config' is a string assume it's the name of a bank
    if (typeof config === 'string') {
      if (konto.csvImportConfig[config] === undefined) {
        throw 'No import config available for: ' + config;
      }
      config = konto.csvImportConfig[config];
      config.skipEmptyLines = true;
    }
    var transactions = Papa.parse(csvString, config).data;
    this.transactions = prepareTransactionData(transactions, config);
  };

  /**
   * Load data of the following format:
   *  [
   *    {date: 2011-03-07, amount: 107.5, details: 'gas station ...'},
   *    {date: 2011-03-10, amount: -23.05, details: 'LSR...'},...
   *  ]
   */
  konto.BankAccount.prototype.loadTransactionData = function(transactionData) {
    // copy the input data
    var transactions = [];
    transactionData.forEach(function(transaction) {
      // add a copy of the original data
      transactions.push({
        date: new Date(transaction.date.getTime()),
        amount: transaction.amount,
        details: transaction.details,
        id: transaction.id
      });
    });
    this.transactions = transactions;
  };

  konto.BankAccount.prototype.setCurrentBalance = function(currentBalance) {
    /**
     * Adjust the initial account balance so the current balance fits the one provided
     */
    var transactionSum = 0;
    this.transactions.forEach(function(transaction) {
      transactionSum += transaction.amount;
    });
    this.initialBalance = currentBalance - transactionSum;
  };

  konto.BankAccount.prototype.calculateDailyBalances = function() {
    if (this.initialBalance === undefined) {
      throw 'initialBalance is undefined. Call "setCurrentBalance" first.';
    }
    var previousBalance = this.initialBalance;
    var dailyBalances = [];
    // index of the last unprocessed transaction
    var unprocessedTransactionIndex = 0;
    var today = new Date();
    var date = this.transactions[0].date;
    while (date <= today) {
      // increase "date" and add all unprocessed transactions that occur before it
      // copy the date
      date = new Date(date.getTime());
      // increase by one day
      date.setDate(date.getDate() + 1)
      while (unprocessedTransactionIndex < this.transactions.length && this.transactions[unprocessedTransactionIndex].date < date) {
        previousBalance += this.transactions[unprocessedTransactionIndex].amount;
        unprocessedTransactionIndex ++;
      }
      dailyBalances.push({date: date, balance: previousBalance});
    }
    this.dailyBalances = dailyBalances;
  };

})();
