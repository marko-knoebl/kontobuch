(function() {
  "use strict";

  // TODO: remove references to the global variable 'categories'
  // and use this instead:
  //konto.BankAccount.prototype.categories = categories;

  // use the same keywords for all accounts for now
  konto.BankAccount.prototype.updateCategorizationKeywords = function() {
    konto.BankAccount.prototype.categorizationKeywords = {};
    categories.forEach(function(category) {
      category.keywords.forEach(function(keyword) {
        konto.BankAccount.prototype.categorizationKeywords[keyword] = category.name;
      });
    });
  };

  /**
   * Add a "category" attribute to all transactions
   */
  konto.BankAccount.prototype.categorizeTransactions = function() {
    bankAccount.updateCategorizationKeywords();
    for (var i = 0; i < bankAccount.transactions.length; i ++) {
      var transaction = bankAccount.transactions[i];
      transaction.category = undefined;
      for (var keyword in bankAccount.categorizationKeywords) {
        var regex = new RegExp(keyword, 'i');
        if (transaction.details.search(regex) > -1) {
          transaction.category = transaction.category || bankAccount.categorizationKeywords[keyword];
          break;
        }
      }
      if (transaction.category === undefined) {
        transaction.category = transaction.amount > 0 ? 'income' : 'expenses';
      }
    }
  };

  var categoriesByName = {};
  categories.forEach(function(category) {
    categoriesByName[category.name] = category;
  });
  konto.BankAccount.prototype.categoriesByName = categoriesByName;

  // build a structure where every category has references to its children
  categories.forEach(function(category) {
    category.children = [];
  });
  categories.forEach(function(category) {
    if (category.parent) {
      categories.forEach(function(potentialParent) {
        if (category.parent === potentialParent.name) {
          potentialParent.children.push(category);
          return;
        }
      });
    }
  });

})();
