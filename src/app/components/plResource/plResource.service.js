(function() {
  'use strict';

  angular
    .module('fpl-toolbox')
    .service('plResource', plResource);

  /** @ngInject */
  function plResource($log, $http, cfpLoadingBar) {
    var api = 'https://jsonp.afeld.me/?url=http://m.fantasy.premierleague.com/drf/';

    var service = {
      teamStrengths: {
        che: 5,
        mci: 4,
        ars: 4,
        mun: 4,
        tot: 4,
        liv: 4,
        sou: 3,
        swa: 3,
        stk: 3,
        cry: 3,
        eve: 3,
        whu: 3,
        wba: 2,
        lei: 2,
        new: 2,
        sun: 2,
        avl: 2,
        bou: 1,
        wat: 1,
        nor: 1
      },
      init: function(callback) {
        if (service.fixtures) {
          callback();
          return;
        }
        cfpLoadingBar.start();
        $http.get(api + 'bootstrap')
          .success(function(data) {
            service.players = data.elements;
            service.gameweek = data['next-event'];
            service.teams = data.teams;

            cfpLoadingBar.set(0.6);

            $http.get(api + 'fixtures')
              .success(function(data) {
                service.fixtures = data;
                cfpLoadingBar.complete();
                callback();
              });
          });
      }
    };

    return service;
  }

})();
