import axios from 'axios';
import dayjs from 'dayjs';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.OWNER;
const REPO = process.env.REPO;

const headers = {
  Authorization: `token ${GITHUB_TOKEN}`,
  'User-Agent': 'community-metrics-script',
};

async function fetchLatestIssues(perPage = 100, maxPages = 5) {
  let issues = [];
  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await axios.get(`https://api.github.com/repos/${OWNER}/${REPO}/issues`, {
        headers,
        params: {
          per_page: perPage,
          page,
          state:'all',
          sort: 'created',
          direction: 'desc',
        },
      });

      // Log rate limit information
      //console.log(`Rate Limit Remaining: ${res.headers['x-ratelimit-remaining']}`);
      //console.log(`Rate Limit Reset: ${new Date(res.headers['x-ratelimit-reset'] * 1000)}`);

      // Filter out pull requests, but keep issues
      const onlyIssues = res.data.filter(issue => !issue.pull_request);
      issues = issues.concat(onlyIssues);

      if (res.data.length < perPage) break;
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error.message);
    }
  }
  return issues;
}

async function fetchContributors() {
    try {
      let contributors = [];
      let page = 1;
      const perPage = 100; // Max allowed by GitHub API
  
      while (true) {
        const res = await axios.get(`https://api.github.com/repos/${OWNER}/${REPO}/contributors`, {
          headers,
          params: {
            per_page: perPage,
            page,
          },
        });
  
        contributors = contributors.concat(res.data);
  
        if (res.data.length < perPage) break; // Break if fewer items than expected
        page++;
      }
  
      return contributors.length;
    } catch (error) {
      console.error('Error fetching contributors:', error.message);
      return 0;
    }
  }
  

async function main() {
    try {  
      const recentIssues = await fetchLatestIssues();
    
   
      const closedIssues = recentIssues.filter(issue => issue.state === 'closed');
      console.log(`Closed issues: ${closedIssues.length}`);

      const openIssues = recentIssues.filter(issue => issue.state === 'open');
      console.log(`Open issues: ${openIssues.length}`);
  
      // Issue Resolution Rate (IRR)
      const IRR = (closedIssues.length / recentIssues.length).toFixed(2);
  

      // Median Issue Resolution Time (MIRT) considering both closed and open issues
      const now = dayjs();
  
      // Calculate resolution times for both closed and open issues
      const resolutionTimesAll = recentIssues.map(issue => {
        const createdAt = dayjs(issue.created_at);
        const resolvedAt = issue.closed_at ? dayjs(issue.closed_at) : now;
        return resolvedAt.diff(createdAt, 'day');
      }).sort((a, b) => a - b);
  

      // Median for all issues (including open)
      const midAll = Math.floor(resolutionTimesAll.length / 2);
      const MIRTAll = resolutionTimesAll.length % 2 === 0
        ? (resolutionTimesAll[midAll - 1] + resolutionTimesAll[midAll]) / 2
        : resolutionTimesAll[midAll];
 
      const CC = await fetchContributors();
  
      console.log(`📊 Results for ${OWNER}/${REPO}`);
      console.log(`- Issue Resolution Rate (IRR): ${IRR * 100}%`);
      console.log(`- Median Issue Resolution Time (MIRT): ${MIRTAll} days`);
      console.log(`- Contributor Count: ${CC}`);
    } catch (error) {
      console.error('Error in main:', error.message);
    }
  }
  main()
   .catch(error => {
    console.error('Error in script:', error.message);
  });