# GitLab REST API exploration

## Cool single APIs

### [Commits](https://docs.gitlab.com/ee/api/commits.html)
List commits, get commit, get branches a commit is in, get diff, get comments, get GPG signature, get MRs
#### Cool parameters
* ref_name: name of branch, tag, revision range. Default current branch
* path: file path
* all
* with_stats
* order: reverse chronological or topographic
* trailers: parse git trailers like signed-off-by and co-authored-by and include them

### [Issue statistics](https://docs.gitlab.com/ee/api/issues_statistics.html#get-project-issues-statistics)
Get count of issues matching query. Muse use ```scope=all``` to not filter on current user's created issues.
#### Cool parameters
* label
* milestone
* author_id
* assignee_id
* my_reaction_emoji: issues reacted to by this user with given emoji

### [Issues](https://docs.gitlab.com/ee/api/issues_statistics.html#get-project-issues-statistics)
Get detailed info on issues, including time tracking, up-/downvotes, MR numbers, number of comments, number of subtasks completed, MRs which close
#### Cool parameters
* same as issue statistics

### [Award emoji](https://docs.gitlab.com/ee/api/award_emoji.html)
List an item's awards (emoji reactions).

### [Labels](https://docs.gitlab.com/ee/api/labels.html)
List labels, optionally with_counts of issues and MRs

### [Notes](https://docs.gitlab.com/ee/api/notes.html)
Comments and system log (assignee change, etc.) for issues, MRs, snippets and epics.

### [Users](https://docs.gitlab.com/ee/api/users.html)
List users, including status (emoji, availability, message), counts, emails, keys, 

### [Members](https://docs.gitlab.com/ee/api/members.html)
List project/group members, including access level, names, etc

### [Merge requests](https://docs.gitlab.com/ee/api/merge_requests.html)
List project MRs, time tracking, approvals, state events, changes, commits, participants, issues which will be closed on merge.

### [Repository files](https://docs.gitlab.com/ee/api/repository_files.html)
Get file at path; content, file name, size, encoding, ref, commit_id, last_commit_id

### [Milestones](https://docs.gitlab.com/ee/api/milestones.html)
Get project milestones, active/closed, due date, expired, title, issues, MRs, burndown charts [premium].

### [Boards](https://docs.gitlab.com/ee/api/boards.html)
Show issues in a board organized by status

### [Branches](https://docs.gitlab.com/ee/api/branches.html)
List branches.
