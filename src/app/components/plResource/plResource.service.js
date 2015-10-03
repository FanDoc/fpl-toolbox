(function() {
  'use strict';

  angular
    .module('fpl-toolbox')
    .service('plResource', plResource);

  /** @ngInject */
  function plResource($log, $http, cfpLoadingBar) {
    var jsonpProxy = 'https://jsonp.afeld.me/?url=';
    var api = jsonpProxy + 'http://m.fantasy.premierleague.com/drf/';

    var service = {
      teamStrengths: {
        che: 3,
        mci: 5,
        ars: 4,
        mun: 5,
        tot: 4,
        liv: 4,
        sou: 3,
        swa: 3,
        stk: 2,
        cry: 3,
        eve: 4,
        whu: 4,
        wba: 2,
        lei: 3,
        new: 1,
        sun: 1,
        avl: 1,
        bou: 2,
        wat: 2,
        nor: 2
      },
      init: function(callback) {
        if (service.fixtures && service.table) {
          callback();
          return;
        }
        cfpLoadingBar.start();
        $http.get(api + 'bootstrap')
          .success(function(data) {
            service.players = data.elements;
            service.gameweek = data['next-event'];
            service.teams = data.teams;

            if(!service.gameweek) {
              alert('Could not load data. Either Premier League or our proxy is having difficulties. Try again later!');
              cfpLoadingBar.complete();
              return false;
            }

            cfpLoadingBar.set(0.4);

            $http.get(api + 'fixtures')
              .success(function(data) {
                service.fixtures = data;

                if(!service.fixtures) {
                  alert('Could not load data. Either Premier League or our proxy is having difficulties. Try again later!');
                  cfpLoadingBar.complete();
                  return false;
                }

                cfpLoadingBar.set(0.7);

                var leagueTable = 'http://live.premierleague.com/syndicationdata/competitionId=8/seasonId=2015/matchDayId='+service.gameweek+'/league-table.json';

                $http.get(jsonpProxy+leagueTable)
                  .success(function(data) {
                    service.table = data.Data;

                    if(!service.table) {
                      alert('Could not load data. Either Premier League or our proxy is having difficulties. Try again later!');
                      cfpLoadingBar.complete();
                      return false;
                    }

                    cfpLoadingBar.complete();

                    callback();
                  });
              });
          });
      }
    };

    return service;
  }

})();
