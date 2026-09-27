# Browser SQL — GitHub Execution Structure

The pre-KISS Master #20 / Epics #21..#28 / WP-01..WP-42 graph is **historical and superseded for current initial V2 by D-044**.

Its complete historical execution map is preserved at:

~~~text
docs/history/browser-sql-pre-kiss-42wp-plan/browser-sql-github-execution-structure.md
~~~

The current compact execution design is:

~~~text
one compact Master
+ C01..C12 executable Issues
+ conditional work only when evidence triggers it
~~~

Canonical pre-materialization sources:

~~~text
docs/browser-sql-compact-execution-dag.md
docs/browser-sql-compact-issue-specifications.md
~~~

This path will contain the concise actual Master/C01..C12 GitHub navigation after materialization.

Live progress/current-next state belongs only in `../STATUS.json`.
