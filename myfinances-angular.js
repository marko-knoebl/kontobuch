"use strict";

/* jshint -W117 */

var myFinancesModule = angular.module('MyFinances', ['ngMaterial', 'ngMessages', 'md.data.table', 'vs-repeat']);

// Angular setup

myFinancesModule.controller('MyFinancesCtrl', function($scope, $mdDialog, $mdSidenav, $mdMedia) {
  $scope.currentBalance = 0;
  $scope.csvImportConfig = konto.csvImportConfig;
  $scope.updateCharts = updateCharts;

  $scope.isChromeApp = Boolean(window.chrome && chrome.app && chrome.app.runtime);

  $scope.active = 'startpage';

  $scope.showNewAccountDialog = function(event, bank) {
    // create a new controller corresponding to the selected bank
    var controller = function($scope, $mdDialog) {
      $scope.cancel = $mdDialog.cancel;
      $scope.processOKClicked = function() {

        getCsvFileContent(bank, function(csvContent) {
          bankAccount.importCsv(csvContent, bank);
          bankAccount.setCurrentBalance($scope.currentBalance);
          $scope.$parent.active = 'balance';
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
          $scope.$parent.active = 'balance';
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

  $scope.aboutDialog = function(event) {
    var controller = function($scope, $mdDialog) {
      $scope.close = $mdDialog.cancel;
    };
    $mdDialog.show({
      templateUrl: 'templates/about-dialog.html',
      clickOutsideToClose: true,
      controller: controller,
      targetEvent: event,
      fullscreen: true
    })
  };

  $scope.transactionTableSelectionId = 23;

  $scope.toggleLeftMenu = function() {
    var safeUpdate = function() {
      if (chartData__.expensesByCategory.chart) {
        chartData__.expensesByCategory.chart.update();
      }
      if (chartData__.dailyBalance.chart) {
        chartData__.dailyBalance.chart.update();
      }
    };
    // resize newly displayed charts (if we do it immediately they
    //  will shrink to minimal size)
    setTimeout(function() {
      safeUpdate();
    }, 10)
    $mdSidenav('left').toggle().then(function() {
      // redraw again as the first resize will sometimes produce a chart
      //  that's too small
      safeUpdate();
    });
  };

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
    var sampleData = bankAccount.createSampleData();
    bankAccount.loadTransactionData(sampleData);
    bankAccount.setCurrentBalance(3300);
    $scope.active = 'balance';
    updateCharts();
  };
});

var copyTransactionsToAngularScope;

