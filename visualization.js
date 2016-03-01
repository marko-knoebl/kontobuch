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
  drawChart('dailyBalance');
  drawChart('expensesByCategory');
};

window.addEventListener('resize', redrawCharts);



// MOST OF THE ABOVE CODE CAN BE DISCARDED

var chartData__ = {
  dailyBalance: {
    drawn: false,
    generator: null,
    data: null,
    d3InputData: null,
    // type: nv.models.lineChart
    chart: null,
    containerId: '#chart-dailybalance-container'
  },
  expensesByCategory: {
    drawn: false,
    generator: null,
    data: null,
    d3InputData: null,
    // type: nv.models.pieChart
    chart: null,
    containerId: '#chart-expenses-by-category-container'
  }
};

var drawChart = function(chartName) {
  if (!chartData__[chartName].drawn) {
    chartData__[chartName].drawn = true;
    nv.addGraph(chartData__[chartName].generator);
    // TODO: only display one of the two
    document.querySelector(chartData__[chartName].containerId).style.display="block";
  } else {
    // update existing chart
    if (chartName === 'dailyBalance') {
      chartData__.dailyBalance.d3InputData[0].values = dailyBalancesToXY(data.dailyBalances);
      chartData__.dailyBalance.chart.update();
    } else if (chartName === 'expensesByCategory') {
      var chartData = transactionsToExpensesByCategory(data.transactions);
      // update the existing data with new values
      for (var i in chartData) {
        chartData__.expensesByCategory.data[i] = chartData[i];
      }
      chartData__.expensesByCategory.chart.update();
    }
  }
};

/**
 * Convert from format {date: ..., balance: ...}
 * to format {x: ..., balance: ...}
 */
var dailyBalancesToXY = function(dailyBalances) {
  var points = dailyBalances.map(function(element) {
    // element.date will be automatically converted to an integer
    return {x: element.date, y: element.balance};
  });
  return points;
};

var dailyBalanceGraphGenerator = function() {
  var balanceChart = nv.models.lineChart()
    .options({
      transitionDuration: 1000,
      useInteractiveGuideline: true
    })
  ;

  var format = d3.time.format('%Y-%m-%d');
  balanceChart.xAxis.axisLabel('Date');
  balanceChart.xAxis.tickFormat(function(d) {
    // convert dates from integers back to dates before formatting
    return format(new Date(d));
  });

  balanceChart.yAxis
    .axisLabel('Balance')
    .tickFormat(d3.format('d'))
  ;
  var points = dailyBalancesToXY(data.dailyBalances);
  chartData__.dailyBalance.d3InputData = [{
    values: points,
    color: '#1976d2',
    strokeWidth: 2,
    key: 'Account Balance'
  }];
  d3.select('#chart-dailybalance-container').append('svg')
    .datum(chartData__.dailyBalance.d3InputData)
    .call(balanceChart)
  ;
  nv.utils.windowResize(balanceChart.update);
  chartData__.dailyBalance.chart = balanceChart;
  return balanceChart;
};

chartData__.dailyBalance.generator = dailyBalanceGraphGenerator;

var transactionsToExpensesByCategory = function(transactions) {
  var categoryTotals = getCategoryTotals(data.transactions, categories);
  var expensesByCategoryD3 = [];
  for (var category in categoryTotals) {
    expensesByCategoryD3.push({
      x: category,
      // set all income to 0
      y: Math.max(-categoryTotals[category], 0)
    });
  }
  return expensesByCategoryD3;
};

var expensesByCategoryChartGenerator = function() {
  var chartData = transactionsToExpensesByCategory(data.transactions);
  chartData__.expensesByCategory.data = chartData;
  chartData__.expensesByCategory.chart = nv.models.pieChart();
  d3.select('#chart-expenses-by-category')
    .datum(chartData)
    .call(chartData__.expensesByCategory.chart);
  return chartData__.expensesByCategory.chart;
};

chartData__.expensesByCategory.generator = expensesByCategoryChartGenerator;
