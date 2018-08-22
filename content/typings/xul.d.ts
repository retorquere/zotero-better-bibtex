interface IXUL_Element { // tslint:disable-line:class-name
  hidden: boolean
}

interface IXUL_Textbox { // tslint:disable-line:class-name
  value: string
  hidden: boolean
  readonly: boolean
}

interface IXUL_Element { // tslint:disable-line:class-name
  hidden: boolean
}

interface IXUL_Checkbox { // tslint:disable-line:class-name
  hidden: boolean
  checked: boolean
}

interface IXUL_Menuitem { // tslint:disable-line:class-name
  value: string
  label: string
}
interface IXUL_Menupopup { // tslint:disable-line:class-name
  children: IXUL_Menuitem[] // menupopup
}
interface IXUL_Menulist { // tslint:disable-line:class-name
  firstChild: IXUL_Menupopup
  selectedItem: IXUL_Menuitem
  value: string
}

