enablegoogleinbox
=================

A Firefox addon to disable the checks Google put in place to disallow Firefox users from viewing Google Inbox.

Technical details:
- Google uses User Agent testing to show a "not supported" message to the Firefox browser. This addon spoofs to be Google Chrome for the Google Inbox page, fixing this issue.
- Google uses Content-Security-Policy header for safety. But due to a different implementation it allows "blob:" by default. Firefox is a bit more strict and "blob:" also needs to get specified, before allowing. This addon adjusts this header to include "blob:"

Issues:
- I tested this in FF24 / FF30 / FF38 (w/wo e10s). So very limited. Upon finding issues please report!
