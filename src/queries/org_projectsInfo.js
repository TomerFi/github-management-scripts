const { graphql } = require('@octokit/graphql');
const { MAX_ORG_PROJECTS_FETCH, REQUEST_PARAMS } = require('../common.js');

module.exports = wrapper;

async function wrapper(org, report) {
  return getOrganizationProjectsInfo(org, report, `first: ${MAX_ORG_PROJECTS_FETCH}`);
}

async function getOrganizationProjectsInfo(org, report, projects) {
  if (!('projects' in report)) {
    report.projects = [];
  }
  if (!('info' in report)) {
    report.info.projects = 0;
  } else {
    if (!('projects' in report.info)) {
      report.info.projects = 0;
    }
  }
  let query = `
    {
      organization (login: "${org}") {
        projectsV2(${projects}) {
          edges {
            node {
              closed
              public
              title
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

  result.organization.projectsV2.edges
    .forEach(edge => {
      report.projects.push({
        closed: edge.node.closed,
        public: edge.node.public,
        title: edge.node.title,
        url: edge.node.url,
      });
    });

  report.info.projects = result.organization.projectsV2.totalCount;

  if (result.organization.projectsV2.pageInfo.hasNextPage) {
    // eslint-disable-next-line no-undef
    return getOrganizationPackagesInfo(
      org,
      report,
      `first: ${MAX_ORG_PROJECTS_FETCH}, after: "${result.organization.projectsV2.pageInfo.endCursor}"`)
  }
  return report;
}
