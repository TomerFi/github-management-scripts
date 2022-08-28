const { graphql } = require('@octokit/graphql');
const { MAX_VIEWER_FOLLOWING_FETCH, REQUEST_PARAMS } = require('../common.js');

module.exports = wrapper;

async function wrapper(report) {
  return getUserFollowingInfo(report, `first: ${MAX_VIEWER_FOLLOWING_FETCH}`);
}

async function getUserFollowingInfo(report, following) {
  if (!('following' in report)) {
    report.following = [];
  }
  if (!('followingTotal' in report)) {
    report.followingTotal = 0;
  }

  let query = `
    {
      user (login: "${report.login}") {
        following(${following}) {
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

  result.user.following.edges
    .forEach(edge => {
      report.following.push({
        name: edge.node.name ? edge.node.name: edge.node.login,
        url: edge.node.url
      });
    });

  report.followingTotal += result.user.following.totalCount;

  if (result.user.following.pageInfo.hasNextPage) {
    return getUserFollowingInfo(
      report,
      `first: ${MAX_VIEWER_FOLLOWING_FETCH}, after: "${result.user.following.pageInfo.endCursor}"`)
  }
  return report;
}
