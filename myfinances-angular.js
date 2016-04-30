"use strict";

/* jshint -W117 */

var myFinancesModule = angular.module('MyFinances', ['ngMaterial', 'ngMessages', 'md.data.table', 'vs-repeat']);

// Angular setup

myFinancesModule.controller('MyFinancesCtrl', function($scope, $mdDialog, $mdSidenav, $mdMedia) {
  $scope.currentBalance = 0;
  $scope.csvImportConfig = konto.csvImportConfig;
  $scope.updateCharts = updateCharts;

  $scope.isChromeApp = Boolean(window.chrome && chrome.app && chrome.app.runtime);

  $scope.showNewAccountDialog = function(event, bank) {
    // create a new controller corresponding to the selected bank
    var controller = function($scope, $mdDialog) {
      $scope.cancel = $mdDialog.cancel;
      $scope.processOKClicked = function() {

        getCsvFileContent(bank, function(csvContent) {
          bankAccount.importCsv(csvContent, bank);
          bankAccount.setCurrentBalance($scope.currentBalance);
          updateCharts($mdDialog.hide);
        });
        //$scope.$parent.currentBalance = data.currentBalance;
      };
    };
    $mdDialog.show({
      templateUrl: 'templates/new-account-' + bank + '.html',
      clickOutsideToClose: true,
      controller: controller,
      // create a new child scope of the global angular scope
      scope: $scope.$new(),
      targetEvent: event,
      fullscreen: true
    });
  };

  $scope.showBawagpskCredentialsDialog = function(event) {
    var controller = function($scope, $mdDialog) {
      $scope.cancel = $mdDialog.cancel;
      $scope.processOKClicked = function() {
        getBawagpskAccountData($scope.login, $scope.password, function(accountData) {
          bankAccount.importCsv(accountData.csvString, 'bawagpsk');
          bankAccount.setCurrentBalance(accountData.currentBalance);
          updateCharts($mdDialog.hide);
        });
      };
    };
    $mdDialog.show({
      templateUrl: 'templates/bawagpsk-credentials.html',
      clickOutsideToClose: true,
      controller: controller,
      // create ne child scope of the global angular scope
      scope: $scope.$new(),
      targetEvent: event,
      //fullscreen: true
    })
  };

  $scope.transactionDetailsDialog = function(event) {
    var controller = function($scope, $mdDialog) {
      $scope.close = $mdDialog.cancel;
    };
    $mdDialog.show({
      templateUrl: 'templates/transaction-details.html',
      clickOutsideToClose: true,
      controller: controller,
      targetEvent: event,
      scope: $scope.$new(),
      fullscreen: true
    });
  };
  
  $scope.categoryKeywordsDialog = function(categoryData, event) {
    var controller = function($scope, $mdDialog) {
      $scope.cancel = $mdDialog.cancel;
      $scope.categoryData = categoryData;
    };
    $mdDialog.show({
      templateUrl: 'templates/category-keywords.html',
      clickOutsideToClose: true,
      controller: controller,
      targetEvent: event,
      scope: $scope.$new(),
      fullscreen: true
    });
  };

  $scope.transactionTableSelectionId = 23;

  $scope.toggleLeftMenu = function() {
    $mdSidenav('left').toggle().then(function() {
      if (chartData__.expensesByCategory.chart) {
        chartData__.expensesByCategory.chart.update();
      }
      if (chartData__.dailyBalance.chart) {
        chartData__.dailyBalance.chart.update();
      }
    });
  };

  $scope.active = 'balance';


  // data belonging to the table
  $scope.selected = [];

  $scope.options = {
    // select a row on click
    autoSelect: false,
    boundaryLinks: true,
    largeEditDialog: false,
    pageSelector: false,
    rowSelection: true
  };

  $scope.query = {
    order: '-date',
    limit: 10,
    page: 1
  };

  $scope.transactions = [];

  $scope.categories = categories;

  $scope.categoriesByName = bankAccount.categoriesByName;

  copyTransactionsToAngularScope = function() {
    $scope.transactions = bankAccount.transactions;
  };


  $scope.loadSampleData = function() {
    var sampleData = [
      {
        id: 0,
        date: new Date('2016-01-01'),
        amount: 1423.89,
        details: 'Gehalt Dezember 2015'
      },
      {
        id: 1,
        date: new Date('2016-01-13'),
        amount: -34.49,
        details: 'Shell Tankstelle'
      },
      {
        id: 2,
        date: new Date('2016-01-15'),
        amount: -6.99,
        details: 'McDonalds'
      },
      {
        id: 3,
        date: new Date('2016-01-15'),
        amount: -17.23,
        details: 'Billa'
      },
      {
        id: 4,
        date: new Date('2016-01-20'),
        amount: -26.30,
        details: 'Amazon'
      }
    ];
    bankAccount.loadTransactionData(sampleData);
    bankAccount.setCurrentBalance(2300);
    updateCharts();
  };
});

var copyTransactionsToAngularScope;

