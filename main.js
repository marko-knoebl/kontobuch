"use strict";

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
  $scope.showNewAccountDialog = function(event){
    $mdDialog.show({
      templateUrl: 'template-new-account.html',
      clickOutsideToClose: true,
      controller: NewAccountDialogController,
      // create a new child scope of the global angular scope
      scope: $scope.$new(),
      targetEvent: event
    });
  };
});

function NewAccountDialogController($scope, $mdDialog) {
  $scope.processOKClicked = function() {
    data.currentBalance = $scope.currentBalance;
    //$scope.$parent.currentBalance = data.currentBalance;
    readBawagpskCSVandUpdateChart();
    $mdDialog.hide();
  };
};

var data = {
  currentBalance: 0,
  bookings: null,
  dailyBalancesBaseZero: null,
  dailyBalances: null,
  keywordList: null
};

var addDays = function(date, days) {
  // add a number of days to a given date
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

var prepareBawagpskBookingData = function(rawBookingData) {
  // takes raw booking data (imported from Bawag PSK CSV) and returns a nicer format:
  // [
  //   {date: 2011-03-07, amount: 107.5, details: 'gas station ...'},
  //   {date: 2011-03-10, amount: -23.05, details: 'LSR...'},...
  // ]
  var bookingData = [];
  for (var i = rawBookingData.length-2; i >= 0; i --) {
    var dayMonthYear = rawBookingData[i][2].split('.').reverse().join('-');
    var isoDate = new Date(dayMonthYear + 'T12:00:00');
    var amount = parseFloat(rawBookingData[i][4].replace('.', '').replace(',', '.'));
    var details = rawBookingData[i][1];
    bookingData.push({date: isoDate, amount: amount, details: details});
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
}

var drawDailyBalanceChart = function(dailyBalances) {
  var data = new google.visualization.DataTable();
  data.addColumn('date', 'Date');
  data.addColumn('number', 'Balance');
  var rows = [];
  dailyBalances.forEach(function(element, index) {
    rows.push([element.date, element.balance]);
  });
  data.addRows(rows);
  var options = {
    chart: {
      title: 'Account balance'
    },
    width: 900,
    height: 500,
    // these actually don't work in material design charts for now
    enableInteractivity: false,
    tooltip: {trigger: 'selection'}
  };
  lineChart.draw(data, options);
}

var correctDailyBalancesByAmount = function(dailyBalances, amount) {
  for (var i = 0; i < dailyBalances.length; i ++) {
    dailyBalances[i].balance += amount;
  }
  return dailyBalances;
};

var readBawagpskCSVandUpdateChart = function() {
  // parse the CSV file
  Papa.parse(document.getElementById('file-input').files[0], {
    encoding: 'ISO-8859-1',
    delimiter: ';',
    complete: function(results) {
      data.bookings = prepareBawagpskBookingData(results.data);
      data.dailyBalancesBaseZero = bookingsToDailyBalances(data.bookings);
      var correction = data.currentBalance - data.dailyBalancesBaseZero[data.dailyBalancesBaseZero.length-1].balance;
      data.dailyBalances = correctDailyBalancesByAmount(data.dailyBalancesBaseZero, correction);
      drawDailyBalanceChart(data.dailyBalances);
      categorizeBookings();
      drawExpensesChart();
    }
  });
}

var getCategoryLookupTable = function(categories) {
  var lookupTable = {};
  categories.forEach(function(category) {
    category.keywords.forEach(function(keyword) {
      lookupTable[keyword] = category.name;
    });
  });
  return lookupTable;
}

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
  })
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
  }
  expensesChart.draw(chartDataTable, options);
};
