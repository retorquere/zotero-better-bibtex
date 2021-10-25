export namespace XUL {
  class Element extends HTMLElement {
    public tagName: string
    public hidden: boolean
    public getAttribute(name: string): string
    public setAttribute(name: string, value: string): void
    public classList: ClassList
  }
  
  class Label extends Element {
    public value: string
  }
  
  class Textbox extends XUL.Element {
    public value: string
    public readonly: boolean
  }
  
  class Checkbox extends XUL.Element {
    public checked: boolean
  }
  
  class Menuitem extends XUL.Element {
    public value: string
    public label: string
  }
  
  class ProgressMeter extends XUL.Element {
    public value: string | number
  }
  
  class Menupopup extends XUL.Element {
    public children: Menuitem[]
  }
  
  class Menulist extends XUL.Element {
    public firstChild: Menupopup
    public selectedItem: Menuitem
    public value: string
  }
}

class ClassList {
  public add(classname: string): void
  public remove(classname: string): void
  public contains(classname: string): boolean
}

