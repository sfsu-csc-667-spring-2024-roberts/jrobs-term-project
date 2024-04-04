/* eslint-disable camelcase */

const TABLE_NAME = "game_cards";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(TABLE_NAME, {
    user_id: {
      type: "int",
    },
    game_id: {
      type: "int",
    },
    card_id: {
      type: "int",
    },
    card_order: {
      type: "int",
    },
  });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(TABLE_NAME);
};
