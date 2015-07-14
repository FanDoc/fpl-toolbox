(function() {
  'use strict';

  angular
    .module('fpl-toolbox', ['cfp.loadingBar', 'ui.router']);

})();

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
  plResource.$inject = ["$log", "$http", "cfpLoadingBar"];

})();

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

(function() {
  'use strict';

  angular
    .module('fpl-toolbox')
    .controller('PlayersController', PlayersController);

  /** @ngInject */
  function PlayersController(plResource) {
    var pCtrl = this;
    pCtrl.players = [];
    pCtrl.gameweek = 0;
    pCtrl.teams = [];

    pCtrl.playersToShow = [];

    pCtrl.showFilters = true;
    pCtrl.orderPredicate = 'ppg_per_pound';
    pCtrl.orderReverse = true;

    pCtrl.playerFilters = {
      healthy: true,
      position: 1,
      maxCost: 15,
      minutes: 1000,

      applyOrder: ['positionOnly', 'healthyOnly', 'minutesOnly', 'priceOnly', 'teamOnly'],

      healthyOnly: function(p) {
        return !this.healthy || p.status === 'a';
      },
      minutesOnly: function(p) {
        return p.minutes >= this.minutes;
      },
      positionOnly: function(p) {
        return p.element_type === this.position;
      },
      teamOnly: function(p) {
        return !pCtrl.teams || pCtrl.teams[p.team-1].selected;
      },
      priceOnly: function(p) {
        return p.cost <= this.maxCost;
      }
    };

    // functions
    pCtrl.orderPlayers = orderPlayers;
    pCtrl.filter = filter;
    pCtrl.resetFilters = resetFilters;

    init();

    function init() {
      plResource.init(function() {
        pCtrl.players = plResource.players;
        pCtrl.gameweek = plResource.gameweek;
        pCtrl.teams = _.sortBy(plResource.teams, 'team');
        _.forEach(pCtrl.teams, function(t) {
          t.selected = true;
        });

        _.forEach(pCtrl.players, function(p) {
          p.points_per_pound = (p.total_points / p.now_cost) * 10;
          p.ppg_per_pound = (p.points_per_game / p.now_cost) * 10;
          p.cost = p.now_cost / 10;
        });

        filter(); // apply initial filter
      });
    }

    function orderPlayers($event) {
      var el = angular.element($event.currentTarget);
      var colId =  el.data('js-table-th-order-id');

      pCtrl.orderReverse = pCtrl.orderPredicate !== colId || !pCtrl.orderReverse;
      pCtrl.orderPredicate = colId;

      el.parent().parent().children().children().children()
        .removeClass('glyphicon glyphicon-sort-by-order-alt glyphicon-sort-by-order'); // TODO: this is very bad, in order not to add jQ, all ordering directive needs refacto (use scope + parent.scope)
      angular.element(el.children()[1]).addClass('glyphicon')
        .addClass(pCtrl.orderReverse ? 'glyphicon-sort-by-order-alt' : 'glyphicon-sort-by-order');
    }

    function filter() {
      pCtrl.playersToShow = pCtrl.players;
      _.forEach(pCtrl.playerFilters.applyOrder, function(filterName) {
        if (typeof pCtrl.playerFilters[filterName] === 'function') {
          pCtrl.playersToShow = _.filter(pCtrl.playersToShow, pCtrl.playerFilters[filterName], pCtrl.playerFilters);
        }
      });
    }

    function resetFilters() {
      pCtrl.playerFilters.healthy = true;
      pCtrl.playerFilters.maxCost = 15;
      pCtrl.playerFilters.minutes = 1000;
      _.forEach(pCtrl.teams, function(t) {
        t.selected = true;
      });

      filter();
    }

  }
  PlayersController.$inject = ["plResource"];
})();

(function() {
  'use strict';

  angular
    .module('fpl-toolbox')
    .controller('FixturesController', FixturesController);

  /** @ngInject */
  function FixturesController(plResource) {
    var fCtrl = this;
    fCtrl.players = [];
    fCtrl.gameweek = 0;
    fCtrl.teams = [];

    fCtrl.fixtures = [];

    fCtrl.addAwayGameDifficulty = 25;
    fCtrl.amountOfFixtures = 6;
    fCtrl.matchDifficultyDecider = 'strength'; //TODO: points, form

    // functions
    fCtrl.getFixturesText = getFixturesText;
    fCtrl.getFixturesDifficulty = getFixturesDifficulty;
    fCtrl.addFixturesToTeams = addFixturesToTeams;

    init();

    function init() {
      plResource.init(function() {
        fCtrl.players = plResource.players;
        fCtrl.teams = plResource.teams;
        _.forEach(fCtrl.teams, function(team) {
          team.strength = plResource.teamStrengths[team.short_name.toLowerCase()];
        });
        fCtrl.gameweek = plResource.gameweek;

        fCtrl.fixtures = plResource.fixtures;
        addFixturesToTeams();
      });
    }

    function getFixturesText(team) {
      var str = '';

      _.each(team.fixtures, function(match) {
        str += match.code + match.homeaway + ' ';
      });

      return str;
    }

    function getFixturesDifficulty(team) {
      var difficulty = 0;

      _.each(team.fixtures, function(match) {
        difficulty += fCtrl.teams[match.id - 1][fCtrl.matchDifficultyDecider];
        if (!match.home) {
          difficulty += difficulty * fCtrl.addAwayGameDifficulty / 100;
        }
      });

      return difficulty;
    }

    function addFixturesToTeams() {
      _.forEach(fCtrl.teams, function(team) {
        team.fixtures = [];
      });
      var nextXWeekMatches = _.filter(fCtrl.fixtures, function(match) {
        return match.event >= fCtrl.gameweek && match.event < fCtrl.gameweek + fCtrl.amountOfFixtures;
      });

      _.forEach(nextXWeekMatches, function(match) {
        fCtrl.teams[match.team_h - 1].fixtures.push({
          id: match.team_a,
          code: fCtrl.teams[match.team_a - 1].short_name,
          name: fCtrl.teams[match.team_a - 1].name,
          homeaway: '(H)',
          home: true
        });

        fCtrl.teams[match.team_a - 1].fixtures.push({
          id: match.team_h,
          code: fCtrl.teams[match.team_h - 1].short_name,
          name: fCtrl.teams[match.team_h - 1].name,
          homeaway: '(A)',
          home: false
        });
      });
    }

  }
  FixturesController.$inject = ["plResource"];
})();

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
  routeConfig.$inject = ["$stateProvider", "$urlRouterProvider"];

})();

(function() {
  'use strict';

  angular
    .module('fpl-toolbox')
    .constant('_', window._);

})();

angular.module("test").run(["$templateCache", function($templateCache) {$templateCache.put("app/fixtures/fixtures.html","<div class=\"panel panel-default\"><div class=\"panel-heading\"><form class=\"form-horizontal\"><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Fixtures amount</label><div class=\"col-sm-10\"><input class=\"form-control\" max=\"10\" min=\"1\" ng-change=\"fix.addFixturesToTeams()\" ng-model=\"fix.amountOfFixtures\" type=\"number\"></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Away games are more difficult by</label><div class=\"col-sm-10\"><div class=\"input-group\"><input class=\"form-control\" max=\"100\" min=\"0\" ng-model=\"fix.addAwayGameDifficulty\" type=\"number\"><div class=\"input-group-addon\">%</div></div></div></div></form></div><table class=\"table table-hover\"><tr><th></th><th>Team</th><th>Points</th><th>Form</th><th>Strength</th><th>Fixtures</th><th>Fixtures difficulty</th></tr><tr ng-repeat=\"team in fix.teams | orderBy: fix.getFixturesDifficulty:reverse\"><td><span class=\"clublogo logo{{team.id}}\"></span></td><td>{{ team.name }}</td><td>{{ team.points }}</td><td>{{ team.form }}</td><td><input class=\"form-control\" max=\"10\" min=\"0\" ng-model=\"team.strength\" style=\"width: auto\" type=\"number\"></td><td>{{ fix.getFixturesText(team) }}</td><td>{{ fix.getFixturesDifficulty(team) | number:2 }}</td></tr></table></div>");
$templateCache.put("app/players/players.html","<div class=\"panel panel-default\"><div class=\"panel-heading\" ng-show=\"pla.showFilters\"><form class=\"form-horizontal\"><div class=\"form-group\"><div class=\"col-sm-offset-2 col-sm-10\"><div class=\"checkbox\"><label><input ng-change=\"pla.filter()\" ng-model=\"pla.playerFilters.healthy\" type=\"checkbox\"> Show only available players (doubtful, unavailable or injured are out)</label></div></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Position</label><div class=\"col-sm-10\"><select class=\"form-control\" convert-to-number=\"\" ng-change=\"pla.filter()\" ng-model=\"pla.playerFilters.position\"><option value=\"1\">Goalkeepers</option><option value=\"2\">Defenders</option><option value=\"3\">Midfielders</option><option value=\"4\">Attackers</option></select></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Minimum minutes</label><div class=\"col-sm-10\"><input class=\"form-control\" max=\"3420\" min=\"0\" ng-change=\"pla.filter()\" ng-model=\"pla.playerFilters.minutes\" type=\"number\"></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Maximum cost</label><div class=\"col-sm-10\"><input class=\"form-control\" max=\"15\" min=\"4\" ng-change=\"pla.filter()\" ng-model=\"pla.playerFilters.maxCost\" type=\"number\"></div></div><div class=\"form-group\"><label class=\"col-sm-2 control-label\">Include teams</label><div class=\"col-sm-10\"><ul class=\"list-inline list-unstyled\"><li ng-repeat=\"team in pla.teams\" class=\"col-sm-2\"><input ng-change=\"pla.filter()\" ng-model=\"team.selected\" type=\"checkbox\"> {{team.short_name}}</li></ul></div></div></form></div><div class=\"panel-body pull-right\"><a href=\"\" ng-click=\"pla.resetFilters()\">reset filters</a> <span class=\"glyphicon glyphicon-refresh\"></span> <span ng-show=\"pla.showFilters\"><a href=\"\" ng-click=\"pla.showFilters = false\">hide</a> <span class=\"glyphicon glyphicon-menu-up\"></span></span> <span ng-show=\"!pla.showFilters\"><a href=\"\" ng-click=\"pla.showFilters = true\">show filters</a> <span class=\"glyphicon glyphicon-menu-down\"></span></span></div><table class=\"table table-hover\"><tr><th></th><th>Name</th><th>Status</th><th col-id=\"total_points\" col-name=\"Total points\" sort-th=\"\"></th><th col-id=\"cost\" col-name=\"Cost\" sort-th=\"\"></th><th col-id=\"points_per_game\" col-name=\"Points per game\" sort-th=\"\"></th><th col-id=\"points_per_pound\" col-name=\"Points per pound\" sort-th=\"\"></th><th col-id=\"ppg_per_pound\" col-name=\"Points per game per pound\" sort-th=\"\"></th><th col-id=\"minutes\" col-name=\"Minutes\" sort-th=\"\"></th></tr><tr ng-repeat=\"player in pla.playersToShow | orderBy:pla.orderPredicate:pla.orderReverse\"><td><span class=\"clublogo logo{{player.team}}\"></span></td><td>{{ player.first_name }} {{ player.second_name}}</td><td>{{ player.status }}</td><td>{{ player.total_points }}</td><td>{{ player.cost }}</td><td>{{ player.points_per_game }}</td><td>{{ player.points_per_pound | number:2 }}</td><td>{{ player.ppg_per_pound | number:2 }}</td><td>{{ player.minutes }}</td></tr></table></div>");
$templateCache.put("app/players/team-builder.html","<h1>team builder todo</h1>");
$templateCache.put("app/components/sortThDirective/sort-th.html","<th><div ng-click=\"pla.orderPlayers($event)\" class=\"table-th-order\" js-table-th-order-id=\"\"><span class=\"js-table-th-order-name\"></span> <span></span></div></th>");}]);