import argon2 from "argon2";

async function hashFields(data, schema) {
  const definition = schema.schemaDefinitionId.definition;

  for (const key in definition) {
    if (definition[key].hash === true && data[key]) {
      data[key] = await argon2.hash(data[key])
    }
  }
  return data;
}


async function hashFieldsForMany(docs, schema) {
  const definition = schema.schemaDefinitionId.definition;

  for (const doc of docs) {
    for (const key in definition) {
      if (definition[key].hash === true && doc[key]) {
        doc[key] = await argon2.hash(doc[key]);
      }
    }
  }

  return docs; 
}

async function handleVerifyHash(hashedText, text) {
    const result = await argon2.verify(hashedText, text)
    return result;
}

export {hashFields,hashFieldsForMany};