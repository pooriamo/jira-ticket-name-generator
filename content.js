const parseQueryString = () => {
    const queryString = location.search.replace(/^\?/, '');
    return queryString.split('&').reduce((acc, curr) => {
        const [key, value] = curr.split('=');
        acc[key] = value;
        return acc;
    }, {});
}

const getIssueType = () => {
    const issueTypeButton = [...document.querySelectorAll('#jira-issue-header nav[aria-label=Breadcrumbs] button[aria-label]')].pop();

    if (!issueTypeButton) {
        return;
    }

    return issueTypeButton.attributes['aria-label'].value?.toLowerCase().startsWith('bug') ? 'fix/' : 'feat/';
}

const getIssueTitle = () => {
    return document
        .querySelector('h1[data-test-id="issue.views.issue-base.foundation.summary.heading"]')
        ?.textContent;
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

    const config = { childList: true };

    const callback = function (mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList'
                && document.getElementById('jira-issue-header')
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
    return getIssueType() + issueCode + '-' + getIssueTitle().trim().toLowerCase().replace(/-/g, '').replace(/\s+/g, '-');
}

if (
    location.pathname.endsWith('RapidBoard.jspa')
    || (location.pathname.startsWith('/browse/'))
) {
    window.addEventListener('load', () => {
        insertCalculatedBranchName();
        observe();
    });
}

