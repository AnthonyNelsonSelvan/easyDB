function convertToMongoSchemaProperties(ownerSchemaDefinition) {
  const properties = {};
  const requiredFields = [];
  const uniqueFields = [];
  const nonUniqueFields = [];

  for (const fieldName in ownerSchemaDefinition) {
    const fieldConfig = ownerSchemaDefinition[fieldName];

    properties[fieldName] = {
      bsonType: fieldConfig.type,
    };

    if (fieldConfig.required) {
      requiredFields.push(fieldName);
    }

    if (fieldConfig.unique) {
      uniqueFields.push(fieldName);
    } else {
      nonUniqueFields.push(fieldName)
    }
  }

  return { properties, required: requiredFields, unique: uniqueFields, nonUnique: nonUniqueFields };
}

export default convertToMongoSchemaProperties;