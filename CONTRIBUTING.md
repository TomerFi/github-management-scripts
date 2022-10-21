# Contributing to *github-management-scripts*

:clap: First off, thank you for taking the time to contribute. :clap:

- Fork the repository
- Create a new branch on your fork
- Commit your changes
- Create a pull request against the `main` branch

## Project walk through

This project uses [GitHub GraphQL API](https://docs.github.com/en/graphql) to produce two types of reports, a *viewer*
report produced for the invoking user, and an *org* report produced multiple times per organization configured.<br/>
The reports are stored in [S3 Buckets](https://aws.amazon.com/s3/) and compared to the previous reports, if diffs found,
an email will be sent via [SES](https://aws.amazon.com/ses/) to the configured email address noting the diffs.

- [src/main.js](https://github.com/TomerFi/github-management-scripts/blob/main/src/main.js) is the main entrypoint for
  the app, it instantiates the APIs, builds the various reports, and handles the diff checks, bucket uploads, and emails.
- [src/reports/org.js](https://github.com/TomerFi/github-management-scripts/blob/main/src/reports/org.js) is the *org*
  report builder, aggregating the various *org_x* queries.
- [src/reports/viewer.js](https://github.com/TomerFi/github-management-scripts/blob/main/src/reports/viewer.js) is the
  *viewer* report builder, aggregating the various *viewer_x* queries.
- [src/queries](https://github.com/TomerFi/github-management-scripts/tree/main/src/queries) holds the various query
  functions, `org_*.js` and `viewer_*.js` represents the *org* and *viewer* reports respectively.
- [src/queries/fragments.js](https://github.com/TomerFi/github-management-scripts/blob/main/src/queries/fragments.js)
  holds various fragments used through out the project.
- [src/common.js](https://github.com/TomerFi/github-management-scripts/blob/main/src/common.js) holds global constants.
- [src/utils.js](https://github.com/TomerFi/github-management-scripts/blob/main/src/utils.js) holds utility functions.
