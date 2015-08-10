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
      minutes: 0,

      applyOrder: ['positionOnly', 'healthyOnly', 'minutesOnly', 'priceOnly', 'teamOnly'],

      healthyOnly: function(p) {
        return !this.healthy || p.status === 'a';
      },
      minutesOnly: function(p) {
        return p.minutes >= this.minutes;
      },
      positionOnly: function(p) {
        return this.position === 0 || p.element_type === this.position;
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
          p.selected_by_percent = parseFloat(p.selected_by_percent);
          p.points_per_game = parseFloat(p.points_per_game);
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
      pCtrl.playerFilters.minutes = 0;
      _.forEach(pCtrl.teams, function(t) {
        t.selected = true;
      });

      filter();
    }

  }
})();
