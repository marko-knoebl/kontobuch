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
    var papaConfig;
    if (typeof config === 'string') {
      papaConfig = bankStatement.csvImportConfig[config];
      if (papaConfig === undefined) {
        throw 'no import config available for: ' + config;
      }
    } else {
      papaConfig = config;
    }
    var result = Papa.parse(csvString, papaConfig);
    return result;
  }

})();
