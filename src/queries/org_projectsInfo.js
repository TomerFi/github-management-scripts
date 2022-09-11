const { graphql } = require('@octokit/graphql');
const { MAX_ORG_PROJECTS_FETCH, REQUEST_HEADERS } = require('../common.js');
const { PROJECT_V2_CONNECTION } = require('./fragments.js');

const initialQuery = `#graphql
  query ($org: String!, $maxProjects: Int!) {
    organization (login: $org) {
      projectsV2(first: $maxProjects) {
        ...projectV2ConnectionFields
      }
    }
  }
  ${PROJECT_V2_CONNECTION}
`;

const followupQuery = `#graphql
  query ($org: String!, $maxProjects: Int!, $lastCursor: String!) {
    organization (login: $org) {
      projectsV2(first: $maxProjects, after: $lastCursor) {
        ...projectV2ConnectionFields
      }
    }
  }
  ${PROJECT_V2_CONNECTION}
`;

module.exports = async function(report) {
  console.info(`appending ${report.login} projects info`);
  return getOrganizationProjectsInfo(report);
};

async function getOrganizationProjectsInfo(report, query, args) {
  if (!('projects' in report)) {
    report.projects = [];
  }

  let response = await graphql({
    query: query ? query : initialQuery,
    org: report.login,
    maxProjects: MAX_ORG_PROJECTS_FETCH,
    ...args,
    ...REQUEST_HEADERS,
  });

  response.organization.projectsV2.edges
    .forEach(edge => {
      report.projects.push({
        closed: edge.node.closed,
        public: edge.node.public,
        title: edge.node.title,
        url: edge.node.url,
      });
    });

  if (!('projectsTotal' in report)) {
    report.projectsTotal = response.organization.projectsV2.totalCount;
  }

  if (response.organization.projectsV2.pageInfo.hasNextPage) {
    return getOrganizationProjectsInfo(
      report,
      followupQuery,
      { lastCursor: response.organization.projectsV2.pageInfo.endCursor});
  }
  return report;
}
