namespace XUL {
  class Element extends HTMLElement {
    public hidden: boolean
  }

  class Textbox extends HTMLElement{
    public value: string
    public hidden: boolean
    public readonly: boolean
  }

  class Checkbox extends HTMLElement {
    public hidden: boolean
    public checked: boolean
  }

  class Menuitem extends HTMLElement {
    public value: string
    public label: string
  }

  class Menupopup extends HTMLElement {
    public children: Menuitem[]
  }

  class Menulist extends HTMLElement {
    public firstChild: Menupopup
    public selectedItem: Menuitem
    public value: string
  }
}
