better-bibtex =
  .label = Better BibTeX
-citation-key = Citation Key
better-bibtex_auto-export_delete = Deleting auto-export
better-bibtex_auto-export_delete_confirm = Are you sure you want to delete this auto-export? This cannot be undone.
better-bibtex_aux-scan_prompt = Tag name
better-bibtex_aux-scan_title_aux = Tag cited items from AUX file
better-bibtex_aux-scan_title_md = Tag cited items from Markdown file
better-bibtex_aux-scanner =
  .label = Scan BibTeX AUX/Markdown file for references...
better-bibtex_bulk-keys-confirm_warning = You are changing more than { $treshold } items in one go. Are you sure?
better-bibtex_bulk-keys-confirm_stop_asking = OK, and don't ask me again

better-bibtex_error-report = 
  .title = Better BibTeX debug log

better-bibtex_error-report_upgrade = The latest { $program } version is <strong>{ $upgrade }</strong>, you are running <strong>{ $running }</strong>; please upgrade first.

better-bibtex_error-report_upgrade_auto = { $program } will update from the { $channel } channel every { $interval }, last update at { $lastUpdate }.
better-bibtex_error-report_upgrade_manual = { $program } updates are disabled

better-bibtex_error-report_no_items = This log will not include sample items. <b>These are not mandatory</b>, but are usually necessary to create test cases for the change/fix you will be requesting. To generate a log with sample items:
better-bibtex_error-report_no_items_cancel = cancel this wizard
better-bibtex_error-report_no_items_reproduce = reproduce the problem
better-bibtex_error-report_no_items_select = select the reference(s) that exhibit the problem and right-click them
better-bibtex_error-report_no_items_popup = choose <i>Better BibTeX</i> from the popup menu
better-bibtex_error-report_no_items_report = choose <i>{ better-bibtex_report-errors }</i>

better-bibtex_error-report_better-bibtex_cache =
  .value = Cache size: { $entries } entries.

better-bibtex_error-report_context = 
  .label = Application context

better-bibtex_error-report_debug = 
  .label = Debug log

better-bibtex_error-report_enable-debug = Zotero debug logging is currently disabled. It will be easier to diagnose the problem if you enable it and reproduce the problem before submitting a debug log.

better-bibtex_error-report_errors = 
  .label = Errors

better-bibtex_error-report_include-errors = 
  .label = Include error messages
better-bibtex_error-report_include-log = 
  .label = Include debug log
better-bibtex_error-report_include-items = 
  .label = Include item
better-bibtex_error-report_include-notes = 
  .label = notes
better-bibtex_error-report_include-cache = 
  .label = cache
better-bibtex_error-report_include-attachments = 
  .label = attachment metadata

better-bibtex_error-report_items = 
  .label = Items

better-bibtex-error-send-reminder = Clicking "{ $send }" will send the debug log to secure storage for the developer to review.

better-bibtex_error-report_post-to-github = Please post a message to the issue tracker with this debug log ID, a description of the problem, and any steps necessary to reproduce it. <strong>Debug logs cannot be reviewed unless referred to in the GitHub issue tracker by their ID.</strong>

better-bibtex_error-report_report-id = Debug log ID:
better-bibtex_error-report_restart-with-logging-enabled = 
  .label = Restart with Logging Enabled…


better-bibtex_error-report_review = The data below is about to submitted to Better BibTeX for debugging. You can preview the data here, or save a copy of the log to get the precise data about to be sent, to see whether there's sensitive information that you do not wish to send. Please think carefully about whether unchecking options below is necessary for your environment. We will generally need more communication (= time) if you remove parts of the log this way.
    
    If you are OK with sending this data, please proceed to the next screen where you will be presented a red debug ID, and post this ID on the issue tracker at
    
    https://github.com/retorquere/zotero-better-bibtex/issue


better-bibtex_error-report_save = 
  .label = Save copy of log for inspection

better-bibtex_error-report_submission-in-progress = Please wait while the debug log is submitted.
better-bibtex_error-report_submitted = Your debug log has been submitted.
better-bibtex_export-options_keep-updated = Keep updated
better-bibtex_export-options_reminder = Are you sure you don't want the '{ $translator }' format?
better-bibtex_export-options_worker = Background export
better-bibtex_export-options_biblatexAPA = biblatex-apa
better-bibtex_export-options_biblatexChicago = biblatex-chicago

better-bibtex_item-pane_section_sidenav =
  .tooltip = { -citation-key }
better-bibtex_item-pane_section_header =
  .label = { -citation-key }
better-bibtex_item-pane_info_citation-key_label = { -citation-key }

better-bibtex_preferences_advanced_export_brace-protection = 
  .label = Apply case-protection to capitalized words by enclosing them in braces

better-bibtex_preferences_advanced_export_brace-protection_warning = If you're dead-set on ignoring both BibTeX/BibLaTeX best practice (see the BBT FAQ) and the Zotero recommendations on title/sentence casing, you can turn this off to suppress automatic brace-protection for words with uppercase letters.
better-bibtex_preferences_advanced_export_retain-cache = 
  .label = Retain export cache across upgrades
better-bibtex_preferences_advanced_export_reset-cache = 
  .label = Cache will be recreated on next start

better-bibtex_preferences_advanced_export_retain-cache_warning = By default, BBT clears all caches whenever BBT or Zotero is upgraded. I can't realistically predict whether a change in Zotero or BBT is going to affect the output generated for any given item, so to be sure you always have the latest export-affecting fixes, the caches are discarded when a new version of either is detected. If you have a very large library however, of which you regularly export significant portions, you might want to retain the cached items even if that does come with the risk that you get wrong output on export that has been fixed in the interim.
    
    If you have this on, and you experience any problem that is not the cache getting dropped on upgrade, you *must* clear the cache and reproduce the problem. When you change this setting, as with any setting change, the cache will be dropped.

better-bibtex_preferences_advanced_export_title-case = 
  .label = Apply title-casing to titles


better-bibtex_preferences_advanced_export_title-case_warning = If you're dead-set on ignoring both BibTeX/BibLaTeX best practice (see the BBT FAQ) and the Zotero recommendations on title/sentence casing, you can turn this off to suppress title casing for English items
better-bibtex_preferences_advanced_export_workers_cache = 
  .label = Enable caching for background exports

better-bibtex_preferences_advanced_extra-merge = When merging items, also merge:

better-bibtex_preferences_advanced_extra-merge-csl = 
  .label = fields that are understood to be CSL fields by Zotero

better-bibtex_preferences_advanced_extra_merge-citekeys = 
  .label = their citation keys into an bib(la)tex `ids` field

better-bibtex_preferences_advanced_extra_merge-tex = 
  .label = their `tex.*` fields

better-bibtex_preferences_advanced_ideographs = Ideographs in citekeys

better-bibtex_preferences_advanced_ideographs_chinese = 
  .label = Enable 'jieba'/'pinyin' filters in citekey patterns. Uses a lot of memory.

better-bibtex_preferences_advanced_ideographs_splitName = 
  .label = Split all Chinese-like single-field names, unless the item's language is set to Japanese and Japanese support is enabled.

better-bibtex_preferences_advanced_ideographs_japanese = 
  .label = Apply kuroshiro romajization in Japanese names/titles. Uses a lot of memory.

better-bibtex_preferences_advanced_import_case-protection = Insert case-protection for braces:
better-bibtex_preferences_advanced_import_case-protection_as-needed =
  .label = minimal
better-bibtex_preferences_advanced_import_case-protection_off =
  .label = no
better-bibtex_preferences_advanced_import_case-protection_on =
  .label = yes

better-bibtex_preferences_advanced_import_case-protection_warning = On import, BBT will add case-protection (<span class="nocase">...<span>) to titles that have words in {"{"}Braces{"}"}.
    
    There's plenty of bib(la)tex files out there that do this a little overzealously, and you may not like the resulting HTML code in your items, even though this is what the braces mean in bib(la)tex, and Zotero supports it.
    
    If you turn this off, the markup is omitted during import. When you select 'yes', all braces that bib(la)tex would interpret as case protection (which is not all of them) are converted to `span` elements. In `minimal` mode, the number of `span` elements is minimized.

better-bibtex_preferences_advanced_import_sentence-case = Sentence-case titles on import:
better-bibtex_preferences_advanced_import_sentence-case_off = 
  .label = no (import titles as-is)

better-bibtex_preferences_advanced_import_sentence-case_on = 
  .label = yes

better-bibtex_preferences_advanced_import_sentence-case_on-guess = 
  .label = yes, but try to exclude already-sentence-cased titles


better-bibtex_preferences_advanced_import_sentence-case_warning = Bib(La)TeX entries must be stored in Title Case; Zotero items are expected to be entered as sentence-case.
    
    With this option on, BBT will try to sentence-case during import. This sentence-casing uses heuristics, no natural language processing is performed, and the results are not perfect.
    
    You can turn this off, but you may then also want to disable `Apply title-casing to titles` (which has its own problems, see the help entry for that option on this page).
    With 'yes, but try to exclude already-sentence-cased titles', BBT will attempt to detect titles that are already sentence cased and leave them as-is on import.

better-bibtex_remigrate = 
  .label = Re-do BBT citation key migration
better-bibtex_preferences_advanced_import_migrate = Migrate BetterBibTeX preferences/citation keys
better-bibtex_preferences_advanced_import_export-prefs = 
  .label = Export BetterBibTeX preferences...

better-bibtex_preferences_advanced_import_prefs = 
  .label = Import BetterBibTeX preferences/citation keys...

better-bibtex_preferences_advanced_tab_postscript = postscript

better-bibtex_preferences_advanced_tab_strings = @string definitions

better-bibtex_preferences_auto-abbrev = 
  .label = Automatically abbreviate journal title if none is set explicitly

better-bibtex_collection-menu_auto-export =
  .label = Automatic export
better-bibtex_collection-menu_auto-export_path =
  .label = { $path }

better-bibtex_preferences_auto-abbrev_style = Abbreviation style:
better-bibtex_preferences_auto-export = Automatic export

better-bibtex_preferences_auto-export_delay = Delay auto-export for

better-bibtex_preferences_auto-export_explanation = You can only review and remove exports here. To add an auto-export, perform an export as usual and check the 'Keep updated' option presented there.
better-bibtex_preferences_auto-export_fields_cached = 
  .label = Cached

better-bibtex_preferences_auto-export_fields_error = Error
better-bibtex_preferences_auto-export_fields_journal-abbrev = 
  .label = Use journal abbreviations

better-bibtex_preferences_auto-export_fields_notes = 
  .label = Export notes

better-bibtex_preferences_auto-export_fields_recursive = 
  .label = Export all child collections

better-bibtex_preferences_auto-export_git_message = { $type } updated by Better BibTeX for Zotero
better-bibtex_preferences_auto-export_idle =
  .label = When Idle
better-bibtex_preferences_auto-export_immediate =
  .label = On Change
better-bibtex_preferences_auto-export_off =
  .label = Paused
better-bibtex_preferences_auto-export_remove = 
  .label = Remove

better-bibtex_preferences_auto-export_run = 
  .label = Export now

better-bibtex_preferences_auto-export_status = Status
better-bibtex_preferences_auto-export_status_done = done
better-bibtex_preferences_auto-export_status_error = error
better-bibtex_preferences_auto-export_status_preparing = preparing { $translator }
better-bibtex_preferences_auto-export_status_preparing_delayed = preparing { $translator }, { $pending } exports pending
better-bibtex_preferences_auto-export_status_running = running
better-bibtex_preferences_auto-export_status_scheduled = scheduled
better-bibtex_preferences_auto-export_target = Output file
better-bibtex_preferences_auto-export_translator = Format
better-bibtex_preferences_auto-export_type_collection = Collection
better-bibtex_preferences_auto-export_type_library = Library
better-bibtex_preferences_auto-export_updated = Updated
better-bibtex_preferences_bulk-warning = Warn me when changing citation keys in bulk
better-bibtex_preferences_citekey_auto-pin-delay = Automatically fill citation key after
better-bibtex_preferences_citekey_aux-scanner_import = 
  .label = When scanning an AUX file, attempt to import entries from the attached bib file when their citation keys are not in Zotero

better-bibtex_preferences_citekey_fold = 
  .label = Force citation key to plain text

better-bibtex_preferences_citekey_format = Citation key formula
better-bibtex_preferences_citekey_format_installed = Active citation key formula
better-bibtex_preferences_citekey_dynamic =
  .label = Regenerate citation key when item changes

better-bibtex_preferences_citekey_uniqueness = 
  .label = Keeping citation keys unique

better-bibtex_preferences_citekey_uniqueness_case =
  .label = Ignore upper/lowercase when comparing for uniqueness
better-bibtex_preferences_citekey_uniqueness_conflict = When a citation key is set that is already in use in other items, the keys of these other items will be
better-bibtex_preferences_citekey_uniqueness_conflict_change =
  .label = postfixed (causes key changes)
better-bibtex_preferences_citekey_uniqueness_conflict_keep =
  .label = kept (causes key duplicates)

better-bibtex_preferences_citekey_uniqueness_scope = Keep keys unique
better-bibtex_preferences_citekey_uniqueness_scope_global =
  .label = across all libraries
better-bibtex_preferences_citekey_uniqueness_scope_library =
  .label = within each library

better-bibtex_preferences_export_automatic-tags = 
  .label = Include automatic tags in export

better-bibtex_preferences_export_biblatex_ascii = 
  .label = Export unicode as plain-text latex commands

better-bibtex_preferences_export_biblatex_biblatex-extract-eprint = 
  .label = Extract JSTOR/Google Books/PubMed info from the URL field into eprint fields

better-bibtex_preferences_export_biblatex_extended-name-format = 
  .label = Use BibLaTeX extended name format (requires biblatex 3.5)

better-bibtex_preferences_export_bibtex_ascii = 
  .label = Export unicode as plain-text latex commands (recommended)

better-bibtex_preferences_export_biblatex_use-prefix =
  .label = add use-prefix when family name has a prefix

better-bibtex_preferences_export_bibtex_urls = Add URLs to BibTeX export
better-bibtex_preferences_export_bibtex_urls_note =
  .label = in the 'note' field
better-bibtex_preferences_export_bibtex_urls_off =
  .label = no
better-bibtex_preferences_export_bibtex_urls_url =
  .label = in the 'url' field

better-bibtex_preferences_export_bibtex_url-package =
  .label = Assume the 'url' package is loaded

better-bibtex_preferences_export_sort = Sort TeX/CSL output (useful if you use version control on the output):
better-bibtex_preferences_export_sort_off =
  .label = off (fastest)
better-bibtex_preferences_export_sort_id =
  .label = item creation order (plenty fast)
better-bibtex_preferences_export_sort_citekey =
  .label = citation key (slower on very large libraries)

better-bibtex_preferences_export_fields = Fields

better-bibtex_preferences_export_fields_bibtex-edition-ordinal = 
  .label = Export numeric edition as English-written ordinals

better-bibtex_preferences_export_fields_bibtex-particle-no-op = 
  .label = Disregard name prefixes when sorting

better-bibtex_preferences_export_fields_doi-and-url = When an item has both a DOI and a URL, export
better-bibtex_preferences_export_fields_doi-and-url_both =
  .label = both

better-bibtex_preferences_export_fields_doi-and-url_warning = Most BibTeX styles do not support DOI/URL fields. Of the styles that do support them, many forget to load the required 'url' package, so make sure to load it yourself. DOI and URL fields are so-called 'verbatim' fields, and without the 'url' package loaded compilation will likely fail.

better-bibtex_preferences_export_fields_export-strings = If a field could be a @string reference, export it as an unbraced @string reference
better-bibtex_preferences_export_fields_export-strings_detect =
  .label = Assume single-word fields to be @string vars
better-bibtex_preferences_export_fields_export-strings_match =
  .label = Match against the @string declarations below
better-bibtex_preferences_export_fields_export-strings_match_reverse =
  .label = Match against the @string declarations and their values below
better-bibtex_preferences_export_fields_export-strings_off =
  .label = No
better-bibtex_preferences_export_fields_import-strings = 
  .label = Expand the @string vars below during imports

better-bibtex_preferences_export_fields_language = Export language as
better-bibtex_preferences_export_fields_language_both =
  .label = both

better-bibtex_preferences_export_fields_skip = Fields to omit from export (comma-separated)

better-bibtex_preferences_export_jabref-format = Include JabRef-specific metadata:
better-bibtex_preferences_export_jabref-format_0 =
  .label = no
better-bibtex_preferences_export_jabref-format_3 =
  .label = for JabRef 3
better-bibtex_preferences_export_jabref-format_4 =
  .label = for JabRef 4
better-bibtex_preferences_export_jabref-format_5 =
  .label = for JabRef 5

better-bibtex_preferences_export_jabref-format_warn = Export JabRef-specific fields: timestamps, titles for attachments, and groups for each collection an item is part of. Note that having this on will disable caching in exports, which is really undesirable specifically for auto-exports.

better-bibtex_preferences_export_quality-report = 
  .label = Include comments about potential problems with the exported entries

better-bibtex_preferences_export_quick-copy = Quick-Copy
better-bibtex_preferences_export_quick-copy_explanation = Quick-Copy/drag-and-drop citations
better-bibtex_preferences_export_quick-copy_format = Quick-Copy format

better-bibtex_preferences_export_quick-copy_latex =
  .label = LaTeX citation
better-bibtex_preferences_export_quick-copy_citekeys =
  .label = Citation Keys
better-bibtex_preferences_export_quick-copy_eta =
  .label = Eta template
better-bibtex_preferences_export_quick-copy_org-ref =
  .label = org-ref citation
better-bibtex_preferences_export_quick-copy_org-ref3 =
  .label = org-ref v3 citation
better-bibtex_preferences_export_quick-copy_org-mode_cite =
  .label = Org-mode citation link
better-bibtex_preferences_export_quick-copy_org-mode =
  .label = Org-mode select link
better-bibtex_preferences_export_quick-copy_pandoc =
  .label = Pandoc citation
better-bibtex_preferences_export_quick-copy_roam-cite-key =
  .label = Roam Citation Key
better-bibtex_preferences_export_quick-copy_rtf-scan =
  .label = RTF Scan marker
better-bibtex_preferences_export_quick-copy_select-link =
  .label = Zotero select link

better-bibtex_preferences_export_quick-copy_org-mode_citekey =
  .label = using Better BibTeX citation key
better-bibtex_preferences_export_quick-copy_org-mode_zotero =
  .label = using Zotero item key
better-bibtex_preferences_export_quick-copy_pandoc_brackets = 
  .label = Surround Pandoc citations with brackets
better-bibtex_preferences_export_quick-copy_select-link_citekey =
  .label = using Better BibTeX citation key
better-bibtex_preferences_export_quick-copy_select-link_zotero =
  .label = using Zotero item key

better-bibtex_preferences_export_quick-copy_latex_command = LaTeX command
better-bibtex_preferences_export_quick-copy_eta-template = Eta template

better-bibtex_preferences_open = 
  .label = Open Better BibTeX preferences...

better-bibtex_preferences_postscript_warn = 
  .value = Use of 'Translator.options.exportPath' in postscripts disables the cache. Exports will be substantially slower.

better-bibtex_preferences_prefpane_loading = Better BibTeX is loading
better-bibtex_preferences_rescan-citekeys = 
  .label = Re-scan citekeys

better-bibtex_preferences_reset-cache = 
  .label = Reset cache on next start

better-bibtex_preferences_tab_auto-export = Automatic export

better-bibtex_preferences_tab_citekey = Citation keys

better-bibtex_preferences_tab_export = Export

better-bibtex_preferences_tab_import = Import

better-bibtex_preferences_tab_misc = Miscellaneous

better-bibtex_report-errors =
  .label = Send Better BibTeX debug log...
better-bibtex_server-url = 
  .title = Better BibTeX export via HTTP
  .buttonlabelaccept = OK

better-bibtex_server-url_description = Download URL:
better-bibtex_server-url_format = Download items as
better-bibtex_server-url_or = or
better-bibtex_startup_auto-export = Starting auto-export
better-bibtex_startup_auto-export_load = Initializing auto-export
better-bibtex_startup_installing-translators = Installing bundled translators
better-bibtex_startup_journal-abbrev = Loading journal abbreviator
better-bibtex_startup_key-manager = Starting key manager
better-bibtex_startup_serialization-cache = Starting serialisation cache
better-bibtex_startup_waiting-for-zotero = Waiting for Zotero database
better-bibtex_translate_error_target_no_parent = { $path } does not have a parent folder
better-bibtex_translate_error_target_not_a_file = { $path } exists but is not a file
better-bibtex_units_seconds = seconds
better-bibtex_workers_status = Total background exports started: { $total }, currently running: { $running }
better-bibtex_zotero-pane_add-citation-links =
  .label = Citation Graph: add citation links...
better-bibtex_zotero-pane_citekey_pin_inspire-hep =
  .label = Set BibTeX key from InspireHEP
better-bibtex_zotero-pane_citekey_pin =
  .label = Pin BibTeX key
better-bibtex_zotero-pane_citekey_refresh =
  .label = Regenerate BibTeX key
better-bibtex_zotero-pane_citekey_fill =
  .label = Generate missing BibTeX key
better-bibtex_zotero-pane_bibtex_to_clipboard =
  .label = 🅱 copy BibTeX to clipboard
better-bibtex_zotero-pane_biblatex_to_clipboard =
  .label = 🅱 copy BibLaTeX to clipboard
better-bibtex_zotero-pane_column_citekey = { -citation-key }
better-bibtex_zotero-pane_patch-dates =
  .label = Copy date-added/date-modified from extra field
better-bibtex_zotero-pane_sentence-case =
  .label = BBT Sentence-case
better-bibtex_zotero-pane_show_collection-key =
  .label = Download Better BibTeX export...
better-bibtex_zotero-pane_tag_duplicates = Tag duplicate citation keys
better-bibtex_zotero-pane_tex-studio =
  .label = Push entries to TeXstudio

betterbibtex-item-pane-header = { -citation-key }

