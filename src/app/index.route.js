(function() {
  'use strict';

  angular
    .module('fpl-toolbox')
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('fixtures', {
        url: '/',
        templateUrl: 'app/fixtures/fixtures.html',
        controller: 'FixturesController',
        controllerAs: 'fix'
      })
      .state('players', {
        url: '/players',
        templateUrl: 'app/players/players.html',
        controller: 'PlayersController',
        controllerAs: 'pla'
      })
      .state('team', {
        url: '/team',
        templateUrl: 'app/players/team-builder.html',
        controller: 'PlayersController',
        controllerAs: 'pla'
      });

    $urlRouterProvider.otherwise('/');
  }

})();
