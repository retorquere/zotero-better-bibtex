import { log } from './logger'

declare const Localization: any

const strings = new Localization(['better-bibtex.ftl'])

const localized: Record<string, string> = {}

export async function localizeAsync(id_with_branch: string): Promise<string> {
  if (localized[id_with_branch]) return

  try {
    if (id_with_branch.includes('.')) {
      const [ id, branch ] = id_with_branch.split('.')
      const messages = strings.formatMessages([{ id }])
      localized[id_with_branch] = messages[0].attributes[0][branch] as string || `!! ${id_with_branch}`
    }
    else {
      localized[id_with_branch] = await strings.formatValue(id_with_branch, {}) as string || `!! ${id_with_branch}`
    }
  }
  catch (err) {
    log.error('l10n.localizeAsync error:', id_with_branch, err)
    localized[id_with_branch] = `!! ${id_with_branch}`
  }
}

export function localize(id_with_branch: string, params?: Record<string, string | number>): string {
  const l = localized[id_with_branch] || `?? ${id_with_branch}`
  return params ? l.replace(/[{]\s*[$]([a-z]+)\s*[}]/gi, (m, term) => typeof params[term] === 'undefined' ? m : `${params[term]}`) : l
}

export async function initialize(): Promise<void> {
  const load = [
    localizeAsync('better-bibtex_auto-export_delete_confirm'),
    localizeAsync('better-bibtex_aux-scan_prompt'),
    localizeAsync('better-bibtex_aux-scanner'),
    localizeAsync('better-bibtex_bulk-keys-confirm_stop_asking'),
    localizeAsync('better-bibtex_bulk-keys-confirm_warning'),
    localizeAsync('better-bibtex_citekey_pin'),
    localizeAsync('better-bibtex_citekey_set'),
    localizeAsync('better-bibtex_citekey_set_change'),
    localizeAsync('better-bibtex_citekey_set_toomany'),
    localizeAsync('better-bibtex_error-report_better-bibtex_cache'),
    localizeAsync('better-bibtex_error-report_better-bibtex_cache'),
    localizeAsync('better-bibtex_error-report_better-bibtex_current'),
    localizeAsync('better-bibtex_error-report_better-bibtex_latest'),
    localizeAsync('better-bibtex_error-report_better-bibtex_current_zotero'),
    localizeAsync('better-bibtex_error-report_better-bibtex_latest_zotero'),
    localizeAsync('better-bibtex_export-options_biblatexAPA'),
    localizeAsync('better-bibtex_export-options_biblatexChicago'),
    localizeAsync('better-bibtex_export-options_keep-updated'),
    localizeAsync('better-bibtex_export-options_reminder'),
    localizeAsync('better-bibtex_export-options_reminder'),
    localizeAsync('better-bibtex_export-options_worker'),
    localizeAsync('better-bibtex_preferences_auto-export_git_message'),
    localizeAsync('better-bibtex_preferences_auto-export_status_preparing'),
    localizeAsync('better-bibtex_preferences_auto-export_status_preparing_delayed'),
    localizeAsync('better-bibtex_report-errors'),
    localizeAsync('better-bibtex_translate_error_target_no_parent'),
    localizeAsync('better-bibtex_translate_error_target_not_a_file'),
    localizeAsync('better-bibtex_zotero-pane_add-citation-links'),
    localizeAsync('better-bibtex_zotero-pane_biblatex_to_clipboard'),
    localizeAsync('better-bibtex_zotero-pane_bibtex_to_clipboard'),
    localizeAsync('better-bibtex_zotero-pane_citekey_pin_inspire-hep'),
    localizeAsync('better-bibtex_zotero-pane_citekey_refresh'),
    localizeAsync('better-bibtex_zotero-pane_column_citekey'),
    localizeAsync('better-bibtex_zotero-pane_patch-dates'),
    localizeAsync('better-bibtex_zotero-pane_sentence-case'),
    localizeAsync('better-bibtex_zotero-pane_show_collection-key'),
    localizeAsync('better-bibtex_zotero-pane_tag_duplicates'),
    localizeAsync('better-bibtex_zotero-pane_tex-studio'),
    localizeAsync('zotero-collectionmenu-bbt-autoexport'),
    localizeAsync('better-bibtex-error-send-reminder'),
  ]
  for (const ext of ['aux', 'md']) {
    load.push(localizeAsync(`better-bibtex_aux-scan_title_${ext}`))
  }
  for (const status of ['done', 'error', 'preparing', 'preparing_delayed', 'running', 'scheduled']) {
    load.push(localizeAsync(`better-bibtex_preferences_auto-export_status_${ status }`))
  }
  for (const type of ['collection', 'library']) {
    load.push(localizeAsync(`better-bibtex_preferences_auto-export_type_${ type }`))
  }
  await Promise.all(load)
}
