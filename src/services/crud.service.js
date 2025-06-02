export const createCRUD = ({ GET, FROM }) => {
  const access = (client, collectionName, db) => client.db(db).collection(collectionName);
  return {
    getAll: async (client) => {
      const result = await access(client, GET, FROM).find({}).toArray();
      return result.reduce((obj, item) => {
        obj[item._id] = item;
        return obj;
      }, {});
    },
    get: async (client, data) => {
      return await access(client, GET, FROM).findOne({ _id: data });
    },
    insert: async (client, data) => {
      return await access(client, GET, FROM).insertOne(data);
    },
    update: async (client, ID, data) => {
      return await access(client, GET, FROM).updateOne({ _id: ID }, { $set: data });
    },
    delete: async (client, data) => {
      return await access(client, GET, FROM).deleteOne({ _id: data });
    },
  };
};