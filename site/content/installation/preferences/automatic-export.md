---
preferences: true
---


{{% preferences/header %}}

## Automatic export

default: `On Change`

Determines when [automatic exports]({{ ref . "exporting" }}) are kicked off. Having it disabled still marks
auto-exports as needing updates, so when you re-enable it, those exports will start. On-change means exports
happen whenever an item in the export changes/is added/is removed. On idle does more or less what
`Disabled` (that is, no exports but mark as needing changes), but will kick off exports when your computer is
idle. You mostly want this if your computer is performance-constrained (aka slow).


Options:

* On Change
* When Idle
* Paused


## Delay auto-export for

default: `5`

If you have auto-exports set up, BBT will wait this many seconds before actually kicking off the exports to buffer multiple changes in quick succession
setting off an unreasonable number of auto-exports. Minimum is 1 second. Changes to this preference take effect after restarting Zotero.



