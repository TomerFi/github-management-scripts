const { graphql } = require('@octokit/graphql');
const { MAX_ORG_REPOS_FETCH, REQUEST_PARAMS } = require('../common.js');

module.exports = wrapper;

async function wrapper(org, report) {
  return getOrganizationReposInfo(org, report, `first: ${MAX_ORG_REPOS_FETCH}`);
}

async function getOrganizationReposInfo(org, report, repos) {
  if (!('repos' in report)) {
    report.repos = [];
  }
  if (!('info' in report)) {
    report.info.repos = 0;
    report.info.reposTotalStars = 0;
  } else {
    if (!('repos' in report.info)) {
      report.info.repos = 0;
    }
    if (!('reposTotalStars' in report)) {
      report.info.reposTotalStars = 0;
    }
  }
  let query = `
    {
      organization (login: "${org}") {
        repositories(${repos}, ownerAffiliations: OWNER) {
          edges {
            node {
              defaultBranchRef {
                name
              }
              name
              forkCount
              isArchived
              isEmpty
              isFork
              isPrivate
              stargazerCount
              url
              webCommitSignoffRequired
              environments(first: 100) {
                nodes {
                  name
                }
              }
              licenseInfo {
                name
              }
              latestRelease {
                name
                tagName
                url
                reactions(first: 100) {
                  totalCount
                }
              }
              discussions(first: 100) {
                totalCount
              }
              issues(first: 100, states: OPEN) {
                totalCount
              }
              milestones(first: 100, states: OPEN) {
                totalCount
              }
              packages(first: 100) {
                totalCount
              }
              projectsV2(first: 100) {
                totalCount
              }
              pullRequests(first: 100, states: OPEN) {
                totalCount
              }
              vulnerabilityAlerts(first: 100, states: OPEN) {
                totalCount
              }
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

  result.organization.repositories.edges
    .forEach(edge => {
      report.info.reposTotalStars += edge.node.stargazerCount;
      report.repos.push({
        name: edge.node.name,
        head: edge.node.defaultBranchRef?.name,
        forkCount: edge.node.forkCount,
        isArchived: edge.node.isArchived,
        isEmpty: edge.node.isEmpty,
        isFork: edge.node.isFork,
        isPrivate: edge.node.isPrivate,
        stargazers: edge.node.stargazerCount,
        discussions: edge.node.discussions.totalCount,
        issues: edge.node.issues.totalCount,
        milestones: edge.node.milestones.totalCount,
        packages: edge.node.packages.totalCount,
        projects: edge.node.projectsV2.totalCount,
        pullRequests: edge.node.pullRequests.totalCount,
        vulnerabilityAlerts: edge.node.vulnerabilityAlerts.totalCount,
        url: edge.node.url,
        webCommitSignoffRequired: edge.node.webCommitSignoffRequired,
        environments: edge.node.environments.nodes.map(n => n.name),
        license: edge.node?.licenseInfo?.name,
        latest: {
          name: edge.node.latestRelease?.name ? edge.node.latestRelease.name : edge.node.latestRelease?.tagName,
          url: edge.node.latestRelease?.url,
          reactions: edge.node.latest?.release.reactions.totalCount,
        }
      });
    });

  report.info.repos = result.organization.repositories.totalCount;

  if (result.organization.repositories.pageInfo.hasNextPage) {
    return getOrganizationReposInfo(
      org,
      report,
      `first: ${MAX_ORG_REPOS_FETCH}, after: "${result.organization.repositories.pageInfo.endCursor}"`)
  }
  return report;
}
