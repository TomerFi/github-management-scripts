const { graphql } = require('@octokit/graphql');
const { MAX_VIEWER_FOLLOWERS_FETCH, REQUEST_PARAMS } = require('../common.js');

module.exports = wrapper;

async function wrapper(report) {
  return getUserFollowersInfo(report, `first: ${MAX_VIEWER_FOLLOWERS_FETCH}`);
}

async function getUserFollowersInfo(report, followers) {
  if (!('followers' in report)) {
    report.followers = [];
  }
  if (!('followersTotal' in report)) {
    report.followersTotal = 0;
  }

  let query = `
    {
      user (login: "${report.login}") {
        followers(${followers}) {
          edges {
            node {
              name
              login
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

  result.user.followers.edges
    .forEach(edge => {
      report.followers.push({
        name: edge.node.name ? edge.node.name: edge.node.login,
        url: edge.node.url
      });
    });

  report.followersTotal += result.user.followers.totalCount;

  if (result.user.followers.pageInfo.hasNextPage) {
    return getUserFollowersInfo(
      report,
      `first: ${MAX_VIEWER_FOLLOWERS_FETCH}, after: "${result.user.followers.pageInfo.endCursor}"`)
  }
  return report;
}
