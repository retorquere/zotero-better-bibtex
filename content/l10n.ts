import { log } from './logger'

declare const Localization: any

const strings = new Localization(['better-bibtex.ftl'])

const localized: Record<string, string> = {}

async function prelocalize(id_with_branch: string): Promise<void> {
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
    log.error('l10n.prelocalize error:', id_with_branch, err)
    localized[id_with_branch] = `!! ${id_with_branch}`
  }
}

export function localize(id_with_branch: string, params?: Record<string, string | number>): string {
  const l = localized[id_with_branch] || `?? ${id_with_branch}`
  return params ? l.replace(/[{]\s*[$]([a-z]+)\s*[}]/gi, (m, term) => typeof params[term] === 'undefined' ? m : `${params[term]}`) : l
}

export async function initialize(): Promise<void> {
  const load = [
    prelocalize('better-bibtex_auto-export_delete_confirm'),
    prelocalize('better-bibtex_aux-scan_prompt'),
    prelocalize('better-bibtex_aux-scanner'),
    prelocalize('better-bibtex_bulk-keys-confirm_stop_asking'),
    prelocalize('better-bibtex_bulk-keys-confirm_warning'),
    prelocalize('better-bibtex_citekey_pin'),
    prelocalize('better-bibtex_citekey_set'),
    prelocalize('better-bibtex_citekey_set_change'),
    prelocalize('better-bibtex_citekey_set_toomany'),
    prelocalize('better-bibtex_error-report_better-bibtex_cache'),
    prelocalize('better-bibtex_error-report_better-bibtex_cache'),
    prelocalize('better-bibtex_error-report_better-bibtex_current'),
    prelocalize('better-bibtex_error-report_better-bibtex_latest'),
    prelocalize('better-bibtex_export-options_biblatexAPA'),
    prelocalize('better-bibtex_export-options_biblatexChicago'),
    prelocalize('better-bibtex_export-options_keep-updated'),
    prelocalize('better-bibtex_export-options_reminder'),
    prelocalize('better-bibtex_export-options_reminder'),
    prelocalize('better-bibtex_export-options_worker'),
    prelocalize('better-bibtex_preferences_auto-export_git_message'),
    prelocalize('better-bibtex_preferences_auto-export_status_preparing'),
    prelocalize('better-bibtex_preferences_auto-export_status_preparing_delayed'),
    prelocalize('better-bibtex_report-errors'),
    prelocalize('better-bibtex_translate_error_target_no_parent'),
    prelocalize('better-bibtex_translate_error_target_not_a_file'),
    prelocalize('better-bibtex_zotero-pane_add-citation-links'),
    prelocalize('better-bibtex_zotero-pane_biblatex_to_clipboard'),
    prelocalize('better-bibtex_zotero-pane_bibtex_to_clipboard'),
    prelocalize('better-bibtex_zotero-pane_citekey_pin_inspire-hep'),
    prelocalize('better-bibtex_zotero-pane_citekey_refresh'),
    prelocalize('better-bibtex_zotero-pane_column_citekey'),
    prelocalize('better-bibtex_zotero-pane_patch-dates'),
    prelocalize('better-bibtex_zotero-pane_sentence-case'),
    prelocalize('better-bibtex_zotero-pane_show_collection-key'),
    prelocalize('better-bibtex_zotero-pane_tag_duplicates'),
    prelocalize('better-bibtex_zotero-pane_tex-studio'),
    prelocalize('zotero-collectionmenu-bbt-autoexport'),
  ]
  for (const ext of ['aux', 'md']) {
    load.push(prelocalize(`better-bibtex_aux-scan_title_${ext}`))
  }
  for (const status of ['done', 'error', 'preparing', 'preparing_delayed', 'running', 'scheduled']) {
    load.push(prelocalize(`better-bibtex_preferences_auto-export_status_${ status }`))
  }
  for (const type of ['collection', 'library']) {
    load.push(prelocalize(`better-bibtex_preferences_auto-export_type_${ type }`))
  }
  await Promise.all(load)
}
