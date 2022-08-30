const { graphql } = require('@octokit/graphql');
const { MAX_VIEWER_REPOS_FETCH, REQUEST_PARAMS } = require('../common.js');

module.exports = wrapper;

async function wrapper(report) {
  return getUserReposInfo(report, `first: ${MAX_VIEWER_REPOS_FETCH}`);
}

async function getUserReposInfo(report, repos) {
  if (!('repos' in report)) {
    report.repos = [];
  }
  if (!('reposTotal' in report)) {
    report.reposTotal = 0;
  }
  if (!('reposTotalStars' in report)) {
    report.reposTotalStars = 0;
  }

  let query = `
    {
      user (login: "${report.login}") {
        repositories(${repos}, affiliations: OWNER, isFork: false, isLocked: false) {
          edges {
            node {
              defaultBranchRef {
                name
              }
              forkCount
              isArchived
              isDisabled
              isEmpty
              isInOrganization
              isPrivate
              name
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
              issues(first:100, states: OPEN) {
                totalCount
              }
              milestones(first:100, states: OPEN) {
                totalCount
              }
              packages(first: 100) {
                totalCount
              }
              projectsV2(first: 100) {
                totalCount
              }
              pullRequests(first:100, states: OPEN) {
                totalCount
              }
              vulnerabilityAlerts(first: 100, states: OPEN) {
                totalCount
              }
              watchers(first:100) {
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

  result.user.repositories.edges
    .forEach(edge => {
      report.reposTotalStars += edge.node.stargazerCount;
      report.repos.push({
        head: edge.node.defaultBranchRef?.name,
        name: edge.node.name,
        forkCount: edge.node.forkCount,
        isArchived: edge.node.isArchived,
        isDisabled: edge.node.isDisabled,
        isEmpty: edge.node.isEmpty,
        isInOrganization: edge.node.isInOrganization,
        isPrivate: edge.node.isPrivate,
        stargazerCount: edge.node.stargazerCount,
        webCommitSignoffRequired: edge.node.webCommitSignoffRequired,
        environments: edge.node.environments.nodes.map(n => n.name),
        discussions: edge.node.discussions.totalCount,
        issues: edge.node.issues.totalCount,
        license: edge.node?.licenseInfo?.name,
        milestones: edge.node.milestones.totalCount,
        packages: edge.node.packages.totalCount,
        projects: edge.node.projectsV2.totalCount,
        prs: edge.node.pullRequests.totalCount,
        vulnerabilities: edge.node.vulnerabilityAlerts.totalCount,
        watchers: edge.node.watchers.totalCount,
        url: edge.node.url,
        latest: {
          name: edge.node.latestRelease?.name ? edge.node.latestRelease.name : edge.node.latestRelease?.tagName,
          url: edge.node.latestRelease?.url,
          reactions: edge.node.latest?.release.reactions.totalCount,
        }
      });
    });

  report.reposTotal += result.user.repositories.totalCount;

  if (result.user.repositories.pageInfo.hasNextPage) {
    return getUserReposInfo(
      report,
      `first: ${MAX_VIEWER_REPOS_FETCH}, after: "${result.user.repositories.pageInfo.endCursor}"`)
  }
  return report;
}
