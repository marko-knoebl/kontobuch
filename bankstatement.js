// a library that can parse and read CSV bank statements.
// supports Austrian banks Bawag PSK, Raiffeisen, Hellobank and PayPal
// out of the box.
// Other banks need configuration.

var bankStatement = {};

(function() {

  bankStatement.csvImportConfig = {
    bawagpsk: {
      name: 'Bawag PSK',
      encoding: 'ISO-8859-1',
      delimiter: ';',
      header: false,
      dateKey: 2,
      dateNormalizer: function(date) {return date.split('.').reverse().join('-');},
      amountKey: 4,
      detailsKey: 1,
      // replace repeated spaces with just one space
      detailsNormalizer: function(details) {return details.replace(/  +/g, ' ')},
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
    }
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
   * input:
   *   csv string: content of a csv file
   *   config: configuration object or bankname string
   *     encoding: encoding of the csv file
   *     delimiter: delimiter used in the csv file
   *     header: boolean: whether a header row is present
   * output:
   *   array consisting of chronological entries with these attributes:
   *     date: JavaScript Date object
   *     amount: transaction amount
   *     description: description as provided in the statement
   * example:
   *   readCsv(myFile, 'bawagpsk');
   *   readCsv(
   *     myFile,
   *     {encoding: 'utf-8', delimiter: ',', header: false},
   *   );
   */
  bankStatement.readCsvString = function(csvString, config) {
    if (typeof config === 'string') {
      config = bankStatement.csvImportConfig[config];
      if (config === undefined) {
        throw 'no import config available for: ' + config;
      }
      config.skipEmptyLines = true;
    }
    var result = Papa.parse(csvString, config);
    var transactions = result.data;
    transactions = prepareTransactionData(transactions, config);

    return transactions;
  }

})();
