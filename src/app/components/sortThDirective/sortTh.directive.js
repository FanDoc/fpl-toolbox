(function() {
  'use strict';

  angular
    .module('fpl-toolbox')
    .directive('sortTh', sortThDirective);

  /** @ngInject */
  function sortThDirective() {
    return {
      templateUrl: 'app/components/sortThDirective/sort-th.html',
      link: function(scope, element, attrs) {
        var sortDiv = element.children();
        var colNameSpan = angular.element(sortDiv.children()[0]);
        
        sortDiv.data('js-table-th-order-id', attrs.colId);
        colNameSpan.html(attrs.colName);
      }
    };
  }

})();
