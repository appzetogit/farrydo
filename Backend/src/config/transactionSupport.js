import mongoose from 'mongoose';

/**
 * Lets the code's transactions run on a standalone mongod.
 *
 * Multi-document transactions need a replica set or mongos. Production runs a
 * single standalone mongod, where `startTransaction` succeeds but the first
 * write inside it fails with "Transaction numbers are only allowed on a
 * replica set member or mongos" - which broke cash ride completion, wallet
 * top-ups, subscriptions, withdrawals and promo bookings.
 *
 * Sessions themselves work on a standalone server, so on one we keep handing
 * out real sessions and only make the transaction calls no-ops: every write
 * then commits as it happens, as it would without the transaction. On a
 * replica set or mongos nothing changes.
 *
 * The cost on standalone is atomicity: a failure half way leaves the earlier
 * writes in place. Converting the server to a one-node replica set
 * (`--replSet rs0` + `rs.initiate()`) restores full transactions with no code
 * change.
 */

let transactionsSupported = true;

export const areTransactionsSupported = () => transactionsSupported;

const makeTransactionless = (session) => {
  session.startTransaction = () => {};
  session.commitTransaction = async () => {};
  session.abortTransaction = async () => {};
  session.withTransaction = async (fn) => fn(session);
  return session;
};

export const configureTransactionSupport = async (connection = mongoose.connection) => {
  const hello = await connection.db.admin().command({ hello: 1 });
  transactionsSupported = Boolean(hello.setName) || hello.msg === 'isdbgrid';

  if (transactionsSupported) {
    return true;
  }

  const wrap = (original) =>
    async function startSessionWithoutTransactions(...args) {
      const session = await original.apply(this, args);
      return makeTransactionless(session);
    };

  mongoose.startSession = wrap(mongoose.startSession.bind(mongoose));
  connection.startSession = wrap(connection.startSession.bind(connection));

  console.warn(
    'MongoDB is a standalone server: transactions are disabled and their writes run one by one. ' +
      'Run mongod as a replica set to restore them.',
  );
  return false;
};
