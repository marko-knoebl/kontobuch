"use strict";

/* jshint -W117 */

var myFinancesModule = angular.module('MyFinances', ['ngMaterial', 'ngMessages', 'md.data.table']);

// Angular setup

myFinancesModule.controller('MyFinancesCtrl', function($scope, $mdDialog, $mdMedia) {
  $scope.currentBalance = 0;
  $scope.csvImportConfig = konto.csvImportConfig;
  $scope.showNewAccountDialog = function(event, bank) {
    var controller;
    if (bank === 'bawagpsk') {
      controller = NewBawagpskAccountDialogController;
    } else if (bank === 'hellobank') {
      controller = NewHellobankAccountDialogController;
    } else if (bank === 'raiffeisen') {
      controller = NewRaiffeisenAccountDialogController;
    } else if (bank === 'paypal') {
      controller = NewPaypalAccountDialogController;
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
    readCSVandUpdateChart('bawagpsk', $mdDialog.hide);
  };
}

function NewHellobankAccountDialogController($scope, $mdDialog) {
  $scope.processOKClicked = function() {
    data.currentBalance = $scope.currentBalance;
    readCSVandUpdateChart('hellobank', $mdDialog.hide);
  };
}

function NewRaiffeisenAccountDialogController($scope, $mdDialog) {
  $scope.processOKClicked = function() {
    data.currentBalance = $scope.currentBalance;
    readCSVandUpdateChart('raiffeisen', $mdDialog.hide);
  };
}

function NewPaypalAccountDialogController($scope, $mdDialog) {
  $scope.processOKClicked = function() {
    data.currentBalance = $scope.currentBalance;
    readCSVandUpdateChart('paypal', $mdDialog.hide);
  };
}

var copyTransactionsToAngularScope;

myFinancesModule.controller('TransactionsTableCtrl', function($scope) {
  // based on:
  // https://github.com/daniel-nagy/md-data-table
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

  copyTransactionsToAngularScope = function() {
    $scope.transactions = bankAccount.transactions;
  };
})
