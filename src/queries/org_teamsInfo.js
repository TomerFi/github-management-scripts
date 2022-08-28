const { graphql } = require('@octokit/graphql');
const { MAX_ORG_TEAMS_FETCH, REQUEST_PARAMS } = require('../common.js');

module.exports = wrapper;

async function wrapper(org, report) {
  return getOrganizationTeamsInfo(org, report, `first: ${MAX_ORG_TEAMS_FETCH}`);
}

async function getOrganizationTeamsInfo(org, report, teams) {
  if (!('teams' in report)) {
    report.teams = [];
  }
  if (!('info' in report)) {
    report.info.teams = 0;
  } else {
    if (!('teams' in report.info)) {
      report.info.teams = 0;
    }
  }
  let query = `
    {
      organization (login: "${org}") {
        teams(${teams}, rootTeamsOnly: true) {
          edges {
            node {
              name
              slug
              url
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
          totalCount
        }
      }
    }
  `;

  let result = await graphql(query, REQUEST_PARAMS);

  result.organization.teams.edges
    .forEach(edge => {
      report.teams.push({
        name: edge.node.name,
        slug: edge.node.slug,
        url: edge.node.url
      });
    });

  report.info.teams = result.organization.teams.totalCount;

  if (result.organization.teams.pageInfo.hasNextPage) {
    return getOrganizationTeamsInfo(
      org,
      report,
      `first: ${MAX_ORG_TEAMS_FETCH}, after: "${result.organization.teams.pageInfo.endCursor}"`)
  }
  return report;
}
