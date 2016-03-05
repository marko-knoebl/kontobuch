"use strict";

/* jshint -W117 */

var chartData__ = {
  dailyBalance: {
    drawn: false,
    generator: null,
    data: null,
    d3InputData: null,
    // type: nv.models.lineChart
    chart: null,
  },
  expensesByCategory: {
    drawn: false,
    generator: null,
    data: null,
    d3InputData: null,
    // type: nv.models.pieChart
    chart: null,
  }
};

var drawChart = function(chartName) {
  if (!chartData__[chartName].drawn) {
    chartData__[chartName].drawn = true;
    nv.addGraph(chartData__[chartName].generator);
    document.querySelector('#charts').style.display="block";
    document.querySelector('#new-account-buttons').style.display="none";
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
  balanceChart.showLegend(false);
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
  var categoryTotals = getCategoryTotals(transactions, categories);
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
  chartData__.expensesByCategory.chart.showLegend(false);
  d3.select('#chart-expenses-by-category-container').append('svg')
    .datum(chartData)
    .call(chartData__.expensesByCategory.chart);
  nv.utils.windowResize(chartData__.expensesByCategory.chart.update);
  return chartData__.expensesByCategory.chart;
};

chartData__.expensesByCategory.generator = expensesByCategoryChartGenerator;
