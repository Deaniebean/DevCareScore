# 📊 DevCareScore

**DevCareScore** is a Node.js script that evaluates the *community support health* of an open source GitHub repository based on real metrics like issue resolution and contributor activity.
Community Support is important for open source projects but also not easy to define or measure as it encompasses many aspects. This script attempts to capture some measureable aspects of community support by focusing on the questions: 
- if a user encounters a problem today, how quickly can they expect a response, how likely is it that their issue will be resolved?
- How large is the community?

The script is based solely on the GitHub repositories of the projects/libraries. Keep in mind that there may be other, more active support channels, so take these metrics with a grain of salt.

This might also be interesting for repository owners — feel free to test your own applications! A well-maintained repository with fast response times and high issue resolution rates is generally always a good sign. 

## 🔍 What It Measures

This script uses the GitHub REST API to calculate:

- **Issue Resolution Rate (IRR):**  
  Ratio of closed to total issues – indicates how responsive maintainers are. To not hit request rate limits but also to evaluate the current activity levels (maintenance 
  53 years ago is not relevant for someone who wants to a lib today), the most recent 500 issues are fetched and then based on these IRR is calculated. The score is a percent value, the higher the percentage the better.

- **Median Issue Resolution Time (MIRT):**  
  Measures how long it takes for issues to be resolved – lower is better.

- **Contributor Count (CC):**  
  Number of people who contributed code – shows project activity. 

  (Note: The contributor count from the GitHub API may differ slightly from the number shown on the repository's web page because the API includes both authenticated and anonymous contributors, and contributors using multiple email addresses may be counted more than once.)



## 🚀 Getting Started

### 1. Clone the project
```bash
git clone https://github.com/yourusername/devcarescore.git
cd devcarescore
```

### 2. Install dependencies
```bash
npm install
```
### 3. Create an *.env* file with your GitHub token, the owner of the repository you are analyzing and the name of the repository
```bash
GITHUB_TOKEN=insert_token
OWNER=insert_repo_owner
REPO=insert_repo_name
```
⚠️ You need a GitHub personal access token with public_repo access. This can easily be generated in your GitHub profile under settings/Developer Settings/Personal Access tokens

## ▶️ Run the Script
To check the development care score of a GitHub repository just run the script in your terminal:
```bash
node index.js
```
## 📄 License

MIT © 2025 Deaniebean