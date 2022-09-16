const { graphql } = require('@octokit/graphql');
const { REQUEST_HEADERS } = require('../common.js');
const { ORGANIZATION } = require('./fragments');

const query = `#graphql
  query($org: String!) {
    organization (login: $org) {
      ...organizationFields
    }
  }
  ${ORGANIZATION}
`;

module.exports = async function(org) {
  console.info(`${org} report - appending ${org} info`);
  let response = await graphql({query: query, ...REQUEST_HEADERS, org: org});
  return {...response.organization};
}
