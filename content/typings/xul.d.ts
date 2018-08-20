interface IXUL_Element { // tslint:disable-line:class-name
  hidden: boolean
}

interface IXUL_Label { // tslint:disable-line:class-name
  label: string
  hidden: boolean
}

interface IXUL_Checkbox { // tslint:disable-line:class-name
  hidden: boolean
  checked: boolean
}

interface IXUL_Menuitem { // tslint:disable-line:class-name
  value: string
}
interface IXUL_Menupopup { // tslint:disable-line:class-name
  children: IXUL_Menuitem[] // menupopup
}
interface IXUL_Menulist { // tslint:disable-line:class-name
  children: IXUL_Menupopup[] // menupopup
  selectedItem: IXUL_Menuitem
}

