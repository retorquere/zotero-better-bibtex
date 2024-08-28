-citation-key = Citation key
better-bibtex_auto-export_delete = Deleting auto-export
better-bibtex_auto-export_delete_confirm = Are you sure you want to delete this auto-export? This cannot be undone.
better-bibtex_aux-scan_prompt = Tag name
better-bibtex_aux-scan_title_aux = Tag cited items from AUX file
better-bibtex_aux-scan_title_md = Tag cited items from Markdown file
better-bibtex_aux-scanner = Scan BibTeX AUX/Markdown file for references...
better-bibtex_bulk-keys-confirm_warning = You are changing more than { $treshold } items in one go. Are you sure?
better-bibtex_bulk-keys-confirm_stop_asking = OK, and don't ask me again

better-bibtex_citekey_pin = Pin BibTeX key
better-bibtex_citekey_set = Change BibTeX key...
better-bibtex_citekey_set_change = Change BibTeX key to
better-bibtex_citekey_set_toomany = Can only change one key at a time
better-bibtex_error-report = 
  .title = Better BibTeX debug log

better-bibtex_error-report_better-bibtex_cache = Cache size: { $entries } entries.
better-bibtex_error-report_better-bibtex_oom = Zotero is out of memory! Zotero on Windows has memory use restrictions that will be ameliorated by Zotero 7. In the mean time, please turn off Better BibTeX caching and restart Zotero.
  .value = { better-bibtex_error-report_better-bibtex_oom }
better-bibtex_error-report_better-bibtex_current = You are running Better BibTeX version { $version }
better-bibtex_error-report_better-bibtex_latest = The latest Better BibTeX version is { $version }
better-bibtex_error-report_context = 
  .label = Application context

better-bibtex_error-report_debug = 
  .label = Debug log


better-bibtex_error-report_enable-debug = Zotero debug logging is currently disabled. It will be easier to diagnose the problem if you enable it before submitting a debug log.
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

better-bibtex_error-report_not-reviewed = Debug logs cannot be reviewed unless referred to in the GitHub issue tracker by their ID.

better-bibtex_error-report_post-to-git-hub = Please post a message to the issue tracker (https://github.com/retorquere/zotero-better-bibtex/issues) with this debug log ID, a description of the problem, and any steps necessary to reproduce it.
better-bibtex_error-report_report-id = Debug log ID:
better-bibtex_error-report_restart-with-logging-enabled = 
  .label = Restart with Logging Enabled…


better-bibtex_error-report_review = The data below is about to submitted to Better BibTeX for debugging. You can preview the data here, or save a copy of the log to get the precise data about to be sent, to see whether there's sensitive information that you do not wish to send. Please think carefully about whether unchecking options below is necessary for your environment. We will generally needs more communication (= time) if you remove parts of the log this way.
    
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
better-bibtex_item-pane_info_citation-key =
  .label = { -citation-key }

better-bibtex_preferences_advanced_export_brace-protection = 
  .label = Apply case-protection to capitalized words by enclosing them in braces

better-bibtex_preferences_advanced_export_brace-protection_warning = If you're dead-set on ignoring both BibTeX/BibLaTeX best practice (see the BBT FAQ) and the Zotero recommendations on title/sentence casing, you can turn this off to suppress automatic brace-protection for words with uppercase letters.
better-bibtex_preferences_advanced_export_retain-cache = 
  .label = Retain export cache across upgrades


better-bibtex_preferences_advanced_export_retain-cache_warning = By default, BBT clears all caches whenever BBT or Zotero is upgraded. I can't realistically predict whether a change in Zotero or BBT is going to affect the output generated for any given item, so to be sure you always have the latest export-affecting fixes, the caches are discarded when a new version of either is detected. If you have a very large library however, of which you regularly export significant portions, you might want to retain the cached items even if that does come with the risk that you get wrong output on export that has been fixed in the interim.
    
    If you have this on, and you experience any problem that is not the cache getting dropped on upgrade, you *must* clear the cache and reproduce the problem. When you change this setting, as with any setting change, the cache will be dropped.

better-bibtex_preferences_advanced_export_title-case = 
  .label = Apply title-casing to titles


better-bibtex_preferences_advanced_export_title-case_warning = If you're dead-set on ignoring both BibTeX/BibLaTeX best practice (see the BBT FAQ) and the Zotero recommendations on title/sentence casing, you can turn this off to suppress title casing for English items
better-bibtex_preferences_advanced_export_workers_cache = 
  .label = Enable caching for background exports

better-bibtex_preferences_advanced_extra-merge = When merging items, also merge:
  .label = { better-bibtex_preferences_advanced_extra-merge }

better-bibtex_preferences_advanced_extra-merge-csl = 
  .label = fields that are understood to be CSL fields by Zotero

better-bibtex_preferences_advanced_extra_merge-citekeys = 
  .label = their citation keys into an bib(la)tex `ids` field

better-bibtex_preferences_advanced_extra_merge-tex = 
  .label = their `tex.*` fields

better-bibtex_preferences_advanced_ideographs = Ideographs in citekeys
  .label = { better-bibtex_preferences_advanced_ideographs }

better-bibtex_preferences_advanced_ideographs_jieba = 
  .label = Enable 'jieba'/'pinyin' filters in citekey patterns. Uses a lot of memory.

better-bibtex_preferences_advanced_ideographs_kuroshiro = 
  .label = Apply kuroshiro romajization in Japanese names/titles. Uses a lot of memory.

better-bibtex_preferences_advanced_import_case-protection = Insert case-protection for braces:
better-bibtex_preferences_advanced_import_case-protection_as-needed = minimal
  .label = { better-bibtex_preferences_advanced_import_case-protection_as-needed }
better-bibtex_preferences_advanced_import_case-protection_off = no
  .label = { better-bibtex_preferences_advanced_import_case-protection_off }
better-bibtex_preferences_advanced_import_case-protection_on = yes
  .label = { better-bibtex_preferences_advanced_import_case-protection_on }

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

better-bibtex_preferences_advanced_import_migrate = Migrate BetterBibTeX preferences/citation keys
better-bibtex_preferences_advanced_import_export-prefs = 
  .label = Export BetterBibTeX preferences...

better-bibtex_preferences_advanced_import_prefs = 
  .label = Import BetterBibTeX preferences/citation keys...

better-bibtex_preferences_advanced_tab_postscript = postscript
  .label = { better-bibtex_preferences_advanced_tab_postscript }

better-bibtex_preferences_advanced_tab_strings = @string definitions
  .label = { better-bibtex_preferences_advanced_tab_strings }

better-bibtex_preferences_auto-abbrev = 
  .label = Automatically abbreviate journal title if none is set explicitly

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
better-bibtex_preferences_auto-export_idle = When Idle
  .label = { better-bibtex_preferences_auto-export_idle }
better-bibtex_preferences_auto-export_immediate = On Change
  .label = { better-bibtex_preferences_auto-export_immediate }
better-bibtex_preferences_auto-export_off = Paused
  .label = { better-bibtex_preferences_auto-export_off }
better-bibtex_preferences_auto-export_remove = 
  .label = Remove

better-bibtex_preferences_auto-export_run = 
  .label = Export now

better-bibtex_preferences_auto-export_status = Status
better-bibtex_preferences_auto-export_status_done = done
better-bibtex_preferences_auto-export_status_error = error
better-bibtex_preferences_auto-export_status_preparing = preparing
better-bibtex_preferences_auto-export_status_running = running
better-bibtex_preferences_auto-export_status_scheduled = scheduled
better-bibtex_preferences_auto-export_target = Output file
better-bibtex_preferences_auto-export_translator = Format
better-bibtex_preferences_auto-export_type_collection = Collection
better-bibtex_preferences_auto-export_type_library = Library
better-bibtex_preferences_auto-export_updated = Updated
better-bibtex_preferences_bulk-warning = Warn me when changing citation keys in bulk
better-bibtex_preferences_citekey_auto-pin-delay = Automatically pin citation key after
better-bibtex_preferences_citekey_aux-scanner_import = 
  .label = When scanning an AUX file, attempt to import entries from the attached bib file when their citation keys are not in Zotero

better-bibtex_preferences_citekey_fold = 
  .label = Force citation key to plain text

better-bibtex_preferences_citekey_format = Citation key formula
better-bibtex_preferences_citekey_format_installed = Active citation key formula
better-bibtex_preferences_citekey_search = 
  .label = Enable citation key search

better-bibtex_preferences_citekey_uniqueness = 
  .label = Keeping citation keys unique

better-bibtex_preferences_citekey_uniqueness_case =
  .label = Ignore upper/lowercase when comparing for uniqueness
better-bibtex_preferences_citekey_uniqueness_conflict = On conflict with a pinned key, non-pinned keys will be
better-bibtex_preferences_citekey_uniqueness_conflict_change = postfixed (causes key changes)
  .label = { better-bibtex_preferences_citekey_uniqueness_conflict_change }
better-bibtex_preferences_citekey_uniqueness_conflict_keep = kept (causes key duplicates)
  .label = { better-bibtex_preferences_citekey_uniqueness_conflict_keep }

better-bibtex_preferences_citekey_uniqueness_scope = Keep keys unique
better-bibtex_preferences_citekey_uniqueness_scope_global = across all libraries
  .label = { better-bibtex_preferences_citekey_uniqueness_scope_global }
better-bibtex_preferences_citekey_uniqueness_scope_library = within each library
  .label = { better-bibtex_preferences_citekey_uniqueness_scope_library }

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

better-bibtex_preferences_export_bibtex_urls = Add URLs to BibTeX export
better-bibtex_preferences_export_bibtex_urls_note = in the 'note' field
  .label = { better-bibtex_preferences_export_bibtex_urls_note }
better-bibtex_preferences_export_bibtex_urls_note-url-ish = in the 'note' field, but assuming the 'url' package is not loaded
  .label = { better-bibtex_preferences_export_bibtex_urls_note-url-ish }
better-bibtex_preferences_export_bibtex_urls_off = no
  .label = { better-bibtex_preferences_export_bibtex_urls_off }
better-bibtex_preferences_export_bibtex_urls_url = in the 'url' field
  .label = { better-bibtex_preferences_export_bibtex_urls_url }
better-bibtex_preferences_export_bibtex_urls_url-ish = in the 'url' field, but assuming the 'url' package is not loaded
  .label = { better-bibtex_preferences_export_bibtex_urls_url-ish }

better-bibtex_preferences_export_sort = Sort TeX/CSL output (useful if you use version control on the output):
better-bibtex_preferences_export_sort_off = off (fastest)
  .label = { better-bibtex_preferences_export_sort_off }
better-bibtex_preferences_export_sort_id = item creation order (plenty fast)
  .label = { better-bibtex_preferences_export_sort_id }
better-bibtex_preferences_export_sort_citekey = citation key (slower on very large libraries)
  .label = { better-bibtex_preferences_export_sort_citekey }

better-bibtex_preferences_export_fields = Fields
  .label = { better-bibtex_preferences_export_fields }

better-bibtex_preferences_export_fields_bibtex-edition-ordinal = 
  .label = Export numeric edition as English-written ordinals

better-bibtex_preferences_export_fields_bibtex-particle-no-op = 
  .label = Disregard name prefixes when sorting

better-bibtex_preferences_export_fields_doi-and-url = When an item has both a DOI and a URL, export
better-bibtex_preferences_export_fields_doi-and-url_both = both
  .label = { better-bibtex_preferences_export_fields_doi-and-url_both }
better-bibtex_preferences_export_fields_doi-and-url_doi = DOI
  .label = { better-bibtex_preferences_export_fields_doi-and-url_doi }
better-bibtex_preferences_export_fields_doi-and-url_url = URL
  .label = { better-bibtex_preferences_export_fields_doi-and-url_url }

better-bibtex_preferences_export_fields_doi-and-url_warning = Most BibTeX styles do not support DOI/URL fields. Of the styles that do support them, many forget to load the required 'url' package, so make sure to load it yourself. DOI and URL fields are so-called 'verbatim' fields, and without the 'url' package loaded compilation will likely fail.

better-bibtex_preferences_export_fields_export-strings = If a field could be a @string reference, export it as an unbraced @string reference
better-bibtex_preferences_export_fields_export-strings_detect = Assume single-word fields to be @string vars
  .label = { better-bibtex_preferences_export_fields_export-strings_detect }
better-bibtex_preferences_export_fields_export-strings_match = Match against the @string declarations below
  .label = { better-bibtex_preferences_export_fields_export-strings_match }
better-bibtex_preferences_export_fields_export-strings_match_reverse = Match against the @string declarations and their values below
  .label = { better-bibtex_preferences_export_fields_export-strings_match_reverse }
better-bibtex_preferences_export_fields_export-strings_off = No
  .label = { better-bibtex_preferences_export_fields_export-strings_off }
better-bibtex_preferences_export_fields_import-strings = 
  .label = Expand the @string vars below during imports

better-bibtex_preferences_export_fields_language = Export language as
better-bibtex_preferences_export_fields_language_both = both
  .label = { better-bibtex_preferences_export_fields_language_both }

better-bibtex_preferences_export_fields_skip = Fields to omit from export (comma-separated)

better-bibtex_preferences_export_jabref-format = Include JabRef-specific metadata:
better-bibtex_preferences_export_jabref-format_0 = no
  .label = { better-bibtex_preferences_export_jabref-format_0 }
better-bibtex_preferences_export_jabref-format_3 = for JabRef 3
  .label = { better-bibtex_preferences_export_jabref-format_3 }
better-bibtex_preferences_export_jabref-format_4 = for JabRef 4
  .label = { better-bibtex_preferences_export_jabref-format_4 }
better-bibtex_preferences_export_jabref-format_5 = for JabRef 5
  .label = { better-bibtex_preferences_export_jabref-format_5 }

better-bibtex_preferences_export_jabref-format_warn = Export JabRef-specific fields: timestamps, titles for attachments, and groups for each collection an item is part of. Note that having this on will disable caching in exports, which is really undesirable specifically for auto-exports.

better-bibtex_preferences_export_quality-report = 
  .label = Include comments about potential problems with the exported entries

better-bibtex_preferences_export_quick-copy = Quick-Copy
  .label = { better-bibtex_preferences_export_quick-copy }
better-bibtex_preferences_export_quick-copy_explanation = Quick-Copy/drag-and-drop citations
better-bibtex_preferences_export_quick-copy_format = Quick-Copy format
better-bibtex_preferences_export_quick-copy_citekeys = Cite Keys
  .label = { better-bibtex_preferences_export_quick-copy_citekeys }
better-bibtex_preferences_export_quick-copy_eta-template = Eta template
  .label = { better-bibtex_preferences_export_quick-copy_eta-template }
better-bibtex_preferences_export_quick-copy_latex = LaTeX citation
  .label = { better-bibtex_preferences_export_quick-copy_latex }
better-bibtex_preferences_export_quick-copy_latex_command = LaTeX command
  .label = { better-bibtex_preferences_export_quick-copy_latex_command }
better-bibtex_preferences_export_quick-copy_org-mode = Org-mode select link
  .label = { better-bibtex_preferences_export_quick-copy_org-mode }
better-bibtex_preferences_export_quick-copy_org-mode_citekey = using Better BibTeX citation key
  .label = { better-bibtex_preferences_export_quick-copy_org-mode_citekey }
better-bibtex_preferences_export_quick-copy_org-mode_zotero = using Zotero item key
  .label = { better-bibtex_preferences_export_quick-copy_org-mode_zotero }
better-bibtex_preferences_export_quick-copy_org-ref = org-ref citation
  .label = { better-bibtex_preferences_export_quick-copy_org-ref }
better-bibtex_preferences_export_quick-copy_org-ref3 = org-ref v3 citation
  .label = { better-bibtex_preferences_export_quick-copy_org-ref3 }
better-bibtex_preferences_export_quick-copy_pandoc = Pandoc citation
  .label = { better-bibtex_preferences_export_quick-copy_pandoc }
better-bibtex_preferences_export_quick-copy_pandoc_brackets = 
  .label = Surround Pandoc citations with brackets
better-bibtex_preferences_export_quick-copy_roam-cite-key = Roam Cite Key
  .label = { better-bibtex_preferences_export_quick-copy_roam-cite-key }
better-bibtex_preferences_export_quick-copy_rtf-scan = RTF Scan marker
  .label = { better-bibtex_preferences_export_quick-copy_rtf-scan }
better-bibtex_preferences_export_quick-copy_select-link = Zotero select link
  .label = { better-bibtex_preferences_export_quick-copy_select-link }
better-bibtex_preferences_export_quick-copy_select-link_citekey = using Better BibTeX citation key
  .label = { better-bibtex_preferences_export_quick-copy_select-link_citekey }
better-bibtex_preferences_export_quick-copy_select-link_zotero = using Zotero item key
  .label = { better-bibtex_preferences_export_quick-copy_select-link_zotero }

better-bibtex_preferences_open = 
  .label = Open Better BibTeX preferences...

better-bibtex_preferences_postscript_warn = 
  .value = Use of 'Translator.options.exportPath' in postscripts disables the cache. Exports will be substantially slower.

better-bibtex_preferences_prefpane_loading = Better BibTeX is loading
better-bibtex_preferences_rescan-citekeys = 
  .label = Re-scan pinned citekeys

better-bibtex_preferences_reset-cache = 
  .label = Reset cache

better-bibtex_preferences_tab_auto-export = Automatic export
  .label = { better-bibtex_preferences_tab_auto-export }

better-bibtex_preferences_tab_citekey = Citation keys
  .label = { better-bibtex_preferences_tab_citekey }

better-bibtex_preferences_tab_export = Export
  .label = { better-bibtex_preferences_tab_export }

better-bibtex_preferences_tab_import = Import
  .label = { better-bibtex_preferences_tab_import }

better-bibtex_preferences_tab_misc = Miscellaneous
  .label = { better-bibtex_preferences_tab_misc }

better-bibtex_report-errors = Send Better BibTeX debug log...
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
better-bibtex_zotero-pane_add-citation-links = Citation Graph: add citation links...
better-bibtex_zotero-pane_citekey_pin_inspire-hep = Pin BibTeX key from InspireHEP
better-bibtex_zotero-pane_citekey_refresh = Refresh BibTeX key
better-bibtex_zotero-pane_citekey_unpin = Unpin BibTeX key
better-bibtex_zotero-pane_bibtex_to_clipboard = Copy BibTeX to clipboard
better-bibtex_zotero-pane_biblatex_to_clipboard = Copy BibLaTeX to clipboard
better-bibtex_zotero-pane_column_citekey = { -citation-key }
better-bibtex_zotero-pane_patch-dates = Copy date-added/date-modified from extra field
better-bibtex_zotero-pane_sentence-case = BBT Sentence-case
better-bibtex_zotero-pane_show_collection-key = Download Better BibTeX export...
better-bibtex_zotero-pane_tag_duplicates = Tag duplicate citation keys
better-bibtex_zotero-pane_tex-studio = Push entries to TeXstudio

betterbibtex-item-pane-header = { -citation-key }

