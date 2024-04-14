import db, { pgp } from "../connection.js";

const Sql = {
  CREATE: "INSERT INTO games (creator_id, description) VALUES ($1, $2) RETURNING id",
  UPDATE_DESCRIPTION: "UPDATE games SET description=$1 WHERE id=$2 RETURNING description",
  ADD_PLAYER: "INSERT INTO game_users (game_id, user_id, seat) VALUES ($1, $2, $3)",
  IS_PLAYER_IN_GAME:
    "SELECT * FROM game_users WHERE game_users.game_id=$1 AND game_users.user_id=$2",
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
    AND users.id != $[user_id]
    ORDER BY games.id
    LIMIT $[limit]
    OFFSET $[offset]
  `,
  SHUFFLED_DECK: "SELECT *, random() AS rand FROM standard_deck_cards ORDER BY rand",
  ASSIGN_CARDS: "UPDATE game_cards SET user_id=$1 WHERE game_id=$2 AND user_id=-1",
  GET_CARDS: `
    SELECT * FROM game_cards, standard_deck_cards
    WHERE game_cards.game_id=$1 AND game_cards.card_id=standard_deck_cards.id
    ORDER BY game_cards.card_order`,
};

const create = async (creatorId, gameDescription) => {
  try {
    const { id, description } = await db.one(Sql.CREATE, [
      creatorId,
      gameDescription || "placeholder",
      1,
    ]);

    let finalDescription = description;
    if (gameDescription === undefined || gameDescription.length === 0) {
      finalDescription = (await db.one(Sql.UPDATE_DESCRIPTION, [`Game ${id}`, id])).description;
    }

    await db.none(Sql.ADD_PLAYER, [id, creatorId, 1]);

    await initialize(id, creatorId);

    return { id, description: finalDescription };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const get = async (gameId) => {
  const [game, users, cards] = await Promise.all([
    db.one(Sql.GET_GAME, [gameId]),
    db.any(Sql.GET_USERS, [gameId]),
    db.any(Sql.GET_CARDS, [gameId]),
  ]);

  // We may not have a second user yet
  const playerOneCards = cards.filter((card) => card.user_id === users[0].id);

  const userData = [
    {
      ...users[0],
      cards: playerOneCards,
      cardCount: playerOneCards.length,
    },
  ];

  if (users.length === 2) {
    const playerTwoCards = cards.filter((card) => card.user_id === users[1].id);

    userData.push({
      ...users[1],
      cards: playerTwoCards,
      cardCount: playerTwoCards.length,
    });
  }

  return {
    ...game,
    users: userData,
  };
};

const available = async (user_id, game_id_start = 0, limit = 10, offset = 0) => {
  const games = await db.any(Sql.GET_AVAILABLE, {
    user_id,
    game_id_start,
    limit,
    offset,
  });

  return games;
};

const join = async (gameId, userId) => {
  // This will throw if the user is in the game since I have chosen the `none` method:
  await db.none(Sql.IS_PLAYER_IN_GAME, [gameId, userId]);

  await db.none(Sql.ADD_PLAYER, [gameId, userId, 2]);
  await db.none(Sql.ASSIGN_CARDS, [userId, gameId]);
};

const initialize = async (gameId, creatorId) => {
  const deck = await db.any(Sql.SHUFFLED_DECK);

  const columns = new pgp.helpers.ColumnSet(["user_id", "game_id", "card_id", "card_order"], {
    table: "game_cards",
  });
  const values = deck.map(({ id }, index) => ({
    user_id: index % 2 === 0 ? creatorId : -1,
    game_id: gameId,
    card_id: id,
    card_order: Math.floor(index / 2),
  }));

  const query = pgp.helpers.insert(values, columns);

  await db.none(query);
};

export default {
  create,
  get,
  available,
  join,
};
