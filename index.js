import axios from 'axios';
import dayjs from 'dayjs';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
console.log("Loaded token:", GITHUB_TOKEN);
const OWNER = process.env.OWNER;
const REPO = process.env.REPO;

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  'User-Agent': 'community-metrics-script',
};

async function fetchIssues(state, perPage = 100, maxPages = 5) {
  let issues = [];
  for (let page = 1; page <= maxPages; page++) {
    const res = await axios.get(`https://api.github.com/repos/${OWNER}/${REPO}/issues`, {
      headers,
      params: { state, per_page: perPage, page },
    });
    const onlyIssues = res.data.filter(issue => !issue.pull_request);
    issues = issues.concat(onlyIssues);
    if (res.data.length < perPage) break;
  }
  return issues;
}

async function fetchContributors() {
  const res = await axios.get(`https://api.github.com/repos/${OWNER}/${REPO}/contributors`, {
    headers,
  });
  return res.data.length;
}

async function main() {
  const openIssues = await fetchIssues('open');
  const closedIssues = await fetchIssues('closed');

  const IRR = (closedIssues.length / (openIssues.length + closedIssues.length)).toFixed(2);

  const resolutionTimes = closedIssues
    .map(issue => dayjs(issue.closed_at).diff(dayjs(issue.created_at), 'day'))
    .sort((a, b) => a - b);

  const mid = Math.floor(resolutionTimes.length / 2);
  const MIRT = resolutionTimes.length % 2 === 0
    ? (resolutionTimes[mid - 1] + resolutionTimes[mid]) / 2
    : resolutionTimes[mid];

  const CC = await fetchContributors();

  console.log(`📊 Results for ${OWNER}/${REPO}`);
  console.log(`- Issue Resolution Rate (IRR): ${IRR * 100}%`);
  console.log(`- Median Issue Resolution Time (MIRT): ${MIRT} days`);
  console.log(`- Contributor Count (last 12 months): ${CC}`);
}

main().catch(err => console.error('❌ Error:', err.message));
