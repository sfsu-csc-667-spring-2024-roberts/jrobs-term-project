/* eslint-disable camelcase */

const TABLE_NAME = "standard_deck_cards";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(TABLE_NAME, {
    id: "id",
    suit: {
      type: "int",
    },
    value: {
      type: "int",
    },
  });

  const sql = `INSERT INTO ${TABLE_NAME} (suit, value) VALUES`;
  const values = [];

  for (let suit = 0; suit < 4; suit++) {
    for (let value = 1; value <= 13; value++) {
      values.push(`(${suit}, ${value})`);
    }
  }

  const query = `${sql} ${values.join(",")}`;

  pgm.sql(query);
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(TABLE_NAME);
};
