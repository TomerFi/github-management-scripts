const { graphql } = require('@octokit/graphql');
const { MAX_ORG_MEMBERS_FETCH, REQUEST_PARAMS } = require('../common.js');

module.exports = wrapper;

async function wrapper(org, report) {
  return getOrganizationMembersInfo(org, report, `first: ${MAX_ORG_MEMBERS_FETCH}`);
}

async function getOrganizationMembersInfo(org, report, members) {
  if (!('members' in report)) {
    report.members = [];
  }
  if (!('info' in report)) {
    report.info.members = 0;
  } else {
    if (!('members' in report.info)) {
      report.info.members = 0;
    }
  }
  let query = `
    {
      organization (login: "${org}") {
        membersWithRole(${members}) {
          edges {
            hasTwoFactorEnabled
            node {
              name
              url
            }
            role
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

  result.organization.membersWithRole.edges
    .forEach(edge => {
      report.members.push({
        name: edge.node.name,
        hasTwoFactorEnabled: edge.hasTwoFactorEnabled,
        role: edge.role,
        url: edge.node.url
      });
    });

  report.info.members += result.organization.membersWithRole.totalCount;

  if (result.organization.membersWithRole.pageInfo.hasNextPage) {
    return getOrganizationMembersInfo(
      org,
      report,
      `first: ${MAX_ORG_MEMBERS_FETCH}, after: "${result.organization.membersWithRole.pageInfo.endCursor}"`)
  }
  return report;
}
