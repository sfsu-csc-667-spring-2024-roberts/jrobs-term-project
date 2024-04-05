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

export default {
  create,
  get,
};
