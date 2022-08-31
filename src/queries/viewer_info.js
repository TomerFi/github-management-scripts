const { graphql } = require('@octokit/graphql');
const { REQUEST_HEADERS } = require('../common.js');
const { USER } = require('./fragments.js');

module.exports = getViewerInfo;

async function getViewerInfo() {
  let query = `#graphql
    {
      viewer {
        ...userFields
      }
    }
    ${USER}
  `;

  let response = await graphql(query, REQUEST_HEADERS);

  return {...response.viewer}
}
