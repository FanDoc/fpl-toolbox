!function(){"use strict";angular.module("fpl-toolbox",["cfp.loadingBar","ui.router"])}(),function(){"use strict";function e(){return{templateUrl:"app/components/sortThDirective/sort-th.html",link:function(e,t,l){var a=t.children(),r=angular.element(a.children()[0]);a.data("js-table-th-order-id",l.colId),r.html(l.colName)}}}angular.module("fpl-toolbox").directive("sortTh",e)}(),function(){"use strict";function e(e,t,l){var a="https://jsonp.afeld.me/?url=http://m.fantasy.premierleague.com/drf/",r={teamStrengths:{che:5,mci:4,ars:4,mun:4,tot:4,liv:4,sou:3,swa:3,stk:3,cry:3,eve:3,whu:3,wba:2,lei:2,"new":2,sun:2,avl:2,bou:1,wat:1,nor:1},init:function(e){return r.fixtures?void e():(l.start(),void t.get(a+"bootstrap").success(function(o){r.players=o.elements,r.gameweek=o["next-event"],r.teams=o.teams,l.set(.6),t.get(a+"fixtures").success(function(t){r.fixtures=t,l.complete(),e()})}))}};return r}angular.module("fpl-toolbox").service("plResource",e),e.$inject=["$log","$http","cfpLoadingBar"]}(),function(){"use strict";function e(){return{require:"ngModel",link:function(e,t,l,a){a.$parsers.push(function(e){return parseInt(e,10)}),a.$formatters.push(function(e){return""+e})}}}angular.module("fpl-toolbox").directive("convertToNumber",e)}(),function(){"use strict";function e(e){function t(){e.init(function(){o.players=e.players,o.gameweek=e.gameweek,o.teams=_.sortBy(e.teams,"team"),_.forEach(o.teams,function(e){e.selected=!0}),_.forEach(o.players,function(e){e.points_per_pound=e.total_points/e.now_cost*10,e.ppg_per_pound=e.points_per_game/e.now_cost*10,e.cost=e.now_cost/10}),a()})}function l(e){var t=angular.element(e.currentTarget),l=t.data("js-table-th-order-id");o.orderReverse=o.orderPredicate!==l||!o.orderReverse,o.orderPredicate=l,t.parent().parent().children().children().children().removeClass("glyphicon glyphicon-sort-by-order-alt glyphicon-sort-by-order"),angular.element(t.children()[1]).addClass("glyphicon").addClass(o.orderReverse?"glyphicon-sort-by-order-alt":"glyphicon-sort-by-order")}function a(){o.playersToShow=o.players,_.forEach(o.playerFilters.applyOrder,function(e){"function"==typeof o.playerFilters[e]&&(o.playersToShow=_.filter(o.playersToShow,o.playerFilters[e],o.playerFilters))})}function r(){o.playerFilters.healthy=!0,o.playerFilters.maxCost=15,o.playerFilters.minutes=1e3,_.forEach(o.teams,function(e){e.selected=!0}),a()}var o=this;o.players=[],o.gameweek=0,o.teams=[],o.playersToShow=[],o.showFilters=!0,o.orderPredicate="ppg_per_pound",o.orderReverse=!0,o.playerFilters={healthy:!0,position:1,maxCost:15,minutes:1e3,applyOrder:["positionOnly","healthyOnly","minutesOnly","priceOnly","teamOnly"],healthyOnly:function(e){return!this.healthy||"a"===e.status},minutesOnly:function(e){return e.minutes>=this.minutes},positionOnly:function(e){return e.element_type===this.position},teamOnly:function(e){return!o.teams||o.teams[e.team-1].selected},priceOnly:function(e){return e.cost<=this.maxCost}},o.orderPlayers=l,o.filter=a,o.resetFilters=r,t()}angular.module("fpl-toolbox").controller("PlayersController",e),e.$inject=["plResource"]}(),function(){"use strict";function e(e){function t(){e.init(function(){s.players=e.players,s.teams=e.teams,_.forEach(s.teams,function(t){t.strength=e.teamStrengths[t.short_name.toLowerCase()]}),s.gameweek=e.gameweek,s.fixtures=e.fixtures,o()})}function l(e){var t="";return _.each(e.fixtures,function(e){t+=e.code+e.homeaway+" "}),t}function a(e){var t=0;return _.each(e.fixtures,function(e){t+=s.teams[e.id-1][s.matchDifficultyDecider],e.home||(t+=t*s.addAwayGameDifficulty/100)}),t}function r(){_.each(s.teams,function(e){e.fixturesDifficulty=a(e)})}function o(){_.forEach(s.teams,function(e){e.fixtures=[]});var e=_.filter(s.fixtures,function(e){return e.event>=s.gameweek&&e.event<s.gameweek+s.amountOfFixtures});_.forEach(e,function(e){s.teams[e.team_h-1].fixtures.push({id:e.team_a,code:s.teams[e.team_a-1].short_name,name:s.teams[e.team_a-1].name,homeaway:"(H)",home:!0}),s.teams[e.team_a-1].fixtures.push({id:e.team_h,code:s.teams[e.team_h-1].short_name,name:s.teams[e.team_h-1].name,homeaway:"(A)",home:!1})}),r()}var s=this;s.players=[],s.gameweek=0,s.teams=[],s.fixtures=[],s.addAwayGameDifficulty=25,s.amountOfFixtures=6,s.matchDifficultyDecider="strength",s.getFixturesText=l,s.updateFixturesDifficulty=r,s.addFixturesToTeams=o,t()}angular.module("fpl-toolbox").controller("FixturesController",e),e.$inject=["plResource"]}(),function(){"use strict";function e(e,t){e.state("fixtures",{url:"/",templateUrl:"app/fixtures/fixtures.html",controller:"FixturesController",controllerAs:"fix"}).state("players",{url:"/players",templateUrl:"app/players/players.html",controller:"PlayersController",controllerAs:"pla"}).state("team",{url:"/team",templateUrl:"app/players/team-builder.html",controller:"PlayersController",controllerAs:"pla"}),t.otherwise("/")}angular.module("fpl-toolbox").config(e),e.$inject=["$stateProvider","$urlRouterProvider"]}(),function(){"use strict";angular.module("fpl-toolbox").constant("_",window._)}(),angular.module("fpl-toolbox").run(["$templateCache",function(e){e.put("app/fixtures/fixtures.html",'<div class="panel panel-default"><div class="panel-heading"><form class="form-horizontal"><div class="form-group"><label class="col-sm-2 control-label">Fixtures amount</label><div class="col-sm-10"><input class="form-control" max="10" min="1" ng-change="fix.addFixturesToTeams()" ng-model="fix.amountOfFixtures" type="number"></div></div><div class="form-group"><label class="col-sm-2 control-label">Away games are more difficult by</label><div class="col-sm-10"><div class="input-group"><input class="form-control" max="100" min="0" ng-model="fix.addAwayGameDifficulty" ng-change="fix.updateFixturesDifficulty()" type="number"><div class="input-group-addon">%</div></div></div></div></form></div><table class="table table-hover"><tr><th></th><th>Team</th><th>Points</th><th>Form</th><th>Strength</th><th>Fixtures</th><th>Fixtures difficulty</th></tr><tr ng-repeat="team in fix.teams | orderBy: \'fixturesDifficulty\'"><td><span class="clublogo logo{{team.id}}"></span></td><td>{{ team.name }}</td><td>{{ team.points }}</td><td>{{ team.form }}</td><td><input class="form-control" max="10" min="0" ng-model="team.strength" ng-blur="fix.updateFixturesDifficulty()" style="width: auto" type="number"></td><td>{{ fix.getFixturesText(team) }}</td><td>{{ team.fixturesDifficulty | number:2 }}</td></tr></table></div>'),e.put("app/players/players.html",'<div class="panel panel-default"><div class="panel-heading" ng-show="pla.showFilters"><form class="form-horizontal"><div class="form-group"><div class="col-sm-offset-2 col-sm-10"><div class="checkbox"><label><input ng-change="pla.filter()" ng-model="pla.playerFilters.healthy" type="checkbox"> Show only available players (doubtful, unavailable or injured are out)</label></div></div></div><div class="form-group"><label class="col-sm-2 control-label">Position</label><div class="col-sm-10"><select class="form-control" convert-to-number="" ng-change="pla.filter()" ng-model="pla.playerFilters.position"><option value="1">Goalkeepers</option><option value="2">Defenders</option><option value="3">Midfielders</option><option value="4">Attackers</option></select></div></div><div class="form-group"><label class="col-sm-2 control-label">Minimum minutes</label><div class="col-sm-10"><input class="form-control" max="3420" min="0" ng-change="pla.filter()" ng-model="pla.playerFilters.minutes" type="number"></div></div><div class="form-group"><label class="col-sm-2 control-label">Maximum cost</label><div class="col-sm-10"><input class="form-control" max="15" min="4" ng-change="pla.filter()" ng-model="pla.playerFilters.maxCost" type="number"></div></div><div class="form-group"><label class="col-sm-2 control-label">Include teams</label><div class="col-sm-10"><ul class="list-inline list-unstyled"><li ng-repeat="team in pla.teams" class="col-sm-2"><input ng-change="pla.filter()" ng-model="team.selected" type="checkbox"> {{team.short_name}}</li></ul></div></div></form></div><div class="panel-body pull-right"><a href="" ng-click="pla.resetFilters()">reset filters</a> <span class="glyphicon glyphicon-refresh"></span> <span ng-show="pla.showFilters"><a href="" ng-click="pla.showFilters = false">hide</a> <span class="glyphicon glyphicon-menu-up"></span></span> <span ng-show="!pla.showFilters"><a href="" ng-click="pla.showFilters = true">show filters</a> <span class="glyphicon glyphicon-menu-down"></span></span></div><table class="table table-hover"><tr><th></th><th>Name</th><th>Status</th><th col-id="total_points" col-name="Total points" sort-th=""></th><th col-id="cost" col-name="Cost" sort-th=""></th><th col-id="points_per_game" col-name="Points per game" sort-th=""></th><th col-id="points_per_pound" col-name="Points per pound" sort-th=""></th><th col-id="ppg_per_pound" col-name="Points per game per pound" sort-th=""></th><th col-id="minutes" col-name="Minutes" sort-th=""></th></tr><tr ng-repeat="player in pla.playersToShow | orderBy:pla.orderPredicate:pla.orderReverse"><td><span class="clublogo logo{{player.team}}"></span></td><td>{{ player.first_name }} {{ player.second_name}}</td><td>{{ player.status }}</td><td>{{ player.total_points }}</td><td>{{ player.cost }}</td><td>{{ player.points_per_game }}</td><td>{{ player.points_per_pound | number:2 }}</td><td>{{ player.ppg_per_pound | number:2 }}</td><td>{{ player.minutes }}</td></tr></table></div>'),e.put("app/players/team-builder.html","<h1>team builder todo</h1>"),e.put("app/components/sortThDirective/sort-th.html",'<th><div ng-click="pla.orderPlayers($event)" class="table-th-order" js-table-th-order-id=""><span class="js-table-th-order-name"></span> <span></span></div></th>')}]);