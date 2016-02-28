"use strict";

/* jshint -W117 */

var lineChart;
var expensesChart;

google.charts.load('current', {packages: ['line', 'corechart']});
google.charts.setOnLoadCallback(function() {
  // new linechart without content (height will be 0)
  lineChart = new google.charts.Line(document.getElementById('linechart-dailybalance'));
  expensesChart = new google.visualization.PieChart(document.getElementById('piechart'));
});

var myFinancesModule = angular.module('MyFinances', ['ngMaterial', 'ngMessages']);

myFinancesModule.controller('MyFinancesCtrl', function($scope, $mdDialog, $mdMedia) {
  $scope.showNewAccountDialog = function(event, bank) {
    var controller;
    if (bank === 'bawagpsk') {
      controller = NewBawagpskAccountDialogController;
    } else if (bank === 'hellobank') {
      controller = NewHellobankAccountDialogController;
    } else if (bank === 'raiffeisen') {
      controller = NewRaiffeisenAccountDialogController;
    }
    $mdDialog.show({
      templateUrl: 'template-new-account-' + bank + '.html',
      clickOutsideToClose: true,
      controller: controller,
      // create a new child scope of the global angular scope
      scope: $scope.$new(),
      targetEvent: event
    });
  };
});

function NewBawagpskAccountDialogController($scope, $mdDialog) {
  $scope.processOKClicked = function() {
    data.currentBalance = $scope.currentBalance;
    //$scope.$parent.currentBalance = data.currentBalance;
    readCSVandUpdateChart('bawagpsk');
    $mdDialog.hide();
  };
}

function NewHellobankAccountDialogController($scope, $mdDialog) {
  $scope.processOKClicked = function() {
    data.currentBalance = $scope.currentBalance;
    readCSVandUpdateChart('hellobank');
    $mdDialog.hide();
  };
}

function NewRaiffeisenAccountDialogController($scope, $mdDialog) {
  $scope.processOKClicked = function() {
    data.currentBalance = $scope.currentBalance;
    readCSVandUpdateChart('raiffeisen');
    $mdDialog.hide();
  };
}

var data = {
  currentBalance: 0,
  bookings: null,
  dailyBalancesBaseZero: null,
  dailyBalances: null,
  dailyBalancesGoogleDataTable: null,
  keywordList: null
};

var addDays = function(date, days) {
  // add a number of days to a given date
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

var prepareBookingData = function(rawBookingData, bankName) {
  // takes raw CSV booking data and returns a nicer format:
  // [
  //   {date: 2011-03-07, amount: 107.5, details: 'gas station ...'},
  //   {date: 2011-03-10, amount: -23.05, details: 'LSR...'},...
  // ]
  var config = csvImportConfig[bankName];
  var bookingData = [];
  if (config.reverse) {
    rawBookingData.reverse();
  }
  for (var i = 0; i <= rawBookingData.length-1; i ++) {
    var date = rawBookingData[i][config.dateKey];
    if (config.dateNormalizer) {
      date = config.dateNormalizer(date);
    }
    date = new Date(date + 'T12:00:00');
    var amount = parseFloat(rawBookingData[i][config.amountKey].replace('.', '').replace(',', '.'));
    var details = rawBookingData[i][config.detailsKey];
    bookingData.push({date: date, amount: amount, details: details});
  }
  return bookingData;
};

var bookingsToDailyBalances = function(bookings, startBalance) {
  // takes a list of bookings (and an optional start balance) and returns daily account balances
  // (up until today)
  // format: [{date:..., balance:...}, {date:..., balance:...}, ...]
  var previousBalance = startBalance || 0;
  var dailyBalances = [];
  // index of the last unprocessed booking
  var unprocessedBookingIndex = 0;
  var today = new Date();
  today.setHours(1);
  var date = bookings[0].date;
  while (date <= today) {
    date = addDays(date, 1);
    // increase "date" and add all unprocessed bookings that occur before it
    while (unprocessedBookingIndex < bookings.length && bookings[unprocessedBookingIndex].date < date) {
      previousBalance += bookings[unprocessedBookingIndex].amount;
      unprocessedBookingIndex ++;
    }
    dailyBalances.push({date: date, balance: previousBalance});
  }
  return dailyBalances;
};

var dailyBalancesToDailyBalancesDataTable = function(dailyBalances) {
  var dataTable = new google.visualization.DataTable();
  dataTable.addColumn('date', 'Date');
  dataTable.addColumn('number', 'Balance');
  var rows = [];
  data.dailyBalances.forEach(function(element, index) {
    rows.push([element.date, element.balance]);
  });
  dataTable.addRows(rows);
  return dataTable;
};

var drawDailyBalanceChart = function(dailyBalancesGoogleDataTable) {
  var parentStyle = window.getComputedStyle(document.querySelector('#linechart-dailybalance').parentNode, null);
  var parentWidth = parseInt(parentStyle.getPropertyValue('width'));
  var parentHeight = parseInt(parentStyle.getPropertyValue('height'));
  var options = {
    chart: {
      title: 'Account balance'
    },
    width: parentWidth-32,
    height: parentHeight-40,
    // these actually don't work in material design charts for now
    enableInteractivity: false,
    tooltip: {trigger: 'selection'}
  };
  lineChart.draw(dailyBalancesGoogleDataTable, options);
};

window.addEventListener('resize', function() {
  drawDailyBalanceChart(data.dailyBalancesGoogleDataTable);
});

var correctDailyBalancesByAmount = function(dailyBalances, amount) {
  for (var i = 0; i < dailyBalances.length; i ++) {
    dailyBalances[i].balance += amount;
  }
  return dailyBalances;
};

var updateDataAndCharts = function() {
  // based on data.bookings and data.currentBalance,
  // update all other data items and update the chart
  data.dailyBalancesBaseZero = bookingsToDailyBalances(data.bookings);
  var correction = data.currentBalance - data.dailyBalancesBaseZero[data.dailyBalancesBaseZero.length-1].balance;
  data.dailyBalances = correctDailyBalancesByAmount(data.dailyBalancesBaseZero, correction);
  data.dailyBalancesGoogleDataTable = dailyBalancesToDailyBalancesDataTable();
  drawDailyBalanceChart(data.dailyBalancesGoogleDataTable);
  categorizeBookings();
  drawExpensesChart();
};

var csvImportConfig = {
  bawagpsk: {
    encoding: 'ISO-8859-1',
    delimiter: ';',
    header: false,
    dateKey: 2,
    dateNormalizer: function(date) {return date.split('.').reverse().join('-');},
    amountKey: 4,
    detailsKey: 1,
    reverse: true
  },
  hellobank: {
    encoding: 'ISO-8859-1',
    delimiter: ';',
    header: true,
    dateKey: 'Valutadatum',
    amountKey: 'Betrag',
    detailsKey: 'Umsatztext',
    reverse: true
  },
  raiffeisen: {
    encoding: 'ISO-8859-1',
    delimiter: ';',
    header: false,
    dateKey: 0,
    dateNormalizer: function(date) {return date.split('.').reverse().join('-');},
    amountKey: 3,
    detailsKey: 1
  }
};

var readCSVandUpdateChart = function(bankName) {
  Papa.parse(document.getElementById('file-input').files[0], {
    encoding: csvImportConfig[bankName].encoding,
    delimiter: csvImportConfig[bankName].delimiter,
    header: csvImportConfig[bankName].header,
    skipEmptyLines: true,
    complete: function(results) {
      data.bookings = prepareBookingData(results.data, bankName);
      updateDataAndCharts();
    }
  });
};

var getCategoryLookupTable = function(categories) {
  var lookupTable = {};
  categories.forEach(function(category) {
    category.keywords.forEach(function(keyword) {
      lookupTable[keyword] = category.name;
    });
  });
  return lookupTable;
};

var categorizeBookings = function() {
  var lookupTable = getCategoryLookupTable(categories);
  // iterate over all bookings and add a "category" attribute
  for (var i = 0; i < data.bookings.length; i ++) {
    var booking = data.bookings[i];
    for (var keyword in lookupTable) {
      var regex = new RegExp(keyword, 'i');
      if (booking.details.search(regex) > -1) {
        booking.category = lookupTable[keyword];
        break;
      }
    }
    if (booking.category === undefined) {
      booking.category = booking.amount > 0 ? 'unknown_income' : 'unknown_expense';
    }
  }
};

var getCategoryTotals = function() {
  // get the total expense / income for each category
  var categoryTotals = {};
  // initialize all values to 0
  categories.forEach(function(category) {
    categoryTotals[category.name] = 0;
  });
  categoryTotals['unknown_income'] = 0;
  categoryTotals['unknown_expense'] = 0;
  data.bookings.forEach(function(booking) {
    categoryTotals[booking.category] += booking.amount;
  });
  return categoryTotals;
};

var drawExpensesChart = function() {
  var categoryTotals = getCategoryTotals();
  var chartData = [['Category', 'Amount']];
  for (var category in categoryTotals) {
    if (categoryTotals[category] <= 0) {
      chartData.push([category, -categoryTotals[category]]);
    }
  }
  var chartDataTable = google.visualization.arrayToDataTable(chartData);
  var options = {
    title: 'Expenses',
    width: 900,
    height:600,
    pieSliceText: 'label',
    sliceVisibilityThreshold: 0
  };
  expensesChart.draw(chartDataTable, options);
};
