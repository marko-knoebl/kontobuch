"use strict";

/* jshint -W117 */

// all code that is solely concerned with visualization goes here

// Charts setup

var lineChart;
var expensesChart;

google.charts.load('44', {packages: ['line', 'corechart']});
google.charts.setOnLoadCallback(function() {
  // new linechart without content (height will be 0)
  lineChart = new google.charts.Line(document.getElementById('linechart-dailybalance'));
  expensesChart = new google.visualization.PieChart(document.getElementById('piechart'));
});

/**
 * Convert an array of daily balances to a Google data table.
 */
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

/**
 * Update the displayed chart with data provided in a Google data table
 */
var drawDailyBalanceChart = function(dailyBalancesGoogleDataTable, width, height) {
  var options = {
    chart: {
      title: 'Account balance'
    },
    width: width,
    height: height,
    // these actually don't work in material design charts for now
    enableInteractivity: false,
    tooltip: {trigger: 'selection'},
    legend: {position: 'none'}
  };
  lineChart.draw(dailyBalancesGoogleDataTable, options);
};

/**
 * Draw a pie chart of expense categories.
 */
var drawExpensesChart = function(width, height) {
  var categoryTotals = getCategoryTotals(data.transactions, categories);
  var chartData = [['Category', 'Amount']];
  for (var category in categoryTotals) {
    if (categoryTotals[category] <= 0) {
      chartData.push([category, -categoryTotals[category]]);
    }
  }
  var chartDataTable = google.visualization.arrayToDataTable(chartData);
  var options = {
    title: 'Expenses',
    width: width,
    height: height,
    pieSliceText: 'label',
    sliceVisibilityThreshold: 0
  };
  expensesChart.draw(chartDataTable, options);
};

var redrawCharts = function() {
  var bodyStyle = window.getComputedStyle(document.querySelector('body'));
  var bodyWidth = parseInt(bodyStyle.getPropertyValue('width'));
  var bodyHeight = parseInt(bodyStyle.getPropertyValue('height'));
  drawDailyBalanceChart(data.dailyBalancesGoogleDataTable, bodyWidth - 32, bodyHeight - 32);
  drawExpensesChart(bodyWidth - 32, bodyHeight - 32);
};

window.addEventListener('resize', redrawCharts);
