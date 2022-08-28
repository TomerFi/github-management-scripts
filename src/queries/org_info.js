const { graphql } = require('@octokit/graphql');
const { REQUEST_PARAMS } = require('../common.js');

module.exports = wrapper;

async function wrapper(org) {
  return getOrganizationInfo(org, {});
}

async function getOrganizationInfo(org, report) {
  let query = `
    {
      organization (login: "${org}") {
        email
        isVerified
        location
        login
        name
        requiresTwoFactorAuthentication
        url
      }
    }
  `;

  let result = await graphql(query, REQUEST_PARAMS);

  report.info = {...result}

  return report;
}
