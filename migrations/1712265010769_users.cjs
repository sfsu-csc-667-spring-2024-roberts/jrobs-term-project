/* eslint-disable camelcase */

const TABLE_NAME = "users";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(TABLE_NAME, {
    id: "id",
    email: {
      type: "varchar(256)",
      notNull: true,
      unique: true,
    },
    password: {
      type: "char(60)",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(TABLE_NAME);
};
