const filterUpdateData = (fields, reqBody) => {
  let filteredObj = {};

  for (let key in reqBody) {
    if (!fields.includes(key)) filteredObj[key] = reqBody[key];
  }
  return filteredObj;
};
module.exports = filterUpdateData;
