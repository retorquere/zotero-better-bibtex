import { Path } from './file';
import { log } from './logger';
import { Preference } from './prefs';
import { defaults as preferenceDefaults } from '../gen/preferences/meta';
import { Formatter } from './key-manager/formatter';
import { AutoExport } from './auto-export';
import { Translators } from './translators';
import * as l10n from './l10n';
import { Events } from './events';
import { FilePickerHelper } from 'zotero-plugin-toolkit';
import { flash } from './flash';
import { icons } from './icons';
import { Cache } from './translators/worker';
Events.on('preference-changed', ({ data: pref }) => {
    switch (pref) {
        case 'citekeyFormatEditing':
            Zotero.BetterBibTeX.PrefPane.checkCitekeyFormat();
            break;
        case 'postscript':
            Zotero.BetterBibTeX.PrefPane.checkPostscript();
            break;
        case 'chinese':
            Zotero.BetterBibTeX.PrefPane.window?.document?.getElementById('bbt-chinese-splitname')?.setAttribute('disabled', Preference.chinese ? '' : 'true');
            break;
    }
});
const AutoExportPane = new class $AutoExportPane {
    status;
    get window() {
        return Zotero.BetterBibTeX.PrefPane.window;
    }
    get document() {
        return this.window?.document;
    }
    load() {
        if (!this.status) {
            this.status = {};
            for (const status of ['scheduled', 'running', 'done', 'error', 'preparing']) {
                this.status[status] = l10n.localize(`better-bibtex_preferences_auto-export_status_${status}`);
            }
        }
        this.refresh();
        Events.on('export-progress', async ({ data: { pct, ae } }) => {
            if (ae)
                if (pct >= 100)
                    await this.refresh(ae);
        });
    }
    label(ae) {
        let label = { library: icons.computer, collection: icons.folder }[ae.type];
        label += ` ${this.name(ae, 'short')}`;
        label += ` (${Translators.byId[ae.translatorID].label})`;
        label += ` ${ae.path.replace(Path.home, '~')}`;
        return label;
    }
    refresh(path) {
        if (!this.window)
            return;
        const doc = this.document;
        const auto_exports = AutoExport.all();
        const details = doc.querySelector('#bbt-prefs-auto-exports');
        if (details)
            details.style.display = auto_exports.length ? 'grid' : 'none';
        if (!auto_exports.length)
            return null;
        const menulist = doc.querySelector('#bbt-prefs-auto-export-select');
        const menupopup = doc.querySelector('#bbt-prefs-auto-export-select menupopup');
        let selected;
        if (menulist.selectedItem) {
            const selected$path = menulist.selectedItem.value;
            selected = auto_exports.find(ae => ae.path === selected$path);
        }
        if (!selected && !path)
            selected = auto_exports.sort((a, b) => b.updated - a.updated)[0];
        // list changed
        if (Array.from(menupopup.children).map(ae => ae.value).join('\t') !== auto_exports.map(ae => ae.path).join('\t')) {
            menulist.querySelectorAll('menuitem').forEach(e => e.remove());
            for (const ae of auto_exports) {
                const menuitem = menulist.appendItem(this.label(ae), ae.path);
                if (selected && ae.path === selected.path)
                    menulist.selectedItem = menuitem;
            }
        }
        if (!selected || !menulist.selectedItem) {
            selected = auto_exports[0];
            menulist.selectedIndex = 0;
        }
        if (typeof path === 'string' && path !== selected.path)
            return;
        if (details.getAttribute('data-ae-path') !== selected.path || details.getAttribute('data-ae-updated') !== `${selected.updated}`) {
            details.setAttribute('data-ae-path', selected.path);
            details.setAttribute('data-ae-updated', `${selected.updated}`);
            const displayed = `bbt-autoexport-${Translators.byId[selected.translatorID].label.replace(/ /g, '')}`;
            for (const node of Array.from(details.getElementsByClassName('bbt-autoexport-options'))) {
                node.style.display = node.classList.contains(displayed) ? 'initial' : 'none';
            }
            for (const node of Array.from(details.querySelectorAll('*[data-ae-field]'))) {
                const field = node.getAttribute('data-ae-field');
                switch (field) {
                    case 'type':
                        node.value = `${l10n.localize(`better-bibtex_preferences_auto-export_type_${selected.type}`)}:`;
                        break;
                    case 'name':
                        node.value = this.name(selected, 'long');
                        break;
                    case 'updated':
                        node.value = `${new Date(selected.updated)}`;
                        break;
                    case 'translator':
                        node.value = Translators.byId[selected.translatorID].label;
                        break;
                    case 'path':
                        node.value = selected[field];
                        break;
                    case 'exportNotes':
                    case 'useJournalAbbreviation':
                    case 'asciiBibTeX':
                    case 'bibtexParticleNoOp':
                    case 'asciiBibLaTeX':
                    case 'biblatexExtendedNameFormat':
                    case 'recursive':
                    case 'biblatexAPA':
                    case 'biblatexChicago':
                        node.checked = selected[field];
                        break;
                    case 'DOIandURL':
                    case 'bibtexURL':
                        node.value = selected[field];
                        break;
                    case 'cacherate':
                    case 'status':
                        // always set below on refresh
                        break;
                    default:
                        throw new Error(`Unexpected field in auto-export refresh: ${field}`);
                }
            }
        }
        const status = details.querySelector("*[data-ae-field='status']");
        const progress = AutoExport.progress.get(selected.path);
        if (selected.status === 'running' && typeof progress === 'number') {
            status.value = progress < 0 ? `${icons.running} ${this.status?.preparing || 'preparing'} ${-progress}%` : `${icons.running} ${progress}%`;
        }
        else {
            const icon = {
                running: icons.running,
                done: icons.check,
                scheduled: icons.waiting,
                error: icons.error,
                preparing: `${icons.running}${icons.waiting}`,
            }[selected.status] || selected.status;
            status.value = `${icon} ${selected.error || ''}`.trim();
        }
        const cacherate = details.querySelector("*[data-ae-field='cacherate']");
        cacherate.value = `${Cache.rate[selected.path] || 0}%`;
    }
    async remove() {
        const menulist = this.document.querySelector('#bbt-prefs-auto-export-select');
        if (!menulist.selectedItem)
            return;
        if (!Services.prompt.confirm(null, l10n.localize('better-bibtex_auto-export_delete'), l10n.localize('better-bibtex_auto-export_delete_confirm')))
            return;
        const path = menulist.selectedItem.getAttribute('value');
        await Cache.Exports.dropAutoExport(path, true);
        AutoExport.remove(path);
        await this.refresh();
    }
    async run() {
        const menulist = this.document.querySelector('#bbt-prefs-auto-export-select');
        if (!menulist.selectedItem)
            return;
        AutoExport.run(menulist.selectedItem.getAttribute('value'));
        await this.refresh();
    }
    async edit(node) {
        let path;
        if (!(path = node.getAttribute('data-ae-path'))) {
            const menulist = this.document.querySelector('#bbt-prefs-auto-export-select');
            path = menulist.selectedItem.getAttribute('value');
        }
        await Cache.Exports.dropAutoExport(path, false);
        let value;
        let disable = null;
        const field = node.getAttribute('data-ae-field');
        switch (field) {
            case 'exportNotes':
            case 'useJournalAbbreviation':
            case 'asciiBibTeX':
            case 'bibtexParticleNoOp':
            case 'asciiBibLaTeX':
            case 'biblatexExtendedNameFormat':
            case 'recursive':
            case 'biblatexAPA':
            case 'biblatexChicago':
                value = node.checked;
                if (node.checked && field === 'biblatexAPA') {
                    disable = 'biblatexChicago';
                }
                else if (node.checked && field === 'biblatexChicago') {
                    disable = 'biblatexAPA';
                }
                break;
            case 'DOIandURL':
            case 'bibtexURL':
                value = node.value;
                break;
            default:
                log.error('edit autoexport: unexpected field', field);
        }
        AutoExport.edit(path, field, value);
        if (disable)
            AutoExport.edit(path, disable, false);
        await this.refresh();
    }
    collection(id, form) {
        if (typeof id === 'string')
            id = parseInt(id);
        if (isNaN(id))
            return '';
        const coll = Zotero.Collections.get(id);
        if (!coll)
            return '';
        if (form === 'long') {
            return `${this.collection(coll.parentID, form)} / ${coll.name}`;
        }
        else {
            const lib = Zotero.Libraries.get(coll.libraryID);
            return `${lib ? lib.name : `:${coll.libraryID}`} : ${coll.name}`;
        }
    }
    name(ae, form) {
        switch (ae.type) {
            case 'library': {
                const lib = Zotero.Libraries.get(ae.id);
                return lib ? lib.name : '';
            }
            case 'collection':
                return this.collection(ae.id, form);
            default:
                return ae.path;
        }
    }
};
export const PrefPane = new class $PrefPane {
    autoexport = AutoExportPane;
    #window;
    timer;
    get window() {
        if (this.#window?.closed)
            this.#window = null;
        if (this.#window?.document.readyState !== 'complete')
            return null;
        return this.#window;
    }
    set window(win) {
        this.#window = win;
    }
    get document() {
        return this.window?.document;
    }
    async exportPrefs() {
        let file = await new FilePickerHelper(Zotero.getString('fileInterface.export'), 'save', [['BBT JSON file', '*.json']]).open();
        if (!file)
            return;
        if (!file.match(/.json$/))
            file = `${file}.json`;
        const options = structuredClone(Zotero.BetterBibTeX.lastExport.displayOptions);
        delete options.exportDir;
        delete options.exportPath;
        delete options.keepUpdated;
        delete options.worker;
        Zotero.File.putContents(Zotero.File.pathToFile(file), JSON.stringify({
            config: {
                options,
                preferences: Preference.all,
            },
        }, null, 2));
    }
    async importPrefs() {
        const preferences = {
            path: (await new FilePickerHelper(Zotero.getString('fileInterface.import'), 'open', [['BBT JSON file', '*.json']]).open()) || '',
        };
        if (!preferences.path)
            return;
        try {
            preferences.contents = (await Zotero.File.getContentsAsync(preferences.path, 'utf-8'));
        }
        catch {
            flash(`could not read contents of ${preferences.path}`);
            return;
        }
        try {
            preferences.parsed = JSON.parse(preferences.contents);
        }
        catch {
            flash(`could not parse contents of ${preferences.path}`);
            return;
        }
        if (typeof preferences.parsed?.config?.preferences !== 'object' && !Array.isArray(preferences.parsed.items)) {
            flash(`no preferences or items in ${preferences.path}`);
            return;
        }
        try {
            for (let [pref, value] of Object.entries(preferences.parsed.config.preferences || {})) {
                if (pref === 'citekeyFormatEditing')
                    continue;
                if (pref === 'citekeyFormat')
                    pref = 'citekeyFormatEditing';
                if (typeof value === 'undefined' || typeof value !== typeof preferenceDefaults[pref]) {
                    flash(`Invalid ${typeof value} value for ${pref}, expected ${preferenceDefaults[pref]}`);
                }
                else if (Preference[pref] !== value) {
                    Preference[pref] = value;
                    flash(`${pref} set`, `${pref} set to ${JSON.stringify(value)}`);
                }
            }
        }
        catch (err) {
            flash(err.message);
        }
    }
    checkCitekeyFormat() {
        if (!this.window || Zotero.BetterBibTeX.starting)
            return; // itemTypes not available yet
        const error = Formatter.test(Preference.citekeyFormatEditing || Preference.citekeyFormat);
        const editing = this.document.getElementById('bbt-preferences-citekeyFormatEditing');
        editing.classList[error ? 'add' : 'remove']('bbt-prefs-error');
        editing.setAttribute('title', error);
        editing.setAttribute('tooltip', 'html-tooltip');
        const msg = this.document.getElementById('bbt-citekeyFormat-error');
        msg.value = error;
        msg.style.display = error ? 'initial' : 'none';
        const active = this.document.getElementById('bbt-preferences-citekeyFormat');
        const label = this.document.getElementById('bbt-label-citekeyFormat');
        active.style.display = label.style.display = Preference.citekeyFormat === Preference.citekeyFormatEditing ? 'none' : 'initial';
        if (!error)
            Formatter.update([Preference.citekeyFormatEditing, Preference.citekeyFormat]);
        const preview = this.document.getElementById('bbt-citekey-preview');
        preview.style.display = 'initial';
        const previews = Zotero
            .getActiveZoteroPane()
            .getSelectedItems()
            .slice(0, 10)
            .map(item => Zotero.BetterBibTeX.KeyManager.propose(item))
            .map(key => key);
        preview.value = previews.join(', ');
    }
    checkPostscript() {
        if (!this.window)
            return;
        let error = '';
        try {
            // don't care about the return value, just if it throws an error
            new Function(Preference.postscript);
        }
        catch (err) {
            log.error('PrefPane.checkPostscript: error compiling postscript:', err);
            error = `${err}`;
        }
        const postscript = this.document.getElementById('bbt-postscript');
        postscript.setAttribute('style', (error ? '-moz-appearance: none !important; background-color: DarkOrange' : ''));
        postscript.setAttribute('title', error);
        postscript.setAttribute('tooltip', 'html-tooltip');
        this.document.getElementById('bbt-cache-warn-postscript').setAttribute('hidden', `${!Preference.postscript.includes('Translator.options.exportPath')}`);
    }
    async cacheReset() {
        Preference.cacheDelete = true;
        await Cache.drop();
    }
    load(win) {
        this.#window = win;
        win.addEventListener('unload', _event => {
            this.#window = null;
            if (typeof this.timer !== 'undefined') {
                clearInterval(this.timer);
                this.timer = undefined;
            }
        });
        this.document.getElementById('bbt-chinese-splitname').setAttribute('disabled', Preference.chinese ? '' : 'true');
        this.autoexport.load();
        this.document.getElementById('bbt-preferences-quickcopy').addEventListener('command', () => this.showQuickCopyDetails());
        this.showQuickCopyDetails();
        this.checkCitekeyFormat();
        this.checkPostscript();
        this.refresh();
        if (typeof this.timer === 'undefined')
            this.timer = setInterval(this.refresh.bind(this), 500);
    }
    showQuickCopyDetails() {
        const quickcopy = 'bbt-preferences-quickcopy-details';
        const selected = `${quickcopy}-${Zotero.Prefs.get('translators.better-bibtex.quickCopyMode')}`;
        for (const details of [...this.document.querySelectorAll(`.${quickcopy}`)]) {
            details.style.display = details.id === selected ? 'initial' : 'none';
        }
    }
    refresh() {
        if (!this.window)
            return;
        this.showQuickCopyDetails();
        this.autoexport.refresh();
    }
};
