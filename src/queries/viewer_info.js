const { graphql } = require('@octokit/graphql');
const { REQUEST_PARAMS } = require('../common.js');

module.exports = getViewerInfo;

async function getViewerInfo() {
  let query = `
    {
      viewer {
        name
        login
      }
    }
  `;

  let result = await graphql(query, REQUEST_PARAMS);

  return {...result.viewer}
}
