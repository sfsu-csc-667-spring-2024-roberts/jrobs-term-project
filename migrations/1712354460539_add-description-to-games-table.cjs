/* eslint-disable camelcase */

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.addColumn("games", {
    description: {
      type: "varchar(100)",
      notNull: true,
      default: "placeholder",
    },
  });
  // This field snuck in from a copy and paste error, so removing it until we need it
  pgm.dropColumn("games", "game_socket_id");
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropColumn("games", "description");
  pgm.addColumn("games", {
    game_socket_id: {
      type: "varchar",
      notNull: true,
    },
  });
};
