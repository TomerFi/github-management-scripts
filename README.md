<!-- markdownlint-disable MD033 -->
<h1 align="center">
  GitHub Management Scripts
</h1>

<h3 align="center">
  Keep track of your GitHub Profile and Organizations
</h3>

<p align="center">
  <br/>
  Running on <em>AWS</em>, triggered by daily scheduled events,<br/>
  this project fetches data about the viewer's <em>GitHub</em> Profile and selected Organizations,<br/>
  compares them to the data stored from the previous run, and emails a diffs report.
</p>

<p align="center">

  ```mermaid
    sequenceDiagram
      autonumber
      loop daily
        EventBridge->>Lambda: launches a daily scheduled event
      end
      Lambda->>GitHub: fetches data for creating reports
      Lambda->>S3: fetches previous stored reports
      opt if found diffs
        Lambda-->>S3: store the new reports
        Lambda-->>SES: send an email with a diffs report
      end
  ```

</p>

<details>
  <summary><strong>Environment variables</strong></summary>
  <p>
  The following environment variables are required for runtime:

  ```shell
  GITHUB_PAT="your-github-personal-access-token-goes-here"
  S3_BUCKET_NAME="name-of-s3-bucket-goes-here"
  ORGS_LIST="org-name,another-org-name"
  EMAIL_RECIPIENT="email-to-send-notification-to-goes-here"
  EMAIL_SENDER="email-to-send-mails-from-goes-here"
  ```

  <details>
  <summary>Token scopes</summary>
  <p>
  <ul>
    <li>repo</li>
    <li>read:packages</li>
    <li>admin:org</li>
    <li>read:user</li>
    <li>read:discussion</li>
    <li>read:project</li>
  </ul>
  </p>
  </details>

  <details>
  <summary>Additional environment variables</summary>
  <p>
  These, are probably being handled by your local <em>aws-cli</em> or <em>Lambda</em> environment,<br/>
  nevertheless, if you're running this app without <em>Lambda</em>, you need to set these manually:

  ```shell
  AWS_ACCESS_KEY_ID="iam-user-access-key-id-goes-here"
  AWS_SECRET_ACCESS_KEY="iam-user-secret-access-key-goes-here"
  AWS_REGION="aws-region-goes-here"
  ```

  </p>
  </details>
  </p>
</details>

<details>
  <summary><strong>Deployment instructions</strong></summary>
  <p>AWS services used for this project are:</p>
  <ul>
    <li><a href="#iam">IAM</a></li>
    <li><a href="#s3">S3</a></li>
    <li><a href="#ses">SES</a></li>
    <li><a href="#lambda">Lambda</a></li>
    <li><a href="#cloudwatch">CloudWatch</a></li>
    <li><a href="#eventbridge">EventBridge</a></li>
  </ul>

  <div name="iam">
  <p>
  <strong><a href="https://aws.amazon.com/iam/">AWS IAM</a></strong>
  <ul>
    <li>Create a service user and attach the <em>AWSLambda_FullAccess</em> permissions policy to it, take note of the new user's <em>access key id</em> and <em>secret access key</em>. We'll use this user's credentials to deploy <em>Lambda</em> function from the CI workflows.</li>
    <li>Create a <em>Role</em> and attach the following policies to it, <em>AWSLambdaExecute</em> which includes permission to <em>CloudWatch</em> and <em>S3</em>, and the <em>AmazonSESFullAccess</em> (full access is mandatory). We will use this for our <em>Lambda</em> execution for allowing our function to access the rest of the services.</li>
  </ul>
  </p>
  </div>

  <div name="s3">
  <p>
  <strong><a href="https://aws.amazon.com/s3/">AWS S3</a></strong>
  <ul>
    <li>Create a bucket for storing the previous reports for comparison, it doesn't have to be a public accessible one. and it's up to you if you want to make it preserve versions.</li>
  </ul>
  </p>
  </div>

  <div name="ses">
  <p>
  <strong><a href="https://aws.amazon.com/ses/">AWS SES</a></strong>
  <ul>
    <li>Configure based on the given instructions, as you see fit, i.e. verify your custom domain and custom from domain if needed.<br/>
    Make sure to take you service out of the sandbox environment if you want to able to properly send emails.</li>
  </ul>
  </p>
  </div>

  <div name="lambda">
  <p>
  <strong><a href="https://aws.amazon.com/lambda/">AWS Lambda</a></strong>
  <ul>
    <li>Create a function based on the execution <em>IAM Role</em> you created earlier.</li>
    <li>Set the handler to <code>src/main.handler</code></li>
    <li>Set the timeout to at least a minute, depending on how many items you are fetching.</li>
    <li>Build the project with <code>npm ci</code></li>
    <li>Upload a <em>Zip</em> archive containing at the following:
      <ul>
        <li><code>src/</code></li>
        <li><code>node_modules/</code></li>
      </ul>
      <small><code>zip -r github-management-scripts.zip src/ node_modules/</code></small>
    </li>
    <li>Publish a new version.</li>
    <li>Create an alias named <code>Live</code> and point it to published version, this will help us maintain versioning for your function, as the triggering event will invoke this alias.<br/>
    Note, I like also creating a <code>Dev</code> alias that I use while staging, you can take a look at this project's <em>CI</em> workflows.</li>
    <li>Create the following environment variables for the function's context.<br/>
    Note that <em>AWS</em> connection-related variables are being handled by <em>Lambda</em>:
      <ul>
      <li><code>GITHUB_PAT</code> <em>token scopes: repo, read:packages, admin:org, read:user, read:discussion, read:project</em></li>
      <li><code>S3_BUCKET_NAME</code> <em>the name of the bucket you created</em></li>
      <li><code>ORGS_LIST</code> <em>comma separated list of organizations you want to track.</em></li>
      <li><code>EMAIL_RECIPIENT</code> <em>where to send the diffs to.</em></li>
      <li><code>EMAIL_SENDER</code> <em>sender email for the diffs email.</em></li>
      </ul>
    </li>
  </ul>

  <strong>Note, this section is hit twice, come back here after the creating the event rule.</strong>

  </p>
  </div>

  <div name="cloudwatch">
  <p>
  <strong><a href="https://aws.amazon.com/cloudwatch/">AWS CloudWatch</a></strong>
  <ul>
    <li>After the first function invocation, a designated log group will be created, the default retention for it will be *Never Expires*, you can reduce it, 1 week should suffice.</li>
  </ul>
  </p>
  </div>

  <div name="eventbridge">
  <p>
  <strong><a href="https://aws.amazon.com/eventbridge/">AWS EventBridge</a></strong>
  <ul>
    <li>Create a scheduled rule, for instance <em>0-10-*-*-?-*</em> will run daily at 10AM.</br>
    Set it to invoke your recently created <em>Lambda</em> function, and select <em>Live</em> as the alias.</br>
    Get back to the <a href="#lambda">Lambda</a> function, and select the new <em>EventBridge</em> rule you created as th trigger.</li>
  </ul>
  </p>
  </div>

</details>

<details>
  <summary><strong>Run locally</strong></summary>
  <ul>
    <li>Create a file named <code>.env</code> at the project's root with the required environment variables</li>
    <li>Install all dependencies with <code>npm install</code></li>
    <li>Run the application with <code>npm run start:dev</code></li>
  </ul>
</details>
