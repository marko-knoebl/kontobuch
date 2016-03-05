"use strict";

/* jshint -W117 */

var myFinancesModule = angular.module('MyFinances', ['ngMaterial', 'ngMessages']);

// Angular setup

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
