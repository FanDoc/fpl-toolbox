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
    //fCtrl.getFixturesDifficulty = getFixturesDifficulty;
    fCtrl.updateFixturesDifficulty = updateFixturesDifficulty;
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
        updateFixturesDifficulty();
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

    function updateFixturesDifficulty() {
      _.each(fCtrl.teams, function(team) {
        team.fixturesDifficulty = getFixturesDifficulty(team);
      });
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
})();
