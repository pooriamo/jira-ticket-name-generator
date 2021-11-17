const parseQueryString = () => {
    const queryString = location.search.replace(/^\?/, '');
    return queryString.split('&').reduce((parsedQuery, currentKeyValuePair) => {
        const [key, value] = currentKeyValuePair.split('=');
        parsedQuery[key] = value;
        return parsedQuery;
    }, {});
}

const getIssueTitle = () => {
    return document
        .querySelector('h1[data-test-id="issue.views.issue-base.foundation.summary.heading"]')
        ?.textContent
        .replace(/[:"'+=]/g, '');
}

const insertCalculatedBranchName = () => {
    const header = document.getElementById('jira-issue-header');

    if (!header) {
        return;
    }

    const styles = location.pathname.startsWith('/browse/')
        ? ''
        : "padding: 22px 32px 0; margin-bottom: -12px;";

    const branchName = getBranchName();

    header.insertAdjacentHTML(
        'beforebegin',
        `<div id="mblb-git-branch-name" style="${styles} font-family: monospace;">
            ${branchName
            ? `git checkout -b ${branchName}`
            : "loading branch name..."}
        </div>`
    );
}

const observe = () => {
    const targetNode = document.body;

    const config = { childList: true, subtree: true };

    const callback = function (mutationsList) {
        for (const mutation of mutationsList) {
            if (document.getElementById('jira-issue-header')
                && !document.getElementById('mblb-git-branch-name')
            ) {
                insertCalculatedBranchName();
            }
        }
    };

    const observer = new MutationObserver(callback);

    observer.observe(targetNode, config);
}


const getBranchName = () => {
    if (!getIssueTitle()) {
        return;
    }

    const issueCode = parseQueryString().selectedIssue || location.pathname.split('/').pop();
    return issueCode + '-' + getIssueTitle().trim().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-_.]/g, '')
        .replace(/-+/g, '-');
}

window.addEventListener('load', () => {
    insertCalculatedBranchName();
    observe();
});

