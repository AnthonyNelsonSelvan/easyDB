
async function populateLookup(db, mainCollection, match, from, localField, foreignField, as) {
  const result = await db.collection(mainCollection).aggregate([
    { $match: match },
    {
      $lookup: {
        from,           // related collection
        localField,     // local key
        foreignField,   // foreign key
        as              // output field
      }
    },
    {
      $unwind: {
        path: `$${as}`,
        preserveNullAndEmptyArrays: true // keeps docs even if no match found
      }
    }
  ]).toArray();

  return result;
}
