'use strict';

/**
 * Given a login ("Verfügernummer") and password ("PIN"),
 * download the transaction data from
 * ebanking.bawagpsk.com.
 * The transaction data will be provided as a string representing
 * a CSV file. It will be passed to the callback function
 * This function only works if there is no CORS protection
 * (e.g. in a properly configured Chrome app)
 * It does not work in regular websites
 */
var getBawagpskAccountData = function(login, password, callback) {
  /*
    Data can be downloaded manually from the BawagPSK website
    by following these steps:
    * Go to ebanking.bawagpsk.com
    * Enter your login (Verfügernummer) and password (Pin)
    * Go to "Umsätze"
    * At the bottom, click "download CSV"
    This algorithm does these steps automatically
  */

  /* these functions are executed in order:
    getBawagpskLoginPage()
    loginToBawagpsk()
    downloadBawagpskCsvTransactionData()
    callback()
  */

  var getBawagpskLoginPage = function(login, password) {
    var loginPageRequest = new XMLHttpRequest();
    loginPageRequest.onreadystatechange = function() {
      if (loginPageRequest.readyState === 4 && loginPageRequest.status === 200) {
        var loginPage = loginPageRequest.responseText;
        loginToBawagpsk(loginPage, login, password);
      }
    };
    loginPageRequest.open(
      'GET',
      'https://ebanking.bawagpsk.com/InternetBanking/InternetBanking?d=login&svc=BAWAG&ui=html&lang=de',
       true
    );
    loginPageRequest.send(null);
  };


  /**
   * Given an HTML login page, log in to BawagPSK
   * Then, download the transaction data by calling
   * downloadBawagpskCsvTransactionData
   */
  var loginToBawagpsk = function(loginPage, login, password) {
    // find the login form
    var regexForm = /<form name="loginForm"[\s\S]*?<\/form>/;
    var formHtml = regexForm.exec(loginPage)[0];

    // find the URL to send the login data to
    var formDom = document.createElement('div');
    formDom.innerHTML = formHtml;
    var action = formDom.childNodes[0].getAttribute('action');

    // create login form data
    var formData = 'svc=BAWAG&submitflag=true&d=login&lang=de&rd='
    formData += '&pin=' + password;
    formData += '&dn=' + login;
    // requests at the website contain the grr property, but it seems not to be necessary
    //var grr = formDom.querySelector('input[name="grr"]').value;
    //formData += ('&grr=' + grr);

    var loginRequest = new XMLHttpRequest();
    loginRequest.onreadystatechange = function() {
      if (loginRequest.readyState === 4 && loginRequest.status === 200) {

        var currentBalanceRegex = /<td class="tdright"><span[\s\S]*?>([\s\S]*?) EUR/;
        var currentBalanceText = currentBalanceRegex
          .exec(loginRequest.response)[1].replace('.', '').replace(',', '');
        var currentBalance = parseInt(currentBalanceText) / 100;

        var findAction = /InternetBanking\/InternetBanking\/(\S*\?)d=login/;
        var action = findAction.exec(loginRequest.responseURL)[1];
        downloadBawagpskCsvTransactionData(action, currentBalance);
      }
    };
    loginRequest.open('POST', 'https://ebanking.bawagpsk.com' + action);
    loginRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    loginRequest.send(formData);
  };

  var downloadBawagpskCsvTransactionData = function(action, currentBalance) {
    var formData = 'svc=PSK&d=transactions&pagenumber=1&submitflag=true&suppressOverlay=true&print=false&csv=true&accountChanged=false&newSearch=false&sortingColumn=BOOKING_DATE&sortingDirection=-1&lastviewed=&outstandingBalance=&searchPanelShown=false&initialRowsPerPage=10&konto=0&datefrom=&datetill=&betvon=&centsvon=&betbis=&centsbis=&buchungstext=&umsatzart=-1&enlargementOfTransaction=0&rowsPerPage=10';

    var csvDownloadRequest = new XMLHttpRequest();
    csvDownloadRequest.onreadystatechange = function() {
      if (csvDownloadRequest.readyState === 4 && csvDownloadRequest.status === 200) {
        callback({csvString: csvDownloadRequest.responseText, currentBalance: currentBalance});
      }
    };
    csvDownloadRequest.open('POST', 'https://ebanking.bawagpsk.com/InternetBanking/InternetBanking/' + action);
    csvDownloadRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    csvDownloadRequest.send(formData);
  };

  getBawagpskLoginPage(login, password);
};
