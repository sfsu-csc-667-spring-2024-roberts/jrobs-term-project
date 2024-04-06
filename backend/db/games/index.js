import db from "../connection.js";

const Sql = {
  CREATE:
    "INSERT INTO games (creator_id, description) VALUES ($1, $2) RETURNING id",
  UPDATE_DESCRIPTION: "UPDATE games SET description=$1 WHERE id=$2",
  ADD_PLAYER:
    "INSERT INTO game_users (game_id, user_id, seat) VALUES ($1, $2, $3)",
  GET_GAME: "SELECT * FROM games WHERE id=$1",
  GET_USERS:
    "SELECT users.id, users.email, users.gravatar, game_users.seat FROM users, game_users, games WHERE games.id=$1 AND game_users.game_id=games.id AND game_users.user_id=users.id ORDER BY game_users.seat",
  GET_AVAILABLE: `
    SELECT games.*, users.email, users.gravatar FROM games
    INNER JOIN (
        SELECT game_users.game_id
        FROM game_users GROUP BY game_id
        HAVING COUNT(*) < 2
    ) AS temp ON games.id=temp.game_id
    LEFT JOIN users ON users.id=games.creator_id
    WHERE games.id > $[game_id_start]
    ORDER BY games.id
    LIMIT $[limit]
    OFFSET $[offset]
  `,
};

const create = async (creatorId, description) => {
  try {
    const { id } = await db.one(Sql.CREATE, [
      creatorId,
      description || "placeholder",
      1,
    ]);

    if (description === undefined || description.length === 0) {
      await db.none(Sql.UPDATE_DESCRIPTION, [`Game ${id}`, id]);
    }

    await db.none(Sql.ADD_PLAYER, [id, creatorId, 1]);

    return id;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const get = async (gameId) => {
  // We could use a join, but it gets nasty quickly
  const game = await db.one(Sql.GET_GAME, [gameId]);
  const users = await db.any(Sql.GET_USERS, [gameId]);

  return {
    ...game,
    users,
  };
};

const available = async (game_id_start = 0, limit = 10, offset = 0) => {
  const games = await db.any(Sql.GET_AVAILABLE, {
    game_id_start,
    limit,
    offset,
  });

  return games;
};

export default {
  create,
  get,
  available,
};
