(function() {
  "use strict";

  // use the same keywords for all accounts for now
  konto.BankAccount.prototype.categorizationKeywords = {};
  categories.forEach(function(category) {
    category.keywords.forEach(function(keyword) {
      konto.BankAccount.prototype.categorizationKeywords[keyword] = category.name;
    });
  });

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
