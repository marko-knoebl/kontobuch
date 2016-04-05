"use strict";

/* jshint -W117 */

var myFinancesModule = angular.module('MyFinances', ['ngMaterial', 'ngMessages', 'md.data.table']);

// Angular setup

myFinancesModule.controller('MyFinancesCtrl', function($scope, $mdDialog, $mdSidenav, $mdMedia) {
  $scope.currentBalance = 0;
  $scope.csvImportConfig = konto.csvImportConfig;

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
      templateUrl: 'template-new-account-' + bank + '.html',
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
        getBawagpskCsvTransactionData($scope.login, $scope.password, function(transactionData) {
          bankAccount.importCsv(transactionData, 'bawagpsk');
          bankAccount.setCurrentBalance(0);
          updateCharts($mdDialog.hide);
        });
      };
    };
    $mdDialog.show({
      templateUrl: 'template-bawagpsk-credentials.html',
      clickOutsideToClose: true,
      controller: controller,
      // create ne child scope of the global angular scope
      scope: $scope.$new(),
      targetEvent: event,
      //fullscreen: true
    })
  };

  $scope.toggleLeftMenu = function() {
    $mdSidenav('left').toggle().then(function() {
      chartData__.expensesByCategory.chart.update();
      chartData__.dailyBalance.chart.update();
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

  $scope.categoriesByName = categoriesByName;

  copyTransactionsToAngularScope = function() {
    $scope.transactions = bankAccount.transactions;
  };


  $scope.loadSampleData = function() {
    var sampleData = [
      {
        date: new Date('2016-01-01'),
        amount: 1423.89,
        details: 'Gehalt Dezember 2015'
      },
      {
        date: new Date('2016-01-13'),
        amount: -34.49,
        details: 'Shell Tankstelle'
      },
      {
        date: new Date('2016-01-15'),
        amount: -6.99,
        details: 'McDonalds'
      },
      {
        date: new Date('2016-01-15'),
        amount: -17.23,
        details: 'Billa'
      },
      {
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

