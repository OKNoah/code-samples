'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.renameColumn('Threads', 'part_id', 'doc_id');
    queryInterface.renameColumn('Examples', 'part_id', 'doc_id');
    queryInterface.renameColumn('Versions', 'part_id', 'doc_id');
    queryInterface.renameColumn('Parts', 'type_id', 'category_id');
    queryInterface.addColumn('Parts', 'docset_id', Sequelize.INTEGER);
    queryInterface.dropTable('Types');
    queryInterface.renameTable('Parts', 'Docs');
    return;
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.addColumn('Parts', 'type_id', Sequelize.INTEGER);
    queryInterface.removeColumn('Parts', 'category_id');
    queryInterface.removeColumn('Parts', 'docset_id');
    queryInterface.createTable('Types', {
      slug: {
        type: Sequelize.STRING,
        allowNull: false
      }
    }, {
      indexes: [{ unique: true, fields: ['slug', 'docset_id'] }]
    });
  }
};
