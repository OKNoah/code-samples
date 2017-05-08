'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Parts', 'docset_id');
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('Parts', 'docset_id', Sequelize.INTEGER);
  }
};
