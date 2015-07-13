(function() {
  'use strict';

  angular
    .module('fpl-toolbox')
    .directive('convertToNumber', convertToNumber);

  /** @ngInject */
  function convertToNumber() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function(val) {
          return parseInt(val, 10);
        });
        ngModel.$formatters.push(function(val) {
          return '' + val;
        });
      }
    };
  }

})();
