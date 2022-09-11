const { graphql } = require('@octokit/graphql');
const { MAX_ORG_TEAMS_FETCH, REQUEST_HEADERS } = require('../common.js');
const { TEAM_CONNECTION } = require('./fragments.js');

const initialQuery = `#graphql
  query ($org: String!, $maxTeams: Int!) {
    organization (login: $org) {
      teams(first: $maxTeams, rootTeamsOnly: true) {
        ...teamConnectionFields
      }
    }
  }
  ${TEAM_CONNECTION}
`;

const followupQuery = `#graphql
  query ($org: String!, $maxTeams: Int!, $lastCursor: String!) {
    organization (login: $org) {
      teams(first: $maxTeams, rootTeamsOnly: true, after: $lastCursor) {
        ...teamConnectionFields
      }
    }
  }
  ${TEAM_CONNECTION}
`;

module.exports = async function(report) {
  console.info(`appending ${report.login} teams info`);
  return getOrganizationTeamsInfo(report);
};

async function getOrganizationTeamsInfo(report, query, args) {
  if (!('teams' in report)) {
    report.teams = [];
  }

  let response = await graphql({
    query: query ? query : initialQuery,
    org: report.login,
    maxTeams: MAX_ORG_TEAMS_FETCH,
    ...args,
    ...REQUEST_HEADERS,
  });


  response.organization.teams.edges
    .forEach(edge => {
      report.teams.push({
        name: edge.node.name,
        slug: edge.node.slug,
        url: edge.node.url
      });
    });

  if (!('teamsTotal' in report)) {
    report.teamsTotal = response.organization.teams.totalCount;
  }

  if (response.organization.teams.pageInfo.hasNextPage) {
    return getOrganizationTeamsInfo(
      report,
      followupQuery,
      { lastCursor: response.organization.teams.pageInfo.endCursor });
  }
  return report;
}
