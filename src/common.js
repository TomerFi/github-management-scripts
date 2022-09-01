module.exports = Object.freeze({
  // the required gh token needs the following scopes:
  // repo, read:packages, admin:org, read:user, read:discussion, read:project
  REQUEST_HEADERS: {
    headers: {
      authorization: `bearer ${process.env.GITHUB_PAT}`,
    }
  },
  // max query items to fetch per query (multiple queries are used to fetch all)
  // these can be tweaked if gh api timeouts pop, max items allowed by gh is 100
  MAX_VIEWER_FOLLOWERS_FETCH: 100,
  MAX_VIEWER_FOLLOWING_FETCH: 100,
  MAX_VIEWER_REPOS_FETCH: 60,
  MAX_ORG_MEMBERS_FETCH: 20,
  MAX_ORG_PKGS_FETCH: 20,
  MAX_ORG_PROJECTS_FETCH: 20,
  MAX_ORG_REPOS_FETCH: 20,
  MAX_ORG_TEAMS_FETCH: 20,
  // content-related
  DEFAULT_CHARSET: 'UTF-8',
  EMAIL_TOPIC: 'Hello from github-management-scripts',
  // bucket keys
  VIEWER_KEY: 'viewer.json',
  ORG_KEY_FMT: 'org_%s.json',
});
