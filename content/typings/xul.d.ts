namespace XUL {
  class Element {
    public hidden: boolean
  }

  class Textbox {
    public value: string
    public hidden: boolean
    public readonly: boolean
  }

  class Element {
    public hidden: boolean
  }

  class Checkbox {
    public hidden: boolean
    public checked: boolean
  }

  class Menuitem {
    public value: string
    public label: string
  }

  class Menupopup {
    public children: Menuitem[] // menupopup
  }

  class Menulist {
    public firstChild: Menupopup
    public selectedItem: Menuitem
    public value: string
  }
}
